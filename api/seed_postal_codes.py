# seed_postal_codes.py
from database import SessionLocal, engine
from model import PostalCode, Base
from sqlalchemy.orm import Session


def seed_postal_codes():
    db: Session = SessionLocal()

    try:
        # Create tables if they don't exist
        Base.metadata.create_all(bind=engine)

        postal_codes_data = [
            {"postal_code": "110001", "latitude": 28.6139, "longitude": 77.2090, "city": "New Delhi"},
            {"postal_code": "110002", "latitude": 28.6358, "longitude": 77.2245, "city": "New Delhi"},
            {"postal_code": "110003", "latitude": 28.6345, "longitude": 77.2145, "city": "New Delhi"},
            {"postal_code": "110004", "latitude": 28.6325, "longitude": 77.2045, "city": "New Delhi"},
            {"postal_code": "110005", "latitude": 28.6305, "longitude": 77.1945, "city": "New Delhi"},
            {"postal_code": "110006", "latitude": 28.6285, "longitude": 77.1845, "city": "New Delhi"},
            {"postal_code": "110007", "latitude": 28.6265, "longitude": 77.1745, "city": "New Delhi"},
            {"postal_code": "110008", "latitude": 28.6245, "longitude": 77.1645, "city": "New Delhi"},
            {"postal_code": "110009", "latitude": 28.6225, "longitude": 77.1545, "city": "New Delhi"},
            {"postal_code": "110010", "latitude": 28.6205, "longitude": 77.1445, "city": "New Delhi"},
            {"postal_code": "110034", "latitude": 28.7041, "longitude": 77.1025, "city": "New Delhi"},
            {"postal_code": "110044", "latitude": 28.4595, "longitude": 77.0266, "city": "New Delhi"},
            {"postal_code": "110092", "latitude": 28.5355, "longitude": 77.3910, "city": "New Delhi"}
        ]

        for postal_data in postal_codes_data:
            # Check if postal code already exists
            existing = db.query(PostalCode).filter(PostalCode.postal_code == postal_data["postal_code"]).first()
            if not existing:
                postal_code = PostalCode(**postal_data)
                db.add(postal_code)
                print(f"✅ Created postal code: {postal_data['postal_code']} - {postal_data['city']}")
            else:
                print(f"⚠️ Postal code already exists: {postal_data['postal_code']}")

        db.commit()
        print("🎉 Postal codes seeding completed successfully!")

    except Exception as e:
        print(f"❌ Error seeding postal codes: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_postal_codes()