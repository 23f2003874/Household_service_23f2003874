from celery import shared_task
import time
from backend.model import ServiceRequest ,User,Service,Customer,ServiceProfessional
import flask_excel
from flask import render_template
from .mail import send_email
from backend.utils import format_report
from celery import shared_task
from datetime import datetime

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




@shared_task(ignore_result=True, name="daily_report")
def send_daily_reminders():
    """Fetch daily service request summary for professionals and send email reminders."""
    today = datetime.utcnow().date()
    
    professionals = ServiceProfessional.query.all()
    
    for professional in professionals:
        requested_today = ServiceRequest.query.filter_by(professional_id=professional.id, service_status="requested") \
                            .filter(ServiceRequest.date_of_request >= today).count()
        accepted_today = ServiceRequest.query.filter_by(professional_id=professional.id, service_status="approved") \
                            .filter(ServiceRequest.date_of_request >= today).count()
        rejected_today = ServiceRequest.query.filter_by(professional_id=professional.id, service_status="rejected") \
                            .filter(ServiceRequest.date_of_request >= today).count()
        closed_today = ServiceRequest.query.filter_by(professional_id=professional.id, service_status="closed") \
                            .filter(ServiceRequest.date_of_request >= today).count()

        if requested_today or accepted_today or rejected_today or closed_today:
            # Email content
            subject = f"Daily Service Summary - {professional.username}"
            body = f"""
            <html>
            <body>
                <h3>Hello {professional.username},</h3>
                <p>Here is your daily service request summary:</p>
                <ul>
                    <li><b>Requested Today:</b> {requested_today}</li>
                    <li><b>Accepted Today:</b> {accepted_today}</li>
                    <li><b>Rejected Today:</b> {rejected_today}</li>
                    <li><b>Closed Today:</b> {closed_today}</li>
                </ul>
                <p>Please review and take necessary action.</p>
                <p>Regards,<br>Household Services Team</p>
            </body>
            </html>
            """

            # Send Email using mail.py
            send_email(to_address=professional.email, subject=subject, message=body, content="html")

    return "Daily reminders sent successfully!"
