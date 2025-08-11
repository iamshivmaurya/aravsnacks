from sqlalchemy import create_engine                 # Column, Integer, String
from sqlalchemy.orm import declarative_base, sessionmaker


import os
from dotenv import load_dotenv  #pip install python-dotenv
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")


engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()




















# Database type: mysql
# Driver: mysqlconnector
# Username: root
# Password: (khaali hai, aap chahein to daal sakte hain)
# Host: localhost (yaani aapke computer par)
# Database: schooldb