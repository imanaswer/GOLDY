#!/usr/bin/env python3
"""Clear test data from database"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent / 'backend'
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'gold_shop_erp')

async def clear_data():
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    print("Clearing test data...")
    
    # Clear collections (but keep users)
    await db.inventory_headers.delete_many({})
    await db.stock_movements.delete_many({})
    await db.parties.delete_many({})
    await db.invoices.delete_many({})
    await db.purchases.delete_many({})
    await db.jobcards.delete_many({})
    await db.accounts.delete_many({})
    await db.transactions.delete_many({})
    
    print("✓ Data cleared")
    client.close()

if __name__ == "__main__":
    asyncio.run(clear_data())
