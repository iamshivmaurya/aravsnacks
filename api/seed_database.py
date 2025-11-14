from database import SessionLocal, engine
import admin_model
from sqlalchemy.orm import Session
from passlib.context import CryptContext
import os

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def seed_database():
    db: Session = SessionLocal()
    
    # Create all tables
    admin_model.Base.metadata.create_all(bind=engine)
    print("✅ Tables created successfully")
    
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
            print(f"✅ Created role: {role_data['name']}")
    
    db.commit()
    
    # Create initial admin permissions
    admin_role = db.query(admin_model.Role).filter(admin_model.Role.name == "admin").first()
    
    # Define admin permissions
    admin_permissions = [
        {"path": "/api/v1/admin/users", "method": "GET"},
        {"path": "/api/v1/admin/users", "method": "POST"},
        {"path": "/api/v1/admin/users", "method": "PUT"},
        {"path": "/api/v1/admin/users", "method": "DELETE"},
        {"path": "/api/v1/admin/roles", "method": "GET"},
        {"path": "/api/v1/admin/roles", "method": "POST"},
        {"path": "/api/v1/admin/roles", "method": "PUT"},
        {"path": "/api/v1/admin/roles", "method": "DELETE"},
        {"path": "/api/v1/admin/permissions", "method": "GET"},
        {"path": "/api/v1/admin/permissions", "method": "POST"},
        {"path": "/api/v1/admin/permissions", "method": "PUT"},
        {"path": "/api/v1/admin/permissions", "method": "DELETE"},
        {"path": "/api/v1/admin/*", "method": "*"}
    ]
    
    for perm_data in admin_permissions:
        permission = admin_model.RolePermission(
            role_id=admin_role.id,
            path=perm_data["path"],
            method=perm_data["method"],
            allowed=True
        )
        db.add(permission)
        print(f"✅ Created permission: {perm_data['method']} {perm_data['path']}")
    
    db.commit()
    
    # Create initial admin user
    if not db.query(admin_model.User).filter(admin_model.User.username == "admin").first():
        admin_user = admin_model.User(
            username="admin",
            hashed_password=pwd_context.hash("admin123"),
            role_id=admin_role.id,
            is_active=True
        )
        db.add(admin_user)
        db.commit()
        print("✅ Created admin user: admin / admin123")
    
    db.close()
    print("🎉 Database seeding completed successfully!")

if __name__ == "__main__":
    seed_database()