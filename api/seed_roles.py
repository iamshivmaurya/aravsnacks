from database import SessionLocal, engine
import admin_model
import admin_auth
from sqlalchemy.orm import Session

def seed_initial_data():
    db: Session = SessionLocal()
    
    # Create tables
    admin_model.Base.metadata.create_all(bind=engine)
    
    # Create initial roles
    initial_roles = [
        {"name": "admin", "description": "Super Administrator with full access"},
        {"name": "manager", "description": "Manager with limited administrative access"},
        {"name": "editor", "description": "Content Editor"},
        {"name": "user", "description": "Regular User"}
    ]
    
    for role_data in initial_roles:
        if not db.query(admin_model.Role).filter(admin_model.Role.name == role_data["name"]).first():
            role = admin_model.Role(**role_data)
            db.add(role)
    
    db.commit()
    
    # Create admin user if not exists
    if not db.query(admin_model.User).filter(admin_model.User.username == "admin").first():
        admin_role = db.query(admin_model.Role).filter(admin_model.Role.name == "admin").first()
        admin_user = admin_model.User(
            username="admin",
            hashed_password=admin_auth.get_password_hash("admin123"),
            role_id=admin_role.id
        )
        db.add(admin_user)
    
    db.commit()
    db.close()
    print("Initial data seeded successfully!")

if __name__ == "__main__":
    seed_initial_data()