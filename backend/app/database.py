from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional
import os
from dotenv import load_dotenv

load_dotenv()

class Database:
    client: Optional[AsyncIOMotorClient] = None

database = Database()

async def get_database():
    return database.client[os.getenv("DATABASE_NAME", "hrms_lite")]

async def connect_to_mongo():
    """Connect to MongoDB"""
    database.client = AsyncIOMotorClient(os.getenv("MONGODB_URL"))
    print("Connected to MongoDB")

async def close_mongo_connection():
    """Close MongoDB connection"""
    if database.client:
        database.client.close()
        print("Closed MongoDB connection")
