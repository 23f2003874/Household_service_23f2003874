from celery import shared_task
import time
from backend.model import ServiceRequest ,User,Service,Customer
import flask_excel
from flask import render_template
from .mail import send_email
from backend.utils import format_report

@shared_task(ignore_result = False)
def add(x,y):
    return x+y 

@shared_task(ignore_result= False)
def create_csv():
    resource= ServiceRequest.query.all()
    column_names = [column.name for column in ServiceRequest.__table__.columns]
    print(column_names)
    csv_out= flask_excel.make_response_from_query_sets(resource,column_names,file_type='csv')

    with open('./backend/celery/user-downloads/serviceRequest.csv','wb') as file:
        file.write(csv_out.data)

    return 'serviceRequest.csv'




@shared_task(ignore_results=False, name="monthly_report")
def monthly_report():
    customers = Customer.query.all()  # Get all customers

    for customer in customers:
        customer_data = {
            "username": customer.username,
            "email": customer.email,
            "service_requests": []
        }

        # Fetch service requests for this customer
        for request in customer.service_requests:
            service_data = {
                "id": request.id,
                "service_name": request.service.name,
                "status": request.service_status,
                "requested_date": request.date_of_request.strftime("%Y-%m-%d"),
                "completion_date": request.date_of_completion.strftime("%Y-%m-%d") if request.date_of_completion else "N/A",
                "remarks": request.remarks or "No remarks",
                "rating": request.rating or "Not rated"
            }
            customer_data["service_requests"].append(service_data)

        # Generate email content using Jinja2 template
        # message = render_template("mail.html", data=customer_data)
        message = format_report('templates/mail.html', customer_data)
        # Send email
        send_email(
            to_address=customer.email,
            subject="Monthly Service Report - Household Services",
            message=message
        )

    return "Monthly reports sent to all customers."
