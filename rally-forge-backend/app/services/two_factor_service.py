"""Two-Factor Authentication (2FA) service using TOTP"""
import pyotp
import qrcode
from io import BytesIO
import base64
from typing import Optional, Tuple
from sqlalchemy.orm import Session
from app.models.user import User


class TwoFactorService:
    """Service for managing 2FA with TOTP"""

    @staticmethod
    def generate_secret() -> str:
        """Generate a new TOTP secret"""
        return pyotp.random_base32()

    @staticmethod
    def generate_qr_code(user_email: str, secret: str, issuer: str = "Rally Forge") -> str:
        """Generate QR code for TOTP setup"""
        # Create provisioning URI
        totp = pyotp.TOTP(secret)
        provisioning_uri = totp.provisioning_uri(
            name=user_email,
            issuer_name=issuer
        )

        # Generate QR code
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(provisioning_uri)
        qr.make(fit=True)

        img = qr.make_image(fill_color="black", back_color="white")

        # Convert to base64
        buffer = BytesIO()
        img.save(buffer, format='PNG')
        buffer.seek(0)
        img_base64 = base64.b64encode(buffer.getvalue()).decode()

        return f"data:image/png;base64,{img_base64}"

    @staticmethod
    def verify_token(secret: str, token: str) -> bool:
        """Verify a TOTP token"""
        totp = pyotp.TOTP(secret)
        return totp.verify(token, valid_window=1)  # Allow 30 seconds before/after

    @staticmethod
    def generate_backup_codes(count: int = 10) -> list[str]:
        """Generate backup codes for account recovery"""
        import secrets
        return [secrets.token_hex(4).upper() for _ in range(count)]

    @staticmethod
    async def enable_2fa(
        db: Session,
        user: User,
        token: str
    ) -> Tuple[bool, Optional[list[str]]]:
        """Enable 2FA for a user after verifying the setup token"""
        if not user.totp_secret:
            return False, None

        # Verify the token
        if not TwoFactorService.verify_token(user.totp_secret, token):
            return False, None

        # Generate backup codes
        backup_codes = TwoFactorService.generate_backup_codes()

        # Hash backup codes before storing
        from app.utils.security import hash_password
        hashed_codes = [hash_password(code) for code in backup_codes]

        # Enable 2FA
        user.totp_enabled = True
        user.totp_backup_codes = hashed_codes
        db.commit()

        return True, backup_codes

    @staticmethod
    async def verify_2fa(
        user: User,
        token: str
    ) -> bool:
        """Verify 2FA token or backup code"""
        if not user.totp_enabled or not user.totp_secret:
            return False

        # Try TOTP token first
        if TwoFactorService.verify_token(user.totp_secret, token):
            return True

        # Try backup codes
        if user.totp_backup_codes:
            from app.utils.security import verify_password
            for i, hashed_code in enumerate(user.totp_backup_codes):
                if verify_password(token.upper(), hashed_code):
                    # Remove used backup code
                    user.totp_backup_codes.pop(i)
                    return True

        return False

    @staticmethod
    async def disable_2fa(db: Session, user: User):
        """Disable 2FA for a user"""
        user.totp_enabled = False
        user.totp_secret = None
        user.totp_backup_codes = None
        db.commit()

