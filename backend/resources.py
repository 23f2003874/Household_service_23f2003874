from flask import request,current_app as app    #jsonify,
from flask_restful import Resource, Api
from flask_security import auth_required, roles_required, current_user
from werkzeug.security import check_password_hash, generate_password_hash
from backend.model import db, Service, Customer, ServiceProfessional, User,ServiceRequest,Role
from datetime import datetime

cache= app.cache
# Initialize API independently (without app)
api = Api()

# ========================= Customer API =========================
class CustomerAPI(Resource):
    @auth_required("token")
    @cache.cached(timeout=5)     ###############CACHE 
    @roles_required("admin")
    def get(self):
        """Fetch all customers with full details"""
        customers = (
            db.session.query(
                Customer.id, 
                Customer.status, 
                Customer.created_at, 
                User.id.label("user_id"), 
                User.username, 
                User.email, 
                Customer.phone_number,  # Get from Customer table
                Customer.address, 
                Customer.pin_code  
            )
            .join(User, Customer.user_id == User.id)  # Explicit JOIN
            .all()
        )

        if not customers:
            return {"message": "No customers found"}, 404

        return [{
            "id": customer.id,
            "user_id": customer.user_id,
            "username": customer.username,
            "email": customer.email,
            "phone_number": customer.phone_number,  # Now correctly fetched
            "address": customer.address,
            "pin_code": customer.pin_code,
            "status": customer.status,
            "created_at": customer.created_at.strftime("%Y-%m-%d") if customer.created_at else None
        } for customer in customers], 200

    # @auth_required("token")
    # @roles_required("admin")
    # def get(self):
    #     """Fetch all customers with full details"""
    #     customers = (
    #         db.session.query(Customer, User)
    #         .join(User, Customer.user_id == User.id)  # Ensure explicit join
    #         .all()
    #     )

    #     if not customers:
    #         return {"message": "No customers found"}, 404

    #     return [{
    #         "id": customer.id,
    #         "user_id": user.id,
    #         "username": user.username,
    #         "email": user.email,
    #         "phone_number": user.phone_number,
    #         "address": user.address,
    #         "pin_code": user.pin_code,
    #         "status": customer.status,
    #         "created_at": customer.created_at.strftime("%Y-%m-%d") if customer.created_at else None
    #     } for customer, user in customers], 200

    @auth_required("token")
    @roles_required("admin")
    def post(self):
        """Create a new customer"""
        data = request.json

        try:
            # Check if email already exists
            if User.query.filter_by(email=data.get("email")).first():
                return {"message": "Email already registered"}, 400

            # Create a new User entry
            user = User(
                username=data.get("username"),
                email=data.get("email"),
                password=data.get("password"),  # Assume hashing is handled elsewhere
                phone_number=data.get("phone_number"),
                address=data.get("address"),
                pin_code=data.get("pin_code"),
                active=True
            )
            db.session.add(user)
            db.session.commit()  # Commit user creation
             # Create corresponding Customer entry
            new_customer = Customer(
                user_id=user.id,
                phone_number=data.get("phone_number"),
                address=data.get("address"),
                pin_code=data.get("pin_code"),
                status=data.get("status", "active")
            )
            db.session.add(new_customer)
            db.session.commit()  # Save Customer entry

            return {"message": "Customer created successfully!", "user_id": user.id}, 201
        
        except Exception as e:
            db.session.rollback()
            return {"message": f"Error creating customer: {str(e)}"}, 400

           


    
    @auth_required("token")
    @roles_required("admin")
    def delete(self, customer_id):
        customer = Customer.query.get(customer_id)
        
        if not customer:
            return {"message": f"Customer with ID {customer_id} not found"}, 404
        
        user = User.query.get(customer.user_id)  # Fetch related user
        
        try:
            # Delete related service requests
            ServiceRequest.query.filter_by(customer_id=customer_id).delete()

            # Delete customer
            db.session.delete(customer)

            # Delete the associated user
            if user:
                db.session.delete(user)

            db.session.commit()
            return {"message": "Customer and associated user deleted successfully!"}, 200
        except Exception as e:
            db.session.rollback()
            return {"message": f"Error deleting customer: {str(e)}"}, 400


    @auth_required("token")
    @roles_required("admin")
    def put(self, id):
        customer = Customer.query.get(id)
        if not customer:
            return {"message": "Customer not found"}, 404
        
        data = request.get_json()
        status = data.get("status")
        
        if status not in ['active', 'blocked']:
            return {"message": "Invalid status"}, 400

        try:
            customer.status = status
            db.session.commit()
            return {"message": f"Customer status updated to {status}"}, 200
        except Exception as e:
            db.session.rollback()
            return {"message": f"Error updating customer status: {str(e)}"}, 400


# ========================= Service API =========================

# class ServiceAPI(Resource):
#     @auth_required("token")
#     @roles_required("admin")
#     def get(self):
#         services = Service.query.all()
#         if not services:
#             return {"message": "No services found"}, 404
        
#         return [{
#             "id": s.id,
#             "name": s.name,
#             "base_price": s.base_price,
#             "time_required": s.time_required,
#             "description": s.description
#         } for s in services], 200
class ServiceAPI(Resource):
    @auth_required("token")
    @cache.cached(timeout=5)     ###########   CACHE
    @roles_required("admin")
    def get(self):
        services = Service.query.all()
        if not services:
            return {"message": "No services found"}, 404

        return [{
            "id": s.id,
            "name": s.name,
            "base_price": s.base_price,
            "time_required": s.time_required,
            "description": s.description,
            "professionals": [{
                "id": p.id,
                "name": p.user.username,  # Fetch from User table
                "email": p.email,
                "experience": p.experience,
                "status": p.status,
                "rating": p.rating,
  # Fetch from Service table
            } for p in ServiceProfessional.query.filter_by(service_id=s.id).all()]  # Fetch professionals for this service
        } for s in services], 200

    @auth_required("token")
    @roles_required("admin")
    def post(self):
        data = request.json
        try:
            new_service = Service(
                name=data.get("name"),
                base_price=data.get("base_price"),
                time_required=data.get("time_required"),
                description=data.get("description")
            )
            db.session.add(new_service)
            db.session.commit()
            return {"message": "Service created successfully!"}, 201
        except Exception as e:
            db.session.rollback()
            return {"message": f"Error creating service: {str(e)}"}, 400

    @auth_required("token")
    @roles_required("admin")
    def put(self, service_id):
        data = request.json
        service = Service.query.get(service_id)
        if not service:
            return {"message": "Service not found"}, 404

        try:
            service.name = data.get("name", service.name)
            service.base_price = data.get("base_price", service.base_price)
            service.time_required = data.get("time_required", service.time_required)
            service.description = data.get("description", service.description)

            db.session.commit()
            return {"message": "Service updated successfully!"}, 200
        except Exception as e:
            db.session.rollback()
            return {"message": f"Error updating service: {str(e)}"}, 400


    @auth_required("token")
    @roles_required("admin")
    def delete(self, service_id):
        service = Service.query.get(service_id)
        if not service:
            return {"message": f"Service with ID {service_id} not found"}, 404

        try:
            # Get all professionals linked to this service
            professionals = ServiceProfessional.query.filter_by(service_id=service_id).all()

            # Delete associated professionals and their users
            for professional in professionals:
                user = User.query.get(professional.user_id)  # Fetch associated user
                db.session.delete(professional)
                if user:
                    db.session.delete(user)  # Delete user if exists

            # Delete the actual service
            db.session.delete(service)
            db.session.commit()
            
            return {"message": "Service, associated professionals, and users deleted successfully!"}, 200
        except Exception as e:
            db.session.rollback()
            return {"message": f"Error deleting service: {str(e)}"}, 400


# ========================= Professional API =========================
from sqlalchemy import func

class ProfessionalAPI(Resource):
    @auth_required("token")
    @roles_required("admin")
    def get(self):
        professionals = ServiceProfessional.query.all()
        if not professionals:
            return {"message": "No professionals found"}, 404

        professional_list = []
        for p in professionals:
            # ✅ Compute average rating from service history
            avg_rating = db.session.query(func.avg(ServiceRequest.rating)).filter_by(professional_id=p.id).scalar()
            avg_rating = round(avg_rating, 1) if avg_rating else None  # Round to 1 decimal

            professional_list.append({
                "id": p.id,
                "user_id": p.user.id if p.user else None,
                "username": p.user.username if p.user else "⚠ Not Found",
                "email": p.user.email if p.user else "⚠ Not Found",
                "phone_number": p.phone_number,
                "address": p.address,
                "pin_code": p.pin_code,
                "service_id": p.service_id,
                # "service_name": p.service.name if p.services else "Unknown",
                "experience": p.experience,
                "verified": p.verified,
                "status": p.status,
                "rating": avg_rating  # ✅ Use calculated average rating
            })

        return professional_list, 200

    @auth_required("token")
    @roles_required("admin")
    def post(self):
        data = request.json
        try:
            if User.query.filter_by(email=data.get("email")).first():
                return {"message": "Email already registered"}, 400

            service = Service.query.get(data.get("service_id"))
            if not service:
                return {"message": "Invalid service selected"}, 400

            # Create a new User entry
            user = User(
                username=data.get("username"),
                email=data.get("email"),
                password=generate_password_hash(data.get("password")),
                active=True
            )
            db.session.add(user)
            db.session.commit()  

            # Create associated Professional entry
            new_professional = ServiceProfessional(
                user_id=user.id,  # Correct association with `User`
                service_id=data.get("service_id"),
                phone_number=data.get("phone_number"),
                address=data.get("address"),
                pin_code=data.get("pin_code"),
                experience=data.get("experience"),
                verified=data.get("verified", False),
                status=data.get("status", "inactive"),
                rating=data.get("rating", 0.0)
            )
            db.session.add(new_professional)
            db.session.commit()

            return {"message": "Service professional created successfully!", "user_id": user.id}, 201
        except Exception as e:
            db.session.rollback()
            return {"message": f"Error creating professional: {str(e)}"}, 400

    @auth_required("token")
    @roles_required("admin")
    def delete(self, id):
        professional = ServiceProfessional.query.get(id)

        if not professional:
            return {"message": f"Professional with ID {id} not found"}, 404

        user = User.query.get(professional.user_id)  # Fetch related user

        try:
            # Delete related service requests
            ServiceRequest.query.filter_by(professional_id=id).delete()

            # Delete professional
            db.session.delete(professional)

            # Delete the associated user
            if user:
                db.session.delete(user)

            db.session.commit()
            return {"message": "Professional and associated user deleted successfully!"}, 200
        except Exception as e:
            db.session.rollback()
            return {"message": f"Error deleting professional: {str(e)}"}, 400
    


    @auth_required("token")
    @roles_required("admin")
    def put(self, id):
        professional = ServiceProfessional.query.get(id)
        if not professional:
            return {"message": "Professional not found"}, 404
        
        data = request.get_json()
        status = data.get("status")
        
        if status not in ['active', 'blocked', 'inactive']:
            return {"message": "Invalid status"}, 400

        try:
            professional.status = status
            db.session.commit()
            return {"message": f"Professional status updated to {status}"}, 200
        except Exception as e:
            db.session.rollback()
            return {"message": f"Error updating professional status: {str(e)}"}, 400


#---------------------- ServiceRequest API---------------------------------------------

class ServiceRequestAPI(Resource):
    @auth_required("token")
    @roles_required("admin")
    def get(self):
        requests = ServiceRequest.query.all()
        if not requests:
            return {"message": "No service requests found"}, 404

        result = []
        for r in requests:
            # Debugging output
            print(f"Request ID: {r.id}, Customer ID: {r.customer_id}, Customer Object: {r.customer}")

            result.append({
                "id": r.id,
                "service_name": r.service.name if r.service else "Unknown",
                "customer_name": r.customer.username if r.customer else "⚠ Not Found",  # Use correct reference
                "professional_name": r.professional.username if r.professional else "Not Assigned",
                "date_of_request": r.date_of_request.strftime("%Y-%m-%d") if r.date_of_request else "Unknown",
                "date_of_completion": r.date_of_completion.strftime("%Y-%m-%d") if r.date_of_completion else "Pending",
                "service_status": r.service_status,
                "remarks": r.remarks or "No remarks",
                "rating": r.rating if r.rating else "Not rated"
            })

        return result, 200



# ========================= Register API Resources =========================

api.add_resource(CustomerAPI, "/api/customers", "/api/customers/<int:customer_id>","/api/customers/<int:id>/status")
api.add_resource(ServiceAPI, "/api/services", "/api/services/<int:service_id>")
api.add_resource(ProfessionalAPI, "/api/professionals","/api/professionals/<int:id>", "/api/professionals/<int:id>/status")

api.add_resource(ServiceRequestAPI, "/api/service-requests")

