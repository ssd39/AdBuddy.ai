from typing import Any, Dict, List, Optional
import os
from fastapi import HTTPException, status
from pydantic import EmailStr

# Note: You'll need to install the selected email service package
# For example, for SendGrid: pip install sendgrid

# Define email templates
EMAIL_TEMPLATES = {
    "otp": {
        "subject": "Your AdBuddy.ai Verification Code",
        "template": """
        <h1>Your Verification Code</h1>
        <p>Hello,</p>
        <p>Your verification code is: <strong>{otp}</strong></p>
        <p>This code will expire in 15 minutes.</p>
        <p>If you didn't request this code, please ignore this email.</p>
        <p>Best regards,</p>
        <p>The AdBuddy.ai Team</p>
        """
    },
    "welcome": {
        "subject": "Welcome to AdBuddy.ai",
        "template": """
        <h1>Welcome to AdBuddy.ai!</h1>
        <p>Hello {name},</p>
        <p>Thank you for joining AdBuddy.ai. We're excited to have you on board!</p>
        <p>Best regards,</p>
        <p>The AdBuddy.ai Team</p>
        """
    }
}

async def send_email_sendgrid(
    email_to: EmailStr,
    subject: str,
    html_content: str
) -> Dict[str, Any]:
    """
    Send email using SendGrid
    """
    try:
        # Uncomment and complete this section when you've installed SendGrid
        """
        import sendgrid
        from sendgrid.helpers.mail import Mail, Email, To, Content
        
        sg = sendgrid.SendGridAPIClient(api_key=os.environ.get("SENDGRID_API_KEY"))
        from_email = Email(os.environ.get("FROM_EMAIL", "noreply@adbuddy.ai"))
        to_email = To(email_to)
        content = Content("text/html", html_content)
        mail = Mail(from_email, to_email, subject, content)
        
        response = sg.client.mail.send.post(request_body=mail.get())
        return {"success": True, "status_code": response.status_code}
        """
        
        # For development, just print the email
        print(f"\n--- Email to: {email_to} ---")
        print(f"Subject: {subject}")
        print(f"Content: {html_content}")
        print("--- End of email ---\n")
        
        return {"success": True, "message": "Email sent successfully (development mode)"}
    except Exception as e:
        return {"success": False, "message": str(e)}

async def send_otp_email_with_template(email_to: EmailStr, otp: str) -> Dict[str, Any]:
    """
    Send OTP email using template
    """
    template = EMAIL_TEMPLATES["otp"]
    html_content = template["template"].format(otp=otp)
    
    return await send_email_sendgrid(
        email_to=email_to,
        subject=template["subject"],
        html_content=html_content
    )


async def send_welcome_email(email_to: EmailStr, name: str) -> Dict[str, Any]:
    """
    Send welcome email using template
    """
    template = EMAIL_TEMPLATES["welcome"]
    html_content = template["template"].format(name=name)
    
    return await send_email_sendgrid(
        email_to=email_to,
        subject=template["subject"],
        html_content=html_content
    )