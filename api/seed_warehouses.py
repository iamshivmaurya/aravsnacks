# seed_warehouses.py
from database import SessionLocal, engine
from model import Warehouse, Base
from sqlalchemy.orm import Session


def seed_warehouses():
    db: Session = SessionLocal()

    try:
        # Create tables if they don't exist
        Base.metadata.create_all(bind=engine)

        warehouses_data = [
            {
                "id": 1,
                "name": "North Warehouse",
                "location": "North Delhi",
                "pincode": "110034",
                "manager_name": "North Manager",
                "manager_contact": "9876543210"
            },
            {
                "id": 2,
                "name": "South Warehouse",
                "location": "South Delhi",
                "pincode": "110044",
                "manager_name": "South Manager",
                "manager_contact": "9876543211"
            },
            {
                "id": 3,
                "name": "East Warehouse",
                "location": "East Delhi",
                "pincode": "110092",
                "manager_name": "East Manager",
                "manager_contact": "9876543212"
            }
        ]

        for warehouse_data in warehouses_data:
            # Check if warehouse already exists
            existing = db.query(Warehouse).filter(Warehouse.id == warehouse_data["id"]).first()
            if not existing:
                warehouse = Warehouse(**warehouse_data)
                db.add(warehouse)
                print(f"✅ Created warehouse: {warehouse_data['name']}")
            else:
                print(f"⚠️ Warehouse already exists: {warehouse_data['name']}")

        db.commit()
        print("🎉 Warehouse seeding completed successfully!")

    except Exception as e:
        print(f"❌ Error seeding warehouses: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_warehouses()