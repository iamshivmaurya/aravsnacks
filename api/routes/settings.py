from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import settings_crud
from database import get_db
from typing import Dict
from settings_schema import SettingsUpdate
import admin_auth

router = APIRouter(prefix="/admin/settings")

@router.get("/")
def list_settings(db: Session = Depends(get_db)):
    all_settings = settings_crud.get_all_settings(db)
    return {s.key: s.value for s in all_settings}

@router.post("/")
def save_settings(data: SettingsUpdate, db: Session = Depends(get_db), current_user=Depends(admin_auth.require_role("admin"))):
    print(data)
    for key, value in data.dict().items():
        settings_crud.create_or_update_setting(db, key, str(value))  # store as string if DB is varchar
    return {"message": "Settings saved successfully"}



@router.get("/{setting_id}")
def get_setting(setting_id: int, db: Session = Depends(get_db)):
    setting = settings_crud.get_setting_by_id(db, setting_id)
    if setting:
        return {"id": setting.id, "value": setting.value}
    return {"error": "Setting not found"} 