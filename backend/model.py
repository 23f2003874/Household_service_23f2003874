from flask_sqlalchemy import SQLAlchemy
from flask_security import UserMixin, RoleMixin, Security 
from datetime import datetime as dt

db = SQLAlchemy()

# Association Table for Users & Roles (Many-to-Many Relationship)
roles_users = db.Table(
    'roles_users',
    db.Column('user_id', db.Integer, db.ForeignKey('users.id', ondelete= 'CASCADE')),
    db.Column('role_id', db.Integer, db.ForeignKey('roles.id'))
)

# Role Table
class Role(db.Model, RoleMixin):
    __tablename__ = "roles"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=False, nullable=False)
    description = db.Column(db.String(255))

# User Table
class User(db.Model, UserMixin):
    __tablename__ = "users"
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=False, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)  # Hashed password
    active = db.Column(db.Boolean, default=True, nullable=False) 
    fs_uniquifier = db.Column(db.String, unique=True, nullable=False)

    roles = db.relationship('Role', secondary=roles_users, backref=db.backref('users', lazy='dynamic'))
    # created_at = db.Column(db.Date, default=dt.utcnow().date, nullable=False)  # Stores only YYYY-MM-DD

# Service Table
class Service(db.Model):
    __tablename__ = "services"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.Text, nullable=True)
    base_price = db.Column(db.Integer, nullable=False)
    time_required = db.Column(db.Integer, nullable=True)  # In minutes
    created_at = db.Column(db.Date, default=dt.utcnow().date, nullable=False)  # Stores only YYYY-MM-DD
    professionals = db.relationship("ServiceProfessional", backref="service", lazy="dynamic")
    

# Service Professional Table
class ServiceProfessional(db.Model):
    __tablename__ = "service_professionals"
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=False, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id",ondelete="CASCADE"), unique=True, nullable=False)
    service_id = db.Column(db.Integer, db.ForeignKey("services.id"), nullable=False)
    phone_number = db.Column(db.String(15), nullable=True)
    address = db.Column(db.Text, nullable=True)
    pin_code = db.Column(db.String(10), nullable=True)
    experience = db.Column(db.Integer, nullable=True)
    verified = db.Column(db.Boolean, default=False, nullable=False)
    status = db.Column(db.String(20), default="inactive", nullable=False)
    rating = db.Column(db.Float, default=0.0, nullable=True)
    created_at = db.Column(db.Date, default=dt.utcnow().date, nullable=False)  # Stores only YYYY-MM-DD

    # Relationships
    user = db.relationship("User", backref="service_professional", uselist=False)

# Customer Table
class Customer(db.Model):
    __tablename__ = "customers"
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=False, nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id",ondelete="CASCADE"), unique=True, nullable=False)
    phone_number = db.Column(db.String(15), nullable=True)
    address = db.Column(db.Text, nullable=True)
    pin_code = db.Column(db.String(10), nullable=True)
    status = db.Column(db.String(20), default="active", nullable=False)
    created_at = db.Column(db.Date, default=dt.utcnow().date, nullable=False)  # Stores only YYYY-MM-DD

    # Relationships
    user = db.relationship("User", backref="customer", uselist=False)
    


# Service Request Table
class ServiceRequest(db.Model):
    __tablename__ = "service_requests"
    id = db.Column(db.Integer, primary_key=True)
    service_id = db.Column(db.Integer, db.ForeignKey("services.id"), nullable=False)
    customer_id = db.Column(db.Integer, db.ForeignKey("customers.id", ondelete="CASCADE"), nullable=False)  # Change
    professional_id = db.Column(db.Integer, db.ForeignKey("service_professionals.id", ondelete="CASCADE"), nullable=False)  # Change
    date_of_request = db.Column(db.Date, default=dt.utcnow().date, nullable=False)
    date_of_completion = db.Column(db.Date, nullable=True)
    service_status = db.Column(db.String(20), default="requested", nullable=False)
    remarks = db.Column(db.Text, nullable=True)
    rating = db.Column(db.Float, nullable=True)
    service = db.relationship("Service", backref="service_requests")
    professional = db.relationship("ServiceProfessional", backref="service_requests")
    customer = db.relationship("Customer", backref="service_requests") 




