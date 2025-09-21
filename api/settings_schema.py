# app/schemas/settings_schema.py
from pydantic import BaseModel, EmailStr
from typing import Optional

class SettingBase(BaseModel):
    key: str
    value: Optional[str]

class SettingCreate(SettingBase):
    pass

from pydantic import BaseModel

class SettingsUpdate(BaseModel):
    # General
    siteName: str
    baseUrl: str
    locale: str
    timezone: str
    currency: str
    enableAnalytics: int

    # Store Info
    contactEmail: EmailStr
    contactPhone: str
    address: str
    storeLogo: Optional[str] = None
    storeTagline: Optional[str] = None
    storeTimezone: str

    # SEO
    metaTitle: str
    metaDescription: str
    metaKeywords: Optional[str] = None
    robotsTxt: str

    # Emails
    supportEmail: EmailStr
    fromEmail: EmailStr
    smtpHost: Optional[str] = None
    smtpPort: int
    smtpUser: Optional[str] = None
    smtpPass: Optional[str] = None

    # Maintenance
    maintenanceMode: int
    maintenanceMessage: str

    # Security
    enable2FA: int
    passwordExpiryDays: int
    maxLoginAttempts: int
    enableCaptcha: int
    passwordComplexity: str

    # Payments
    enableCOD: int
    enableStripe: int
    stripeApiKey: Optional[str] = None
    enablePayPal: int
    paypalClientId: Optional[str] = None

    # Shipping
    defaultShippingMethod: str
    freeShippingThreshold: int
    enableExpressShipping: int

    # Analytics
    googleAnalyticsId: Optional[str] = None
    facebookPixelId: Optional[str] = None
    hotjarId: Optional[str] = None

    # Social Media
    facebookUrl: Optional[str] = None
    twitterUrl: Optional[str] = None
    instagramUrl: Optional[str] = None
    linkedinUrl: Optional[str] = None


class SettingOut(SettingBase):
    id: int

    class Config:
        from_attributes = True  # Allows ORM mode (formerly orm_mode)
