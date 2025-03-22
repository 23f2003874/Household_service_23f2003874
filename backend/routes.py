from flask import current_app as app, jsonify, request, render_template,send_file
from flask_security import auth_required, roles_required, login_user, current_user
from werkzeug.security import check_password_hash, generate_password_hash
from .model import db, User, Role, Service, Customer, ServiceProfessional, ServiceRequest
import uuid
from datetime import datetime
from datetime import date  # For handling dates
from sqlalchemy.sql import func  # For database functions like date filtering
from backend.celery.tasks import add,create_csv
from celery.result import AsyncResult 


cache= app.cache

# ====================== Home Route ======================
@app.route('/', methods=['GET'])
def home():
    return render_template("index.html")


@app.get('/celery')
def celery():
    task=add.delay(10,20)
    return {'task_id':task.id}


@auth_required('token') 
@app.get('/get-csv/<id>')
def getCSV(id):
    result = AsyncResult(id)

    if result.ready():
        return send_file(f'./backend/celery/user-downloads/{result.result}'), 200
    else:
        return {'message' : 'task not ready'}, 405

@auth_required('token') 
@app.get('/create-csv')
def createCSV():
    task = create_csv.delay()
    return {'task_id' : task.id}, 200
#======Cache++++++======
@app.get('/cache')
@cache.cached(timeout=5)
def cache():
    return {'time': str(datetime.now())}


# ====================== User Login ======================
@app.route("/api/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password, password):
        return jsonify({"message": "Invalid email or password"}), 401

    login_user(user)
    auth_token = user.get_auth_token()
    role = user.roles[0].name if user.roles else "customer"

    # Fetch status based on user type
    status = None
    if role == "customer":
        customer = Customer.query.filter_by(user_id=user.id).first()
        status = customer.status if customer else None
    elif role == "professional":
        professional = ServiceProfessional.query.filter_by(user_id=user.id).first()
        status = professional.status if professional else None

    print(f"✅ Login Response: User={user.username}, Role={role}, Status={status}")  # Debugging

    return jsonify({
        "auth-token": auth_token,
        "id": user.id,
        "username": user.username,
        "role": role,
        "status": status  # ✅ Include status in response
    })



# ====================== Customer Registration ======================
@app.route('/api/register', methods=['POST'])
def register_customer():
    try:
        data = request.get_json()

        # Validate required fields
        required_fields = ["username", "email", "password", "phone_number", "address", "pin_code"]
        if not all(field in data and data[field] for field in required_fields):
            return jsonify({"message": "All fields are required!"}), 400

        # Check if email already exists
        if app.security.datastore.find_user(email=data["email"]):
            return jsonify({"message": "Email already registered"}), 400

        # Create new User in Flask-Security Datastore
        user = app.security.datastore.create_user(
            email=data["email"],
            username=data["username"],
            password=generate_password_hash(data["password"]),        # ✅ Added
            roles=["customer"],
            fs_uniquifier=str(uuid.uuid4())  # Unique identifier
        )
        db.session.commit()  # Commit user creation

        # Create corresponding Customer entry with additional details
        new_customer = Customer(
            user_id=user.id,
            email=data["email"],
            username=data["username"],
            phone_number=data["phone_number"],
            address=data["address"],
            pin_code=data["pin_code"],
            status="active"
        )
        db.session.add(new_customer)
        db.session.commit()  # Save Customer entry

        return jsonify({"message": "Customer registered successfully", "user_id": user.id}), 201

    except Exception as e:
        db.session.rollback()  # Rollback in case of failure
        return jsonify({"error": str(e)}), 500



#==================== PROFESSIONAL REGISTRATION  ===============================
@app.route('/api/register/professional', methods=['POST'])
def register_professional():
    try:
        data = request.get_json()

        required_fields = ["username", "email", "password", "phone_number", "address", "pin_code", "experience", "service_id"]
        if not all(field in data and data[field] for field in required_fields):
            return jsonify({"message": "All fields are required!"}), 400

        if app.security.datastore.find_user(email=data["email"]):
            return jsonify({"message": "Email already registered"}), 400

        service = Service.query.get(data["service_id"])
        if not service:
            return jsonify({"message": "Invalid service selected"}), 400

        # ✅ Create User FIRST
        user = app.security.datastore.create_user(
            email=data["email"],
            username=data["username"],
            password=generate_password_hash(data["password"]),
            roles=["professional"],
            fs_uniquifier=str(uuid.uuid4())
        )
        db.session.commit()  # ✅ Ensure user is saved in DB

        # ✅ Fetch user again to ensure it's correctly created
        user = app.security.datastore.find_user(email=data["email"])
        if not user:
            return jsonify({"error": "User creation failed"}), 500

        print(f"✅ Created User: {user.id}, {user.username}, {user.email}")  # Debugging

        # ✅ Insert Professional entry
        new_professional = ServiceProfessional(
            user_id=user.id,
            username=user.username,  # ✅ Ensure username is not None
            email=user.email,  
            phone_number=data["phone_number"],
            address=data["address"],
            pin_code=data["pin_code"],
            experience=data["experience"],
            service_id=data["service_id"],
            status="inactive"
        )

        db.session.add(new_professional)
        db.session.commit()  # ✅ Ensure professional is saved

        return jsonify({"message": "Professional registered successfully", "user_id": user.id}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500


# ====================== Admin Dashboard     Admin Summary routes======================

@app.route("/api/admin", methods=["GET"])
@auth_required("token")
@roles_required("admin")
def get_admin():
    current_admin = User.query.first()  # Assuming one admin exists
    if not current_admin:
        return jsonify({"error": "Admin not found"}), 404
    return jsonify({"username": current_admin.username})


@app.route('/api/admin/summary', methods=['GET'])
def get_summary():
    summary_data = {
        "services": db.session.query(func.count(Service.id)).scalar(),
        "customers": db.session.query(func.count(Customer.id)).scalar(),
        "professionals": db.session.query(func.count(ServiceProfessional.id)).scalar(),
        "service_requests": db.session.query(func.count(ServiceRequest.id)).scalar(),
        "request_status": {
            "requested": db.session.query(func.count(ServiceRequest.id)).filter_by(service_status="requested").scalar(),
            "closed": db.session.query(func.count(ServiceRequest.id)).filter_by(service_status="closed").scalar(),
            "approved": db.session.query(func.count(ServiceRequest.id)).filter_by(service_status="approved").scalar(),
            "rejected": db.session.query(func.count(ServiceRequest.id)).filter_by(service_status="rejected").scalar(),
        }
    }
    return jsonify(summary_data)



# ====================== Professional Dashboard ======================

#=============================== PROFESSIONAL ROUTES===========================
@app.route("/api/professional/dashboard", methods=["GET"])
@auth_required("token")
@roles_required("professional")
def professional_dashboard():
    professional = ServiceProfessional.query.filter_by(user_id=current_user.id).first()
    if not professional:
        return jsonify({"error": "Professional details not found"}), 404

    today = date.today()

    # ✅ Today's Services (Only "requested" services)
    today_services = (
        ServiceRequest.query.filter_by(professional_id=professional.id, service_status="requested")
        .filter(func.date(ServiceRequest.date_of_request) == today)
        .join(Customer, ServiceRequest.customer_id == Customer.id)
        .all()
    )

    # ✅ Service History (approved, in-progress, closed, rejected, and canceled)
    service_history = (
        ServiceRequest.query.filter(ServiceRequest.professional_id == professional.id)
        .filter(ServiceRequest.service_status.in_(["approved", "in-progress", "closed", "rejected", "canceled"]))
        .join(Customer, ServiceRequest.customer_id == Customer.id)
        .order_by(ServiceRequest.date_of_completion.desc())
        .all()
    )

    return jsonify({
        "message": f"Welcome Professional {professional.username}!",
        "user_id": current_user.id,
        "professional_id": professional.id,
        "username": professional.username,
        "email": professional.email,
        "phone_number": professional.phone_number,
        "address": professional.address,
        "pin_code": professional.pin_code,
        "status": professional.status,
        "rating": professional.rating,
        "today_services": [{
            "service_id": service.id,
            "customer_name": service.customer.username,
            "phone_number": service.customer.phone_number,
            "address": service.customer.address,
            "pincode": service.customer.pin_code,
            "status": service.service_status,
            "date_of_request": service.date_of_request.strftime("%Y-%m-%d")
        } for service in today_services],
        "closed_services": [{
            "service_id": service.id,
            "customer_name": service.customer.username,
            "address": service.customer.address,
            "phone_number": service.customer.phone_number,
            "pincode": service.customer.pin_code,
            "status": service.service_status,
            "date_of_request": service.date_of_request.strftime("%Y-%m-%d"),
            "date_of_completion": service.date_of_completion.strftime("%Y-%m-%d") if service.date_of_completion else None,
            "remarks": service.remarks,
            "rating": service.rating
        } for service in service_history]
    })


@app.route("/api/professional/accept/<int:service_id>", methods=["POST"])
@auth_required("token")
@roles_required("professional")
def accept_service(service_id):
    service = ServiceRequest.query.get(service_id)
    
    if not service:
        return jsonify({"error": "Service request not found"}), 404

    if service.service_status != "requested":
        return jsonify({"error": "Service is not in requested status"}), 400

    # Update status to "approved"
    service.service_status = "approved"
    db.session.commit()

    return jsonify({"message": "Service request approved successfully"}), 200


@app.route("/api/professional/reject/<int:service_id>", methods=["POST"])
@auth_required("token")
@roles_required("professional")
def reject_service(service_id):
    service = ServiceRequest.query.get(service_id)
    
    if not service:
        return jsonify({"error": "Service request not found"}), 404

    if service.service_status != "requested":
        return jsonify({"error": "Service is not in requested status"}), 400

    # Update status to "rejected"
    service.service_status = "rejected"
    db.session.commit()

    return jsonify({"message": "Service request rejected successfully"}), 200

@app.route("/api/professional/service-requests", methods=["GET"])
@auth_required("token")
@roles_required("professional")
def professional_service_requests():
    # Get the logged-in professional
    professional = ServiceProfessional.query.filter_by(user_id=current_user.id).first()

    if not professional:
        return jsonify({"error": "Professional details not found"}), 404

    # Fetch all service requests assigned to this professional
    service_requests = ServiceRequest.query.filter_by(professional_id=professional.id).all()

    # Format the response
    service_requests_data = []
    for req in service_requests:
        service_requests_data.append({
            "id": req.id,  # ✅ Matches frontend 'request.id'
            "status": req.service_status,  # ✅ Needed for Approve/Reject buttons
            "customer": {
                "username": req.customer.username,  # ✅ Matches frontend 'customer.username'
                "phone_number": req.customer.phone_number,  # ✅ Matches frontend 'customer.phone_number'
                "address": req.customer.address,  # ✅ Matches frontend 'customer.address'
                "pin_code": req.customer.pin_code,  # ✅ Matches frontend 'customer.pin_code'
            }
        })

    return jsonify({
        "professional_id": professional.id,
        "newServiceRequests": service_requests_data  # ✅ Matches Vue's `newServiceRequests`
    })

@app.route("/api/professional/service-history", methods=["GET"])
@auth_required("token")
@roles_required("professional")
def get_get_service_history():
    professional = ServiceProfessional.query.filter_by(user_id=current_user.id).first()
    if not professional:
        return jsonify({"error": "Professional not found"}), 404

    closed_services = (
        ServiceRequest.query
        .filter_by(professional_id=professional.id)
        .filter(ServiceRequest.service_status != "requested")  # ✅ Fetch all non-requested services
        .order_by(ServiceRequest.date_of_completion.desc())
        .all()
    )

    return jsonify([
        {
            "service_id": service.id,
            "customer_name": service.customer.username,
            "address": service.customer.address,
            "phone_number": service.customer.phone_number,
            "pincode": service.customer.pin_code,
            "date_of_request": service.date_of_request.strftime("%Y-%m-%d"),
            "date_of_completion": service.date_of_completion.strftime("%Y-%m-%d") if service.date_of_completion else None,
            "rating": service.rating,
            "remarks": service.remarks,
            "status": service.service_status
        }
        for service in closed_services
    ])




@app.route('/api/professional/<int:professional_id>/summary', methods=['GET'])
def get_professional_summary(professional_id):
    """Returns the summary of a specific professional"""

    # Count unique customers who requested services from this professional
    customer_count = (
        db.session.query(func.count(func.distinct(ServiceRequest.customer_id)))
        .filter(ServiceRequest.professional_id == professional_id)
        .scalar()
    ) or 0  

    # Count service requests assigned to this professional based on status
    request_status = {
        "requested": db.session.query(func.count(ServiceRequest.id))
                      .filter(ServiceRequest.professional_id == professional_id, ServiceRequest.service_status == "requested")
                      .scalar() or 0,
        "closed": db.session.query(func.count(ServiceRequest.id))
                  .filter(ServiceRequest.professional_id == professional_id, ServiceRequest.service_status == "closed")
                  .scalar() or 0,
        "approved": db.session.query(func.count(ServiceRequest.id))
                    .filter(ServiceRequest.professional_id == professional_id, ServiceRequest.service_status == "approved")
                    .scalar() or 0,
        "rejected": db.session.query(func.count(ServiceRequest.id))
                    .filter(ServiceRequest.professional_id == professional_id, ServiceRequest.service_status == "rejected")
                    .scalar() or 0,
    }

    # Count total service requests assigned to this professional
    total_requests = (
        db.session.query(func.count(ServiceRequest.id))
        .filter(ServiceRequest.professional_id == professional_id)
        .scalar()
    ) or 0  

    # Get the service name assigned to this professional
    service_name = (
        db.session.query(Service.name)
        .join(ServiceProfessional, ServiceProfessional.service_id == Service.id)
        .filter(ServiceProfessional.id == professional_id)
        .scalar()
    ) or "N/A"  

    # Return the summary data
    summary_data = {
        "customer_count": customer_count,
        "request_status": request_status,
        "total_service_requests": total_requests,
        "service_name": service_name
    }

    return jsonify(summary_data)




@app.route('/api/auth/user', methods=['GET'])
@auth_required()
def get_logged_in_user():
    """Returns details of the currently logged-in professional"""
    if current_user.is_authenticated:
        roles = [role.name for role in current_user.roles]  # Extract role names

        # Fetch the corresponding Professional ID (if user is a professional)
        professional = ServiceProfessional.query.filter_by(user_id=current_user.id).first()

        return jsonify({
            "user_id": current_user.id,  # Authenticated User ID
            "professional_id": professional.id if professional else None,  # Professional ID from ServiceProfessional table
            "email": current_user.email,
            "roles": roles
        })
    return jsonify({"error": "Unauthorized"}), 401



# ====================== User Logout ======================
@app.route("/api/logout", methods=["POST"])
@auth_required("token")
def logout():
    return jsonify({"message": "Logged out successfully!"})


# ====================== Get Services ======================
# @app.route("/api/services", methods=["GET"])
# @auth_required("token")
# def get_services():
#     services = Service.query.all()
#     return jsonify([{ "id": s.id, "name": s.name } for s in services])






@app.route("/api/professional/services", methods=["GET"])
def get_professional_services():
    services = Service.query.all()
    return jsonify([{ "id": s.id, "name": s.name } for s in services])



#-----------   Customer apis -----------#

#------------------------------------------ ALL CUSTOMER ROUTE ==================================================
@app.route('/api/customer/dashboard', methods=['GET'])
@auth_required("token")
def customer_dashboard():
    print(f"🟢 Current user ID: {current_user.id}")  # Debug log

    customer = Customer.query.filter_by(user_id=current_user.id).first()

    if not customer:
        print("⚠️ No customer found!")  # Debug log
        return jsonify({"error": "Customer not found"}), 404

    print(f"✅ Customer ID from DB: {customer.id}")  # Debug log

    return jsonify({
        "message": f"Welcome Customer {current_user.username}!",
        "user_id": current_user.id,  
        "customer_id": customer.id,  # ✅ This should match the correct customer_id
        "username": current_user.username
    })

@app.route("/api/customer/services", methods=["GET"])
@auth_required("token")
def get_customer_services():
    services = Service.query.all()
    service_list = [
        {
            "id": service.id,
            "name": service.name,
            "description": service.description,
            "base_price": service.base_price,
            "time_required": service.time_required,
            "professionals": [
                {
                    "id": sp.id,
                    "name": sp.user.username if sp.user else "Unknown",
                    "experience": sp.experience
                }
                for sp in service.professionals if sp.status == "active"  # ✅ Fetch only active professionals
            ]
        }
        for service in services
    ]
    return jsonify(service_list)

# @app.route("/api/customer/services", methods=["GET"])
# @auth_required("token")
# def get_customer_services():
#     services = Service.query.all()
#     service_list = [
#         {
#             "id": service.id,
#             "name": service.name,
#             "description": service.description,
#             "base_price": service.base_price,
#             "time_required": service.time_required,
#             "professionals": [
#                 {
#                     "id": sp.id,
#                     "name": sp.user.username if sp.user else "Unknown",  # ✅ Ensure full name
#                     "experience": sp.experience  # ✅ Include experience
#                 }
#                 for sp in service.professionals  # ✅ Fetch linked professionals
#             ]
#         }
#         for service in services
#     ]
#     return jsonify(service_list)


@app.route("/api/customer/book_service", methods=["POST"])
@auth_required("token")
def book_service():
    data = request.json
    service_id = data.get("service_id")
    pro_id = data.get("pro_id")  # ✅ Get selected pro_id
    
    customer = Customer.query.filter_by(user_id=current_user.id).first()
    if not customer:
        return jsonify({"error": "Customer not found"}), 404
    
    service = Service.query.get(service_id)
    if not service:
        return jsonify({"success": False, "message": "Service not found."}), 400

    professional = ServiceProfessional.query.get(pro_id)  # ✅ Find selected pro
    if not professional:
        return jsonify({"success": False, "message": "Selected professional not found."}), 400

    # Create a new service request with the selected professional
    new_request = ServiceRequest(
        customer_id=customer.id,
        professional_id=professional.id,
        service_id=service.id,
        service_status="requested"
    )

    db.session.add(new_request)
    db.session.commit()

    return jsonify({"success": True, "message": "Service booked successfully."})



@app.route('/api/customer/<int:customer_id>/service_history/<int:service_id>/date_of_request', methods=['PUT'])
@auth_required("token")
def update_service_date(customer_id, service_id):
    data = request.get_json()

    try:
        print(f"🔍 Checking Authorization: current_user.id = {current_user.id}, Target customer_id = {customer_id}")

        customer = Customer.query.filter_by(id=customer_id).first()
        if not customer:
            print("❌ Customer Not Found in DB!")
            return jsonify({"error": "Customer not found"}), 404

        if customer.user_id != current_user.id:
            print(f"❌ Unauthorized Access! customer.user_id = {customer.user_id}, current_user.id = {current_user.id}")
            return jsonify({"error": "Unauthorized access"}), 403
        
        # Fetch service request
        service_request = ServiceRequest.query.filter_by(id=service_id, customer_id=customer_id).first()
        if not service_request:
            return jsonify({"error": "Service request not found"}), 404

        # ❌ Restrict editing if status is not 'requested'
        if service_request.service_status not in ["requested"]:
            return jsonify({"error": "You cannot edit the date for this request because it has been processed."}), 403

        # Convert and update the date
        new_date = datetime.strptime(data["date_of_request"], "%Y-%m-%d").date()
        service_request.date_of_request = new_date
        db.session.commit()

        return jsonify({"message": "Date updated successfully"}), 200

    except ValueError:
        return jsonify({"error": "Invalid date format. Expected YYYY-MM-DD"}), 400
    except Exception as e:
        return jsonify({"error": f"Error updating date: {str(e)}"}), 500


@app.route("/api/customer/<int:customer_id>/service_history", methods=["GET"])
@auth_required("token")
def get_service_history(customer_id):
    print(f"🔍 Fetching service history for customer_id: {customer_id}")

    db.session.commit()  # ✅ Ensure database session is up-to-date
    db.session.flush()   # ✅ Ensure changes are reflected

    history = ServiceRequest.query.filter_by(customer_id=customer_id).all()

    if not history:
        print("⚠️ No service history found!")
        return jsonify([])

    history_data = []
    for h in history:
        print(f"➡️ Service ID: {h.id}, Status: {h.service_status}, Rating: {h.rating}, Remarks: {h.remarks}")

        history_data.append({
            "id": h.id,
            "customer_id": h.customer_id,
            "customer_name": h.customer.user.username if h.customer and h.customer.user else "N/A",
            "service_name": h.service.name if h.service else "Unknown",
            "professional_id": h.professional.id if h.professional else None,
            "professional_username": h.professional.user.username if h.professional and h.professional.user else "N/A",
            "professional_email": h.professional.user.email if h.professional and h.professional.user else "N/A",
            "phone_no": h.professional.phone_number if h.professional else "N/A",
            "date_of_request": h.date_of_request,
            "date_of_completion": h.date_of_completion,
            "rating": h.rating if hasattr(h, "rating") else None, 
            "remark": h.remarks if hasattr(h, "remarks") else None,  # ✅ Fix: Use `remarks` instead of `remark`
            "status": h.service_status  # ✅ Ensure updated status is fetched
        })

    return jsonify(history_data)




@app.route("/api/customer/service_history/<int:service_id>/review", methods=["POST"])
@auth_required("token")
def submit_review(service_id):
    data = request.json
    rating = data.get("rating")
    remark = data.get("remark")

    service = ServiceRequest.query.get(service_id)
    if not service:
        return jsonify({"message": "Service history not found"}), 404

    # ✅ Update rating, remark, and status
    service.rating = rating
    service.remarks = remark
    service.service_status = "closed"
    service.date_of_completion = datetime.utcnow()

    db.session.flush()  # ✅ Immediately reflect changes
    db.session.commit()
    # db.session.refresh(service)  # ✅ Ensure fresh data is loaded

    print(f"✅ Review Updated: {service.service_id}, Status={service.service_status}, Rating={service.rating}, Remarks={service.remarks}")

    return jsonify({
        "message": "Review submitted successfully!",
        "service_id": service.service_id,
        "status": service.service_status,  
        "rating": service.rating,
        "remarks": service.remarks
    })


#-----------Custommer route h upr--------------============================================

