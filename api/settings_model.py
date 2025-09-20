# app/models/settings_model.py
from sqlalchemy import Column, Integer, String, Boolean, Text
from database import Base

class SiteSetting(Base):
    __tablename__ = "site_settings"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(100), unique=True, nullable=False)
    value = Column(Text, nullable=True)
