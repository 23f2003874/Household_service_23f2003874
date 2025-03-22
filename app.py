from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_security import Security, SQLAlchemyUserDatastore
from backend.model import db, User, Role  # Import models
from backend.config import LocalDevelopmentConfig  # Import configuration
from werkzeug.security import generate_password_hash  # Correct hashing method
from flask_caching import Cache
from backend.celery.celery_factory import celery_init_app 
import flask_excel as excel 
from celery.schedules import crontab
from backend.celery.tasks import monthly_report,send_daily_reminders

def create_app():
    app = Flask(__name__)
    app.config.from_object(LocalDevelopmentConfig)  # Load configuration
    db.init_app(app)
    cache= Cache(app)

    datastore = SQLAlchemyUserDatastore(db, User, Role)
    app.cache= cache 
    app.security = Security(app, datastore)
    app.app_context().push()
    from backend.resources import api
    api.init_app(app)
    return app

app = create_app()

celery_app= celery_init_app(app)
celery_app.autodiscover_tasks()   #(['backend.celery.tasks'])  

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

# @celery.on_after_finalize.connect 
# def setup_periodic_tasks(sender, **kwargs):
#     sender.add_periodic_task(
#         crontab(minute = '*/2'),
#         monthly_report.s(),
#     )
@celery_app.on_after_finalize.connect
def setup_periodic_tasks(sender, **kwargs):
    # Runs every 1 minute (Daily Reminder)
    sender.add_periodic_task(
        crontab(minute="*/1"),
        send_daily_reminders.s(),
    )

    # Runs every 2 minutes (Test Purpose) or 1st of every month at midnight (Monthly Report)
    sender.add_periodic_task(
        crontab(minute="*/2"),  # Change to crontab(minute=0, hour=0, day_of_month=1) for monthly execution
        monthly_report.s(),
    )

# @celery_app.on_after_finalize.connect
# def setup_periodic_tasks(sender, **kwargs):
#      sender.add_periodic_task(
#         crontab(minute="*/1"),  # Runs every 1 minute
#         send_daily_reminders.s(),
#     )
     
#     sender.add_periodic_task(
#         crontab(minute = '*/2'),    #crontab(minute=0, hour=0, day_of_month=1),  # Runs on the 1st of every month at midnight
#         monthly_report.s(),
#     )


excel.init_excel(app)

if __name__ == "__main__":
    app.run()
