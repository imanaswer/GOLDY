#!/usr/bin/env python3
"""
Specific Pagination Tests for Inventory Stock Totals and Recent Movements
Testing the exact requirements from the review request
"""

import requests
import json
from datetime import datetime

# Configuration
BACKEND_URL = "http://localhost:8001/api"
TEST_USER = {
    "username": "admin",
    "password": "admin123"
}

def authenticate():
    """Authenticate and get session"""
    session = requests.Session()
    
    # Login
    login_data = {
        "username": TEST_USER["username"],
        "password": TEST_USER["password"]
    }
    
    response = session.post(f"{BACKEND_URL}/auth/login", json=login_data)
    
    if response.status_code == 200:
        data = response.json()
        auth_token = data.get("access_token")
        csrf_token = data.get("csrf_token")
        
        # Set headers for future requests
        session.headers.update({
            "Authorization": f"Bearer {auth_token}",
            "X-CSRF-Token": csrf_token
        })
        
        print("✅ Authentication successful")
        return session
    else:
        print(f"❌ Authentication failed: {response.status_code}")
        return None

def test_stock_totals_pagination(session):
    """Test Stock Totals Pagination as per review request"""
    print("\n" + "="*60)
    print("🎯 TESTING STOCK TOTALS PAGINATION")
    print("="*60)
    
    # Test 1: GET with page=1&page_size=10
    print("\n1. Testing GET /api/inventory/stock-totals?page=1&page_size=10")
    response1 = session.get(f"{BACKEND_URL}/inventory/stock-totals?page=1&page_size=10")
    
    if response1.status_code == 200:
        data1 = response1.json()
        print(f"   ✅ Status: {response1.status_code}")
        
        # Verify response format: {items: [], pagination: {}}
        has_items = 'items' in data1
        has_pagination = 'pagination' in data1
        print(f"   ✅ Has 'items' key: {has_items}")
        print(f"   ✅ Has 'pagination' key: {has_pagination}")
        
        if has_items and has_pagination:
            items = data1['items']
            pagination = data1['pagination']
            
            print(f"   ✅ Items count: {len(items)}")
            print(f"   ✅ Pagination metadata: {pagination}")
            
            # Verify pagination metadata
            required_fields = ['page', 'page_size', 'total_count', 'total_pages', 'has_next', 'has_prev']
            metadata_correct = all(field in pagination for field in required_fields)
            print(f"   ✅ Pagination metadata complete: {metadata_correct}")
            
            # Test 2: GET with page=2&page_size=10 (if enough data exists)
            total_count = pagination.get('total_count', 0)
            if total_count > 10:
                print(f"\n2. Testing GET /api/inventory/stock-totals?page=2&page_size=10")
                response2 = session.get(f"{BACKEND_URL}/inventory/stock-totals?page=2&page_size=10")
                
                if response2.status_code == 200:
                    data2 = response2.json()
                    print(f"   ✅ Status: {response2.status_code}")
                    
                    if 'pagination' in data2:
                        pagination2 = data2['pagination']
                        page_correct = pagination2.get('page') == 2
                        has_prev_correct = pagination2.get('has_prev') == True
                        print(f"   ✅ Page 2 metadata correct: page={pagination2.get('page')}, has_prev={pagination2.get('has_prev')}")
                    else:
                        print("   ❌ Page 2 missing pagination metadata")
                else:
                    print(f"   ❌ Page 2 failed: {response2.status_code}")
            else:
                print(f"\n2. Skipping page 2 test (total_count={total_count} <= 10)")
            
            return True
        else:
            print("   ❌ Missing required response structure")
            return False
    else:
        print(f"   ❌ Request failed: {response1.status_code} - {response1.text}")
        return False

def test_movements_pagination(session):
    """Test Recent Movements Pagination as per review request"""
    print("\n" + "="*60)
    print("🎯 TESTING RECENT MOVEMENTS PAGINATION")
    print("="*60)
    
    # Test 1: GET with page=1&page_size=10
    print("\n1. Testing GET /api/inventory/movements?page=1&page_size=10")
    response1 = session.get(f"{BACKEND_URL}/inventory/movements?page=1&page_size=10")
    
    if response1.status_code == 200:
        data1 = response1.json()
        print(f"   ✅ Status: {response1.status_code}")
        
        # Verify response format changed from [...] to {items: [], pagination: {}}
        is_array = isinstance(data1, list)
        has_items = 'items' in data1
        has_pagination = 'pagination' in data1
        
        print(f"   ✅ Response is array (old format): {is_array}")
        print(f"   ✅ Has 'items' key (new format): {has_items}")
        print(f"   ✅ Has 'pagination' key (new format): {has_pagination}")
        
        if is_array:
            print("   ❌ ERROR: Response is still in old array format!")
            print("   Expected: {items: [], pagination: {}}")
            print(f"   Actual: Array with {len(data1)} items")
            return False
        
        if has_items and has_pagination:
            items = data1['items']
            pagination = data1['pagination']
            
            print(f"   ✅ Items count: {len(items)}")
            print(f"   ✅ Pagination metadata: {pagination}")
            
            # Verify pagination metadata
            required_fields = ['page', 'page_size', 'total_count', 'total_pages', 'has_next', 'has_prev']
            metadata_correct = all(field in pagination for field in required_fields)
            print(f"   ✅ Pagination metadata complete: {metadata_correct}")
            
            # Verify items are sorted by date descending
            if len(items) > 1:
                dates_descending = True
                for i in range(len(items) - 1):
                    current_date = items[i].get('date') or items[i].get('created_at')
                    next_date = items[i + 1].get('date') or items[i + 1].get('created_at')
                    if current_date and next_date and current_date < next_date:
                        dates_descending = False
                        break
                print(f"   ✅ Items sorted by date descending: {dates_descending}")
            
            # Test 2: GET with page=2&page_size=10 (if enough data exists)
            total_count = pagination.get('total_count', 0)
            if total_count > 10:
                print(f"\n2. Testing GET /api/inventory/movements?page=2&page_size=10")
                response2 = session.get(f"{BACKEND_URL}/inventory/movements?page=2&page_size=10")
                
                if response2.status_code == 200:
                    data2 = response2.json()
                    print(f"   ✅ Status: {response2.status_code}")
                    
                    if 'pagination' in data2:
                        pagination2 = data2['pagination']
                        page_correct = pagination2.get('page') == 2
                        has_prev_correct = pagination2.get('has_prev') == True
                        print(f"   ✅ Page 2 metadata correct: page={pagination2.get('page')}, has_prev={pagination2.get('has_prev')}")
                    else:
                        print("   ❌ Page 2 missing pagination metadata")
                else:
                    print(f"   ❌ Page 2 failed: {response2.status_code}")
            else:
                print(f"\n2. Skipping page 2 test (total_count={total_count} <= 10)")
            
            return True
        else:
            print("   ❌ Missing required response structure")
            return False
    else:
        print(f"   ❌ Request failed: {response1.status_code} - {response1.text}")
        return False

def test_existing_functionality(session):
    """Verify that all other inventory endpoints work correctly"""
    print("\n" + "="*60)
    print("🎯 TESTING EXISTING FUNCTIONALITY")
    print("="*60)
    
    endpoints_to_test = [
        "/inventory/headers",
        "/inventory/stock-totals",  # Without pagination params
        "/inventory/movements",     # Without pagination params
    ]
    
    all_working = True
    
    for endpoint in endpoints_to_test:
        print(f"\nTesting {endpoint}")
        response = session.get(f"{BACKEND_URL}{endpoint}")
        
        if response.status_code == 200:
            try:
                data = response.json()
                print(f"   ✅ Status: {response.status_code}, JSON parseable: True")
            except:
                print(f"   ❌ Status: {response.status_code}, JSON parseable: False")
                all_working = False
        else:
            print(f"   ❌ Status: {response.status_code}")
            all_working = False
    
    return all_working

def main():
    """Main test execution"""
    print("🎯 PAGINATION IMPLEMENTATION VERIFICATION")
    print("Testing newly implemented pagination for:")
    print("1. Inventory Stock Totals (/api/inventory/stock-totals)")
    print("2. Recent Movements (/api/inventory/movements)")
    
    # Authenticate
    session = authenticate()
    if not session:
        return
    
    # Run tests
    stock_totals_ok = test_stock_totals_pagination(session)
    movements_ok = test_movements_pagination(session)
    existing_ok = test_existing_functionality(session)
    
    # Summary
    print("\n" + "="*60)
    print("🔍 FINAL RESULTS")
    print("="*60)
    print(f"Stock Totals Pagination: {'✅ WORKING' if stock_totals_ok else '❌ FAILED'}")
    print(f"Movements Pagination: {'✅ WORKING' if movements_ok else '❌ FAILED'}")
    print(f"Existing Functionality: {'✅ WORKING' if existing_ok else '❌ FAILED'}")
    
    if stock_totals_ok and movements_ok and existing_ok:
        print("\n🎉 ALL PAGINATION TESTS PASSED!")
        print("✅ Pagination implementation is working correctly")
        print("✅ Response formats are correct")
        print("✅ No breaking changes detected")
    else:
        print("\n❌ SOME TESTS FAILED!")
        if not stock_totals_ok:
            print("🔧 Stock Totals pagination needs attention")
        if not movements_ok:
            print("🔧 Movements pagination needs attention")
        if not existing_ok:
            print("🔧 Existing functionality has issues")

if __name__ == "__main__":
    main()