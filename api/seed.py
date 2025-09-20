from database import SessionLocal, engine
import admin_model, admin_auth
from sqlalchemy.orm import Session

def seed():
    db: Session = SessionLocal()
    admin_model.Base.metadata.create_all(bind=engine)
    # create roles
    for r in ["admin", "editor", "user"]:
        if not db.query(admin_model.Role).filter(admin_model.Role.name == r).first():
            db.add(admin_model.Role(name=r))
    db.commit()

    # admin account
    if not db.query(admin_model.User).filter(admin_model.User.username == "admin").first():
        role = db.query(admin_model.Role).filter(admin_model.Role.name == "admin").first()
        admin = admin_model.User(username="admin", hashed_password=admin_auth.get_password_hash("admin123"), role=role)
        db.add(admin)
        db.commit()
        print("Created admin user: admin / admin123")

    db.close()

if __name__ == "__main__":
    seed()
