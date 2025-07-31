from typing import Any, Dict, List, Optional
import os
from fastapi import HTTPException, status
from pydantic import EmailStr
import resend
from app.core.config import settings

# Initialize Resend with your API key
resend.api_key = settings.RESEND_API_KEY

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

async def send_email_resend(
    email_to: EmailStr,
    subject: str,
    html_content: str
) -> Dict[str, Any]:
    """
    Send email using Resend
    """
    try:
        params = {
            "from": "adbuddy@auth.xylicdata.com",
            "to": [email_to],
            "subject": subject,
            "html": html_content,
        }
        
        email = resend.Emails.send(params)
        return {"success": True, "message": "Email sent successfully", "data": email}
    except Exception as e:
        return {"success": False, "message": str(e)}

async def send_otp_email_with_template(email_to: EmailStr, otp: str) -> Dict[str, Any]:
    """
    Send OTP email using template
    """
    template = EMAIL_TEMPLATES["otp"]
    html_content = template["template"].format(otp=otp)
    
    return await send_email_resend(
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
    
    return await send_email_resend(
        email_to=email_to,
        subject=template["subject"],
        html_content=html_content
    )
