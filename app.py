from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_security import Security, SQLAlchemyUserDatastore
from backend.model import db, User, Role  # Import models
from backend.config import LocalDevelopmentConfig  # Import configuration
from backend.resources import api
from werkzeug.security import generate_password_hash  # Correct hashing method

def create_app():
    app = Flask(__name__)
    app.config.from_object(LocalDevelopmentConfig)  # Load configuration
    db.init_app(app)
    api.init_app(app)
    datastore = SQLAlchemyUserDatastore(db, User, Role)
    app.security = Security(app, datastore)
    app.app_context().push()
    return app

app = create_app()

with app.app_context():
    db.create_all()

    # Create roles if they don't exist
    app.security.datastore.find_or_create_role(name="admin", description="superuser of app")
    app.security.datastore.find_or_create_role(name="customer", description="general customer of app")
    app.security.datastore.find_or_create_role(name="professional", description="general professional of app")
    db.session.commit()

    # Create admin user with hashed password
    if not app.security.datastore.find_user(email="admin@gmail.com"):
        hashed_password = generate_password_hash("1234")  # Proper hashing
        app.security.datastore.create_user(email="admin@gmail.com", username="elon", password=hashed_password, roles=["admin"])

    # Create a sample customer
    # if not app.security.datastore.find_user(email="customer@example.com"):
    #     hashed_password = generate_password_hash("1221")
    #     app.security.datastore.create_user(email="customer@example.com", username="customer01", password=hashed_password, roles=["customer"])

    # # Create a sample professional
    # if not app.security.datastore.find_user(email="professional@example.com"):
    #     hashed_password = generate_password_hash("1221")
    #     app.security.datastore.create_user(email="professional@example.com", username="professional01", password=hashed_password, roles=["professional"])

    db.session.commit()

# Import routes after app is created
from backend.routes import *  

if __name__ == "__main__":
    app.run()
