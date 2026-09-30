import logging
import os
from typing import Any

from pydantic_settings import BaseSettings, SettingsConfigDict

logger = logging.getLogger(__name__)


class Settings(BaseSettings):
    # Application
    app_name: str = "FastAPI Modular Template"
    debug: bool = False
    version: str = "1.0.0"

    # Server
    host: str = "0.0.0.0"
    port: int = 8000

    # AWS Lambda Configuration
    is_lambda: bool = False
    lambda_function_name: str = "fastapi-backend"
    aws_region: str = "us-east-1"

    # ZarinPal Payment Gateway (REST v4)
    # مرچنت‌کد (شناسه پذیرنده) که از پنل زرین‌پال دریافت می‌شود.
    # مقدار آن از متغیر محیطی ZARINPAL_MERCHANT_ID خوانده می‌شود.
    zarinpal_merchant_id: str = ""
    # استفاده از درگاه آزمایشی (sandbox). برای اتصال به درگاه واقعی، false کنید.
    zarinpal_use_sandbox: bool = True
    zarinpal_sandbox_url: str = "https://sandbox.zarinpal.com"
    zarinpal_production_url: str = "https://payment.zarinpal.com"
    # مسیر بازگشت از درگاه (callback) که سمت فرانت‌اند آن را هندل می‌کند.
    zarinpal_callback_path: str = "/payment/callback"
    # آدرس عمومی سایت برای ساخت آدرس بازگشت؛ مثلاً https://example.ir
    public_site_url: str = ""
    # (رزرو برای آینده) endpoint گراف‌کیوال زرین‌پال. این API نیازمند OAuth 2.0
    # (client_id/client_secret و access token) است و صرفاً برای پرس‌وجوی
    # تراکنش‌ها/ترمینال‌ها کاربرد دارد، نه برای ایجاد/تأیید پرداخت.
    zarinpal_graphql_url: str = "https://next.zarinpal.com/api/v4/graphql"

    @property
    def zarinpal_gateway_url(self) -> str:
        """Base URL of the Zarinpal gateway based on the sandbox/production flag."""
        return self.zarinpal_sandbox_url if self.zarinpal_use_sandbox else self.zarinpal_production_url

    @property
    def backend_url(self) -> str:
        """Generate backend URL from host and port."""
        if self.is_lambda:
            # In Lambda environment, return the API Gateway URL
            return os.environ.get(
                "PYTHON_BACKEND_URL", f"https://{self.lambda_function_name}.execute-api.{self.aws_region}.amazonaws.com"
            )
        else:
            # Use localhost for external callbacks instead of 0.0.0.0
            display_host = "127.0.0.1" if self.host == "0.0.0.0" else self.host
            return os.environ.get("PYTHON_BACKEND_URL", f"http://{display_host}:{self.port}")

    # MODULE_CONFIG_START
    # MODULE_CONFIG_END

    model_config = SettingsConfigDict(case_sensitive=False, extra="ignore")

    def __getattr__(self, name: str) -> Any:
        """
        Dynamically read attributes from environment variables.
        For example: settings.opapi_key reads from OPAPI_KEY environment variable.

        Args:
            name: Attribute name (e.g., 'opapi_key')

        Returns:
            Value from environment variable

        Raises:
            AttributeError: If attribute doesn't exist and not found in environment variables
        """
        # Convert attribute name to environment variable name (snake_case -> UPPER_CASE)
        env_var_name = name.upper()

        # Check if environment variable exists
        if env_var_name in os.environ:
            value = os.environ[env_var_name]
            # Cache the value in instance dict to avoid repeated lookups
            self.__dict__[name] = value
            logger.debug(f"Read dynamic attribute {name} from environment variable {env_var_name}")
            return value

        # If not found, raise AttributeError to maintain normal Python behavior
        raise AttributeError(f"'{self.__class__.__name__}' object has no attribute '{name}'")


# Global settings instance
settings = Settings()
