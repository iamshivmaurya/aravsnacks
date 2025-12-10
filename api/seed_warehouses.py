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
                "manager_contact": "9876543210",
                "latitude": 28.7041,
                "longitude": 77.1025
            },
            {
                "id": 2,
                "name": "South Warehouse",
                "location": "South Delhi",
                "pincode": "110044",
                "manager_name": "South Manager",
                "manager_contact": "9876543211",
                "latitude": 28.4595,
                "longitude": 77.0266
            },
            {
                "id": 3,
                "name": "East Warehouse",
                "location": "East Delhi",
                "pincode": "110092",
                "manager_name": "East Manager",
                "manager_contact": "9876543212",
                "latitude": 28.5355,
                "longitude": 77.3910
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
                # Update existing warehouse with coordinates
                existing.latitude = warehouse_data["latitude"]
                existing.longitude = warehouse_data["longitude"]
                print(f"🔄 Updated warehouse coordinates: {warehouse_data['name']}")

        db.commit()
        print("🎉 Warehouse seeding completed successfully!")

    except Exception as e:
        print(f"❌ Error seeding warehouses: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_warehouses()