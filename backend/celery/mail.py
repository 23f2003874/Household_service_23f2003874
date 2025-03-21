import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.base import MIMEBase
from email import encoders
from jinja2 import Template

SMTP_SERVER_HOST = "localhost"
SMTP_SERVER_PORT = 1025  # MailHog default port
SENDER_ADDRESS ="householdservices@donotreply.in"
SENDER_PASSWORD = ""  # Not required for MailHog

def send_email(to_address, subject, message, content="html", attachment_file=None):
    msg = MIMEMultipart()
    msg['From'] = SENDER_ADDRESS
    msg['To'] = to_address
    msg['Subject'] = subject

    # Attach message content
    msg.attach(MIMEText(message, "html" if content == "html" else "plain"))

    # Attach file if provided
    if attachment_file:
        with open(attachment_file, 'rb') as attachment:
            part = MIMEBase("application", "octet-stream")
            part.set_payload(attachment.read())

        encoders.encode_base64(part)
        part.add_header("Content-Disposition", f'attachment; filename="{attachment_file}"')
        msg.attach(part)

    # Send email using MailHog (No Authentication Required)
    with smtplib.SMTP(SMTP_SERVER_HOST, SMTP_SERVER_PORT) as s:
        s.login(SENDER_ADDRESS, SENDER_PASSWORD)
        s.send_message(msg)
        s.quit()
        # s.send_message(msg)

    return True
