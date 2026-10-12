import logging

logger = logging.getLogger(__name__)

class SMSService:
    """Mock SMS Service for Development Environment."""
    
    def __init__(self):
        # TODO: Load SMS_PROVIDER_TOKEN from config/env in Production
        self.provider = "MOCK_SMS"

    async def send_sms(self, phone_number: str, template_name: str, **kwargs):
        """
        Mock sending an SMS by printing a formatted block to the terminal.
        """
        if not phone_number:
            logger.warning("SMS failed: No phone number provided.")
            return False

        # Format variables for readability
        vars_str = " | ".join([f"{k}={v}" for k, v in kwargs.items()])
        
        # Terminal Output Formatting (Green color for visibility)
        msg = f"\n\033[92m" + "="*60 + "\n"
        msg += f"🟢 [MOCK SMS] SENT SUCCESSFULLY\n"
        msg += f"📱 To: {phone_number}\n"
        msg += f"📝 Template: {template_name}\n"
        msg += f"📦 Variables: {vars_str}\n"
        msg += "="*60 + "\033[0m\n"
        
        print(msg)
        logger.info(f"Mock SMS sent to {phone_number} (Template: {template_name})")
        return True