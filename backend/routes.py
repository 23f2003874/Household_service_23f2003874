from flask import current_app as app, jsonify, request, render_template
from flask_security import auth_required, roles_required, login_user, current_user
from werkzeug.security import check_password_hash, generate_password_hash
from .model import db, User, Role, Service, Customer, ServiceProfessional, ServiceRequest
import uuid
from datetime import datetime

# ====================== Home Route ======================
@app.route('/', methods=['GET'])
def home():
    return render_template("index.html")


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

    return jsonify({
        "auth-token": auth_token,
        "id": user.id,
        "username": user.username,
        "role": role
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


# ====================== Admin Dashboard ======================

@app.route("/api/admin", methods=["GET"])
@auth_required("token")
@roles_required("admin")
def get_admin():
    current_admin = User.query.first()  # Assuming one admin exists
    if not current_admin:
        return jsonify({"error": "Admin not found"}), 404
    return jsonify({"username": current_admin.username})


# ====================== Customer Dashboard =====================

# ====================== Professional Dashboard ======================
@app.route("/api/professional/dashboard", methods=["GET"])
@auth_required("token")
@roles_required("professional")
def professional_dashboard():
    return jsonify({
        "message": f"Welcome Professional {current_user.username}!",
        "user_id": current_user.id,
        "username": current_user.username
    })


# ====================== User Logout ======================
@app.route("/api/logout", methods=["POST"])
@auth_required("token")
def logout():
    return jsonify({"message": "Logged out successfully!"})


# ====================== Get Services ======================
@app.route("/api/services", methods=["GET"])
@auth_required("token")
def get_services():
    services = Service.query.all()
    return jsonify([{ "id": s.id, "name": s.name } for s in services])




# ====================== Get Service Professionals ======================
# @app.route("/api/professionals", methods=["GET"])
# @auth_required("token")
# def get_professionals():
#     professionals = ServiceProfessional.query.all()
#     return jsonify([{ "id": p.id, "name": p.user.username } for p in professionals])


# ====================== Get Customers ======================
# @app.route("/api/customers", methods=["GET"])
# @auth_required("token")
# def get_customers():
#     customers = Customer.query.all()
#     return jsonify([{ "id": c.id, "name": c.user.username } for c in customers])


# # ====================== Get Service Requests ======================
# @app.route("/api/service-requests", methods=["GET"])
# @auth_required("token")
# def get_service_requests():
#     requests = ServiceRequest.query.all()
#     return jsonify([{ "id": r.id, "status": r.status } for r in requests])




@app.route("/api/professional/services", methods=["GET"])
def get_professional_services():
    services = Service.query.all()
    return jsonify([{ "id": s.id, "name": s.name } for s in services])

# @app.route("/api/professional/services", methods=["GET"])
# def get_professional_services():
#     professional_id = request.args.get("professional_id")
#     service_status = request.args.get("service_status")  # Optional filter

#     if not professional_id:
#         return jsonify({"error": "Professional ID is required"}), 400

#     professional = ServiceProfessional.query.get(professional_id)
#     if not professional:
#         return jsonify({"error": "Professional not found"}), 404

#     # Base query
#     query = ServiceRequest.query.filter_by(professional_id=professional_id)

#     # Apply status filter if provided
#     if service_status:
#         query = query.filter_by(service_status=service_status)

#     services = query.all()

#     return jsonify([
#         {
#             "id": service.id,
#             "customer_id": service.customer_id,
#             "date_of_request": service.date_of_request.strftime('%Y-%m-%d'),
#             "date_of_completion": service.date_of_completion.strftime('%Y-%m-%d') if service.date_of_completion else None,
#             "service_status": service.service_status,
#             "remarks": service.remarks or "N/A"
#         }
#         for service in services
#     ])

# @app.route("/api/professional/new_services", methods=["GET"])
# @auth_required("token")
# def get_new_services():
#     professional_id = current_user.id  # Get logged-in professional ID
#     new_services = ServiceRequest.query.filter_by(professional_id=professional_id, service_status='requested').all()
    
#     return jsonify([
#         {
#             "id": service.id,
#             "customer_name": service.customer.username,
#             "address": service.customer.address,
#             "phone": service.customer.phone,
#             "date_of_request": service.date_requested
#         } for service in new_services
#     ])


# @app.route("/api/professional/closed_services", methods=["GET"])
# @auth_required("token")
# def get_closed_services():
#     professional_id = current_user.id
#     closed_services = ServiceRequest.query.filter_by(professional_id=professional_id, service_status='').all()
    
#     return jsonify([
#         {
#             "id": service.id,
#             "customer_name": service.customer.username,
#             "address": service.customer.address,
#             "phone": service.customer.phone,
#             "date_of_request": service.date_requested,
#             "date_of_completion": service.date_completed,
#             "rating": service.rating
#         } for service in closed_services
#     ])


# @app.route("/api/professional/new_services", methods=["GET"])
# def get_new_services():
#     """Fetch services with 'requested' status"""
#     new_services = Service.query.filter_by(service_status="requested").all()
#     return jsonify([
#         {
#             "id": s.id,
#             "customer_name": s.customer_name,
#             "address": s.address,
#             "phone": s.phone,
#             "date_of_request": s.date_of_request.strftime("%Y-%m-%d")
#         }
#         for s in new_services
#     ])
# from flask import jsonify

# @app.route("/api/professional/new_services", methods=["GET"])
# def get_new_services():
#     try:
#         new_services = ServiceRequest.query.filter_by(service_status="requested").all()
#         return jsonify([
#             {
#                 "id": s.id,
#                 "customer_name": s.customer.id,
#                 "address": s.customer.address,
#                 "phone": s.customer.phone_number,
#                 "date_of_request": s.date_of_request.strftime("%Y-%m-%d")
#             }
#             for s in new_services
#         ])
#     except Exception as e:
#         print(f"Error in get_new_services: {e}")
#         return jsonify({"error": "Internal Server Error"}), 500
# @app.route('/api/professional/new_services', methods=['GET'])
# @auth_required('token')
# def get_new_services():
#     try:
#         user = current_user  # Ensure this is fetching correctly
#         if not user:
#             return jsonify({'error': 'User not found'}), 404  # Early return if user is None

#         new_services = ServiceRequest.query.filter_by(professional_id=user.id, service_status='requested').all()

#         # Check if any None values exist
#         if not new_services:
#             return jsonify([])  # Return an empty list instead of None

#         return jsonify([
#             {
#                 'id': service.id,
#                 'customer_name': service.customer.name if service.customer else 'Unknown',
#                 'address': service.customer.address if service.customer else 'Unknown',
#                 'phone': service.customer.phone if service.customer else 'Unknown',
#                 'date_of_request': service.date_of_request,
#                 'status': service.status
#             }
#             for service in new_services
#         ])
#     except Exception as e:
#         print(f"Error in get_new_services: {str(e)}")
#         return jsonify({'error': 'Internal Server Error'}), 500


# @app.route("/api/professional/closed_services", methods=["GET"])
# def get_closed_services():
#     try:
#         closed_services = ServiceRequest.query.filter_by(service_status="closed").all()
#         return jsonify([
#             {
#                 "id": s.id,
#                 "customer_name": s.customer.id,
#                 "address": s.customer.address,
#                 "phone": s.customer.phone_number,
#                 "date_of_request": s.date_of_request.strftime("%Y-%m-%d"),
#                 "date_of_completion": s.date_of_completion.strftime("%Y-%m-%d") if s.date_of_completion else "",
#                 "rating": s.rating
#             }
#             for s in closed_services
#         ])
#     except Exception as e:
#         print(f"Error in get_closed_services: {e}")
#         return jsonify({"error": "Internal Server Error"}), 500




@app.route("/api/professional/new_services", methods=["GET"])
def get_new_services():
    professional_id = request.args.get("professional_id")
    if not professional_id:
        return jsonify({"error": "Professional ID is required"}), 400

    services = ServiceRequest.query.filter_by(professional_id=professional_id, service_status="requested").all()
    service_data = []
    
    for service in services:
        customer = Customer.query.get(service.customer_id)
        user = User.query.get(customer.user_id) if customer else None
        
        service_data.append({
            "id": service.id,
            "customer_id": service.customer_id,
            "customer_name": user.username if user else "Unknown",
            "address": customer.address if customer else "Unknown",
            "date_of_request": service.date_of_request,
            "service_status": service.service_status
        })
    
    return jsonify({"services": service_data})

@app.route("/api/professional/closed_services", methods=["GET"])
def get_closed_services():
    professional_id = request.args.get("professional_id")
    if not professional_id:
        return jsonify({"error": "Professional ID is required"}), 400

    services = ServiceRequest.query.filter_by(professional_id=professional_id, service_status="closed").all()
    service_data = []
    
    for service in services:
        customer = Customer.query.get(service.customer_id)
        user = User.query.get(customer.user_id) if customer else None
        
        service_data.append({
            "id": service.id,
            "customer_id": service.customer_id,
            "customer_name": user.username if user else "Unknown",
            "address": customer.address if customer else "Unknown",
            "date_of_request": service.date_of_request,
            "date_of_completion": service.date_of_completion,
            "service_status": service.service_status,
            "remarks": service.remarks,
            "rating": service.rating
        })
    
    return jsonify({"services": service_data})

# @app.route("/api/professional/accept_request/<int:request_id>", methods=["POST"])
# def accept_request(request_id):
#     service_request = ServiceRequest.query.get(request_id)
#     if service_request:
#         service_request.service_status = "accepted"
#         db.session.commit()
#         return jsonify({"message": "Service request accepted successfully."})
#     return jsonify({"error": "Service request not found."}), 404

# @app.route("/api/professional/reject_request/<int:request_id>", methods=["POST"])
# def reject_request(request_id):
#     service_request = ServiceRequest.query.get(request_id)
#     if service_request:
#         service_request.service_status = "rejected"
#         db.session.commit()
#         return jsonify({"message": "Service request rejected successfully."})
#     return jsonify({"error": "Service request not found."}), 404


# @app.route("/api/professional/services", methods=["GET"])
# def get_professional_services():
#     """Fetch all services for a professional with filtering options."""
#     professional_id = request.args.get("professional_id")
#     service_status = request.args.get("service_status")  # Optional filter

#     if not professional_id:
#         return jsonify({"error": "Professional ID is required"}), 400

#     professional = ServiceProfessional.query.get(professional_id)
#     if not professional:
#         return jsonify({"error": "Professional not found"}), 404

#     # Base query for professional services
#     query = ServiceRequest.query.filter_by(professional_id=professional_id)

#     # Apply status filter if provided
#     if service_status:
#         query = query.filter_by(service_status=service_status)

#     services = query.all()

#     return jsonify([
#         {
#             "id": service.id,
#             "customer": {
#                 "full_name": service.customer.user.username,
#                 "phone_number": service.customer.phone_number,
#                 "address": service.customer.address,
#                 "pin_code": service.customer.pin_code,
#             },
#             "date_of_request": service.date_of_request.strftime('%Y-%m-%d'),
#             "date_of_completion": service.date_of_completion.strftime('%Y-%m-%d') if service.date_of_completion else None,
#             "service_status": service.service_status,
#             "remarks": service.remarks or "N/A"
#         }
#         for service in services
#     ])

@app.route("/api/professional/approve_request", methods=["POST"])
def approve_service_request():
    """Approve a service request (change status to 'accepted')."""
    data = request.get_json()
    request_id = data.get("request_id")

    service = ServiceRequest.query.get(request_id)
    if not service:
        return jsonify({"error": "Service request not found"}), 404

    service.service_status = "accepted"
    db.session.commit()

    return jsonify({"message": "Service request approved successfully"}), 200

@app.route("/api/professional/reject_request", methods=["POST"])
def reject_service_request():
    """Reject a service request (change status to 'rejected')."""
    data = request.get_json()
    request_id = data.get("request_id")

    service = ServiceRequest.query.get(request_id)
    if not service:
        return jsonify({"error": "Service request not found"}), 404

    service.service_status = "rejected"
    db.session.commit()

    return jsonify({"message": "Service request rejected successfully"}), 200

# @app.route("/api/search_services", methods=["GET"])
# def search_services():
#     customer_id = request.args.get("customer_id")
#     customer_name = request.args.get("customer_name")
#     service_status = request.args.get("service_status")
#     address = request.args.get("address")

#     query = ServiceRequest.query
    
#     if customer_id:
#         query = query.filter_by(customer_id=customer_id)
    
#     if service_status:
#         query = query.filter_by(service_status=service_status)
    
#     if address:
#         customers = Customer.query.filter(Customer.address.ilike(f"%{address}%")).all()
#         customer_ids = [customer.id for customer in customers]
#         query = query.filter(ServiceRequest.customer_id.in_(customer_ids))
    
#     if customer_name:
#         users = User.query.filter(User.username.ilike(f"%{customer_name}%")).all()
#         customer_ids = [customer.customer_id for user in users for customer in Customer.query.filter_by(user_id=user.id)]
#         query = query.filter(ServiceRequest.customer_id.in_(customer_ids))

#     results = query.all()
#     service_data = []
    
#     for service in results:
#         customer = Customer.query.get(service.customer_id)
#         user = User.query.get(customer.user_id) if customer else None
        
#         service_data.append({
#             "id": service.id,
#             "customer_id": service.customer_id,
#             "customer_name": user.username if user else "Unknown",
#             "address": customer.address if customer else "Unknown",
#             "date_of_request": service.date_of_request,
#             "service_status": service.service_status
#         })
    
#     return jsonify({"services": service_data})

# @app.route("/api/professional/closed_services", methods=["GET"])
# def get_closed_services():
#     """Fetch services that are either accepted or rejected"""
#     closed_services = Service.query.filter(Service.status.in_(["accepted", "rejected"])).all()
#     return jsonify([
#         {
#             "id": s.id,
#             "customer_name": s.customer_name,
#             "address": s.address,
#             "phone": s.phone,
#             "date_of_request": s.date_of_request.strftime("%Y-%m-%d"),
#             "date_of_completion": s.date_of_completion.strftime("%Y-%m-%d") if s.date_of_completion else "",
#             "status": s.status,
#             "rating": s.rating
#         }
#         for s in closed_services
#     ])

# @app.route("/api/professional/approve_service/<int:service_id>", methods=["POST"])
# def approve_service(service_id):
#     """Approve service request (change status to 'accepted')"""
#     service = Service.query.get(service_id)
#     if not service or service.status != "requested":
#         return jsonify({"message": "Service not found or already processed"}), 404

#     service.status = "accepted"
#     db.session.commit()
#     return jsonify({"message": "Service approved successfully"})

# @app.route("/api/professional/reject_service/<int:service_id>", methods=["POST"])
# def reject_service(service_id):
#     """Reject service request (change status to 'rejected')"""
#     service = Service.query.get(service_id)
#     if not service or service.status != "requested":
#         return jsonify({"message": "Service not found or already processed"}), 404

#     service.status = "rejected"
#     db.session.commit()
#     return jsonify({"message": "Service rejected successfully"})

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
                {"id": sp.id, "name": sp.user.username if sp.user else "Unknown"}
                for sp in service.professionals  # Use 'professionals' instead of 'service_professionals'
            ]
        }
        for service in services
    ]
    return jsonify(service_list)



@app.route("/api/customer/book_service", methods=["POST"])
@auth_required("token")
def book_service():
    data = request.json
    service_id = data.get("service_id")
    
    # ✅ Get the correct Customer ID based on current user
    customer = Customer.query.filter_by(user_id=current_user.id).first()
    if not customer:
        return jsonify({"error": "Customer not found"}), 404
    
    service = Service.query.get(service_id)
    if not service or not service.professionals:
        return jsonify({"success": False, "message": "No professionals available."}), 400

    professional = service.professionals[0]  # Assign first available professional

    new_request = ServiceRequest(
        customer_id=customer.id,  # ✅ Use customer.id instead of user_id
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

        # Check if the logged-in user owns this customer account
        customer = Customer.query.filter_by(id=customer_id).first()
        if not customer:
            print("❌ Customer Not Found in DB!")
            return jsonify({"error": "Customer not found"}), 404

        if customer.user_id != current_user.id:
            print(f"❌ Unauthorized Access! customer.user_id = {customer.user_id}, current_user.id = {current_user.id}")
            return jsonify({"error": "Unauthorized access"}), 403
        
        # Convert and update the date
        new_date = datetime.strptime(data["date_of_request"], "%Y-%m-%d").date()
        service_request = ServiceRequest.query.filter_by(id=service_id, customer_id=customer_id).first()
        if not service_request:
            return jsonify({"error": "Service request not found"}), 404

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

    history = ServiceRequest.query.filter_by(customer_id=customer_id).all()
    
    if not history:
        print("⚠️ No service history found!")
        return jsonify([])

    history_data = []
    for h in history:
        print(f"➡️ Service ID: {h.id}, Customer ID: {h.customer_id}, Customer Object: {h.customer}")

        # Debug customer details
        if h.customer:
            print(f"✅ Customer Exists: ID {h.customer.id}, Username: {h.customer.username}, User: {h.customer.user}")

        history_data.append({
            "id": h.id,
            "customer_id": h.customer_id,
            "customer_name": h.customer.user.username if h.customer and h.customer.user else "N/A",  # ✅ Fix here
            "service_name": h.service.name if h.service else "Unknown",
            "professional_id": h.professional.id if h.professional else None,
            "professional_username": h.professional.user.username if h.professional and h.professional.user else "N/A",
            "professional_email": h.professional.user.email if h.professional and h.professional.user else "N/A",
            "phone_no": h.professional.phone_number if h.professional else "N/A",
            "date_of_request": h.date_of_request,
            "date_of_completion": h.date_of_completion,
            "status": h.service_status
        })

    return jsonify(history_data)


@app.route('/api/customer/service_history/<int:service_id>/review', methods=['POST'])
@auth_required("token")
def close_service_request(service_id):
    data = request.json  # Get request data safely
    rating = data.get("rating")  # Extract rating
    
    if rating is not None:  # Ensure rating is a valid number
        try:
            rating = float(rating)  # Convert to float
        except ValueError:
            return jsonify({"error": "Invalid rating format"}), 400
    
    if rating is not None and (rating < 1 or rating > 5):
        return jsonify({"error": "Rating must be between 1 and 5"}), 400
    
    service_request = ServiceRequest.query.get(service_id)
    if not service_request:
        return jsonify({"error": "Service request not found"}), 404
    
    # Update service request details
    service_request.service_status = "closed"
    service_request.remarks = data.get("remark", "")
    service_request.rating = rating
    
    # Update professional rating (average of completed service ratings)
    professional = service_request.professional
    if professional:
        completed_services = ServiceRequest.query.filter_by(
            professional_id=professional.id, service_status="closed"
        ).all()
        
        total_rating = sum(s.rating for s in completed_services if s.rating is not None)
        professional.rating = total_rating / len(completed_services) if completed_services else 0.0

    db.session.commit()
    return jsonify({"message": "Service request closed with review!"})




# 1️⃣ Fetch Available Services for Customers
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
#                 {"id": sp.id, "name": sp.user.username if sp.user else "Unknown"}
#                 for sp in service.service_professionals
#             ]
#         }
#         for service in services
#     ]
#     return jsonify(service_list)



# @app.route("/api/customer/book_service", methods=["POST"])
# @auth_required("token")  # Ensure token authentication
# def book_service():
#     data = request.json
#     service_id = data.get("service_id")
#     customer_id = current_user.id  # Get logged-in customer

#     service = Service.query.get(service_id)
#     if not service or not service.professionals:
#         return jsonify({"success": False, "message": "No professionals available."}), 400

#     professional = service.professionals[0]  # Assign first available professional

#     new_request = ServiceRequest(
#     customer_id=customer_id,
#     professional_id=professional.id,
#     service_id=service.id,
#     service_status="requested"  # ✅ Correct column name
# )


#     db.session.add(new_request)
#     db.session.commit()

#     # Fetch updated service history after booking
#     updated_history = ServiceRequest.query.filter_by(customer_id=customer_id).all()
#     history_list = [
#         {
#             "id": req.id,
#             "service_name": req.service.name,
#             "professional_username": req.professional.user.username if req.professional else "Unknown",
#             "professional_email": req.professional.user.email if req.professional else "Unknown",
#             "phone_no": req.professional.phone_number if req.professional else "N/A",
#             "address": req.professional.address if req.professional else "N/A",
#             "pincode": req.professional.pin_code if req.professional else "N/A",
#             "status": req.service_status,
#             "reviewed": req.rating
#         }
#         for req in updated_history
#     ]

#     return jsonify({"success": True, "message": "Service booked successfully.", "service_history": history_list})

# @app.route("/api/customer/book_service", methods=["POST"])
# @auth_required("token")  # Ensure token authentication
# def book_service():
#     data = request.json
#     service_id = data.get("service_id")

#     # ✅ Get correct customer_id from current_user
#     customer = Customer.query.filter_by(user_id=current_user.id).first()
#     if not customer:
#         return jsonify({"success": False, "message": "Customer profile not found."}), 404

#     customer_id = customer.id  # ✅ Correct customer_id

#     service = Service.query.get(service_id)
#     if not service or not service.professionals:
#         return jsonify({"success": False, "message": "No professionals available."}), 400

#     professional = service.professionals[0]  # Assign first available professional

#     new_request = ServiceRequest(
#     customer_id=customer_id,
#     professional_id=professional.id,
#     service_id=service.id,
#     service_status="requested"  # ✅ Correct column name
# )
#     # ✅ Check if service exists
#     # service = Service.query.get(service_id)
#     # if not service or len(service.professionals) == 0:
#     #     return jsonify({"success": False, "message": "No professionals available for this service."}), 400

#     # # ✅ Assign the first available professional
#     # professional = service.professionals[0]

#     # # ✅ Create service request
#     # new_request = ServiceRequest(
#     #     customer_id=customer_id,
#     #     professional_id=professional.id,
#     #     service_id=service.id,
#     #     service_status="requested"
#     # )

#     db.session.add(new_request)
#     db.session.commit()

#     # ✅ Fetch updated service history
#     updated_history = ServiceRequest.query.filter_by(customer_id=customer_id).all()
#     history_list = [
#         {
#             "id": req.id,
#             "service_name": req.service.name,
#             "professional_username": req.professional.user.username if req.professional and req.professional.user else "Unknown",
#             "professional_email": req.professional.user.email if req.professional and req.professional.user else "Unknown",
#             "phone_no": req.professional.phone_number if req.professional else "N/A",
#             "address": req.professional.address if req.professional else "N/A",
#             "pincode": req.professional.pin_code if req.professional else "N/A",
#             "status": req.service_status,
#             "reviewed": req.rating if req.rating else "Not rated"
#         }
#         for req in updated_history
#     ]

#     return jsonify({"success": True, "message": "Service booked successfully.", "service_history": history_list})





# @app.route('/api/customer/<int:customer_id>/service_history/<int:service_id>/date_of_request', methods=['PUT'])
# def update_service_date(customer_id, service_id):
#     data = request.get_json()
    
#     try:
#         # Convert incoming string date to Python date object
#         new_date = datetime.strptime(data["date_of_request"], "%Y-%m-%d").date()
        
#         service = ServiceRequest.query.filter_by(id=service_id, customer_id=customer_id).first()
#         if not service:
#             return jsonify({"error": "Service request not found"}), 404
        
#         service.date_of_request = new_date  # Assign Python `date` object
#         db.session.commit()
        
#         return jsonify({"message": "Date updated successfully"}), 200
    
#     except ValueError as e:
#         return jsonify({"error": f"Invalid date format: {str(e)}"}), 400
#     except Exception as e:
#         return jsonify({"error": f"Error updating date: {str(e)}"}), 500

# from flask import request, jsonify
# from flask_security import auth_required
# from datetime import datetime
# from models import db, ServiceRequest, Customer  # Ensure correct imports

# @app.route('/api/customer/<int:customer_id>/service_history/<int:service_id>/date_of_request', methods=['PUT'])
# @auth_required("token")  # Ensure only authenticated users can update the date
# def update_service_date(customer_id, service_id):
#     data = request.get_json()

#     try:
#         # ✅ Validate date format
#         if "date_of_request" not in data:
#             return jsonify({"error": "Missing 'date_of_request' field"}), 400

#         # ✅ Convert incoming string date to Python date object
#         new_date = datetime.strptime(data["date_of_request"], "%Y-%m-%d").date()

#         # ✅ Ensure customer exists and belongs to the logged-in user
#         customer = Customer.query.filter_by(id=customer_id, user_id=current_user.id).first()
#         if not customer:
#             return jsonify({"error": "Unauthorized or customer not found"}), 403

#         # ✅ Find service request for the customer
#         service_request = ServiceRequest.query.filter_by(id=service_id, customer_id=customer_id).first()
#         if not service_request:
#             return jsonify({"error": "Service request not found"}), 404

#         # ✅ Update the date
#         service_request.date_of_request = new_date
#         db.session.commit()

#         return jsonify({"message": "Date updated successfully"}), 200

#     except ValueError:
#         return jsonify({"error": "Invalid date format. Expected YYYY-MM-DD"}), 400
#     except Exception as e:
#         return jsonify({"error": f"Error updating date: {str(e)}"}), 500


# # ------------------------------------------------
# --------------------
# @app.route('/api/services', methods=['GET'])
# def get_services():
#     services = Service.query.all()
#     return jsonify([service.to_dict() for service in services])

# @auth_required("token")
# @roles_required("admin")
# def post(self):
#     data = request.json
#     try:
#         new_service = Service(
#             name=data.get("name"),
#             base_price=data.get("base_price"),
#             time_required=data.get("time_required"),
#             description=data.get("description")
#         )
#         db.session.add(new_service)
#         db.session.commit()
#         return {"message": "Service created successfully!"}, 201
#     except Exception as e:
#         db.session.rollback()
#         return {"message": f"Error creating service: {str(e)}"}, 400

# @auth_required("token")
# @roles_required("admin")
# def put(self, service_id):
#     data = request.json
#     service = Service.query.get(service_id)
#     if not service:
#         return {"message": "Service not found"}, 404

#     try:
#         service.name = data.get("name", service.name)
#         service.base_price = data.get("base_price", service.base_price)
#         service.time_required = data.get("time_required", service.time_required)
#         service.description = data.get("description", service.description)

#         db.session.commit()
#         return {"message": "Service updated successfully!"}, 200
#     except Exception as e:
#         db.session.rollback()
#         return {"message": f"Error updating service: {str(e)}"}, 400


    
# @auth_required("token")
# @roles_required("admin")
# def delete(self, service_id):
#     service = Service.query.get(service_id)
#     if not service:
#         return {"message": f"Service with ID {service_id} not found"}, 404
    
#     try:
#         # Delete related entries in service_professionals first
#         ServiceProfessional.query.filter_by(service_id=service_id).delete()

#         # Now delete the actual service
#         db.session.delete(service)
#         db.session.commit()
#         return {"message": "Service deleted successfully!"}, 200
#     except Exception as e:
#         db.session.rollback()
#         return {"message": f"Error deleting service: {str(e)}"}, 400




# from flask import Flask, jsonify, request
# from flask_security import auth_required, roles_required




# ========================= Customers API =========================
# @app.route('/api/customers', methods=['GET'])
# @auth_required("token")
# @roles_required("admin")
# def get_customers():
#     customers = db.session.query(Customer, User).join(User, Customer.user_id == User.id).all()
#     return jsonify([
#         {
#             "id": customer.id,
#             "user_id": user.id,
#             "username": user.username,
#             "email": user.email,
#             "phone_number": user.phone_number,
#             "address": user.address,
#             "pin_code": user.pin_code,
#             "status": customer.status,
#             "created_at": customer.created_at.strftime("%Y-%m-%d") if customer.created_at else None
#         }
#         for customer, user in customers
#     ])

# ========================= Professionals API =========================
# @app.route('/api/professionals', methods=['GET'])
# @auth_required("token")
# @roles_required("admin")
# def get_professionals():
#     professionals = ServiceProfessional.query.all()
#     return jsonify([
#         {
#             "id": p.id,
#             "user_id": p.user.id,
#             "username": p.user.username,
#             "email": p.user.email,
#             "phone_number": p.user.phone_number,
#             "address": p.user.address,
#             "pin_code": p.user.pin_code,
#             "service_id": p.service_id,
#             "service_name": p.service.name,
#             "experience": p.experience,
#             "verified": p.verified,
#             "status": p.status,
#             "rating": p.rating
#         }
#         for p in professionals
#     ])

# ========================= Service Requests API =========================
# @app.route('/api/service-requests', methods=['GET'])
# @auth_required("token")
# @roles_required("admin")
# def get_service_requests():
#     requests = ServiceRequest.query.all()
#     return jsonify([
#         {
#             "id": r.id,
#             "service_name": r.service.name if r.service else "Unknown",
#             "customer_name": r.customer.user.username if r.customer and r.customer.user else "⚠ Not Found",
#             "professional_name": r.professional.user.username if r.professional and r.professional.user else "Not Assigned",
#             "date_of_request": r.date_of_request.strftime("%Y-%m-%d") if r.date_of_request else "Unknown",
#             "date_of_completion": r.date_of_completion.strftime("%Y-%m-%d") if r.date_of_completion else "Pending",
#             "service_status": r.service_status,
#             "remarks": r.remarks or "No remarks",
#             "rating": r.rating if r.rating else "Not rated"
#         }
#         for r in requests
#     ])


#---------###3
# @app.route("/api/customer/<int:customer_id>/service_history", methods=["GET"])
# @auth_required("token")
# def get_service_history(customer_id):
#     print(f"🔍 Fetching service history for customer_id: {customer_id}")

#     history = ServiceRequest.query.filter_by(customer_id=customer_id).all()
    
#     if not history:
#         print("⚠️ No service history found!")
#         return jsonify([])

#     history_data = []
#     for h in history:

#         history_data.append({
#             "id": h.id,
#             "customer_id": h.customer_id,
#             "customer_name":h.customer.username if h.customer else "N/A",  # ✅ Fixed Customer Name Fetching
#             "service_name": h.service.name if h.service else "Unknown",
#             "professional_id": h.professional.id if h.professional else None,
#             "professional_username": h.professional.username if h.professional and h.professional.user else "N/A",
#             "professional_email": h.professional.user.email if h.professional and h.professional.user else "N/A",
#             "phone_no": h.professional.phone_number if h.professional else "N/A",
#             "date_of_request": h.date_of_request,
#             "date_of_completion": h.date_of_completion,
#             "status": h.service_status
#         })

#     return jsonify(history_data)




#     })





#-----------Custommer route h upr--------------------------------------------------------------------------------
@app.route('/api/professional/<int:professional_id>/new_service_requests', methods=['GET'])
def get_new_service_requests(professional_id):
    # Fetch new service requests for the professional using their ID
    service_requests = ServiceRequest.query.filter_by(professional_id=professional_id, status='Requested').all()
    
    if not service_requests:
        return jsonify({'message': 'No new service requests found.'}), 404
    
    # Prepare the data to send back to the frontend
    requests_data = []
    for request in service_requests:
        requests_data.append({
            'id': request.id,
            'service_name': request.service_name,
            'customer_username': request.customer.username,
            'status': request.status
        })
    
    return jsonify(requests_data), 200

# @app.route('/api/professional/approve_request', methods=['POST'])
# def approve_service_request():
#     data = request.get_json()
#     service_id = data.get('service_id')
    
#     # Fetch the service request from the database
#     service_request = ServiceRequest.query.get(service_id)
    
#     if not service_request:
#         return jsonify({'message': 'Service request not found.'}), 404
    
#     # Change the status to 'Approved'
#     service_request.status = 'Approved'
    
#     # Commit the changes to the database
#     db.session.commit()
    
#     return jsonify({'message': 'Service request approved successfully!'}), 200

# @app.route('/api/professional/reject_request', methods=['POST'])
# def reject_service_request():
#     data = request.get_json()
#     service_id = data.get('service_id')
    
#     # Fetch the service request from the database
#     service_request = ServiceRequest.query.get(service_id)
    
#     if not service_request:
#         return jsonify({'message': 'Service request not found.'}), 404
    
#     # Change the status to 'Rejected'
#     service_request.status = 'Rejected'
    
#     # Commit the changes to the database
#     db.session.commit()
    
#     return jsonify({'message': 'Service request rejected successfully!'}), 200

# @app.route('/api/professional/complete_service', methods=['POST'])
# def complete_service():
#     data = request.get_json()
#     service_id = data.get('service_id')
    
#     # Fetch the service request from the database
#     service_request = ServiceRequest.query.get(service_id)
    
#     if not service_request:
#         return jsonify({'message': 'Service request not found.'}), 404
    
#     # Update the status of the service request to 'Completed'
#     service_request.status = 'Completed'
    
#     # Commit the changes to the database
#     db.session.commit()
    
#     return jsonify({'message': 'Service completed successfully!'}), 200

# @app.route('/api/professional/<int:professional_id>/service_history', methods=['GET'])
# def get_service_service_history(professional_id):
#     # Fetch all the completed or in-progress service requests for the professional
#     service_history = ServiceRequest.query.filter_by(professional_id=professional_id).all()
    
#     if not service_history:
#         return jsonify({'message': 'No service history found.'}), 404
    
#     # Prepare the data to send back to the frontend
#     history_data = []
#     for service in service_history:
#         history_data.append({
#             'id': service.id,
#             'service_name': service.service_name,
#             'customer_username': service.customer.username,
#             'status': service.status,
#             'completed_on': service.completed_on  # You can store the completion time in the database if needed
#         })
    
#     return jsonify(history_data), 200
