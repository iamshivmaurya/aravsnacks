from sqlalchemy.orm import Session
from settings_model import SiteSetting

def get_all_settings(db: Session):
    return db.query(SiteSetting).all()

def get_setting(db: Session, key: str):
    return db.query(SiteSetting).filter(SiteSetting.key == key).first()

def create_or_update_setting(db: Session, key: str, value: str):
    setting = get_setting(db, key)
    if setting:
        setting.value = value
    else:
        setting = SiteSetting(key=key, value=value)
        db.add(setting)
    db.commit()
    db.refresh(setting)
    return setting


def get_setting_by_id(db: Session, setting_id: int):
    return db.query(SiteSetting).filter(SiteSetting.id == setting_id).first()