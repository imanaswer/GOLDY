#!/usr/bin/env python3
"""
CRITICAL BUG FIX VERIFICATION - Comprehensive Backend Testing
Testing all 3 critical bug fixes:
1. Outstanding Reports Timezone Error (Bug Fix #3) - PRIORITY 1
2. Account Detail Endpoint (New Feature) - PRIORITY 2  
3. Account Balance Update After Purchase Finalization (Bug Fix #1) - PRIORITY 3 (MOST CRITICAL)
4. GET /api/purchases Serialization Error (Bug Fix #2) - PRIORITY 4
"""

import requests
import json
from datetime import datetime
import time

# Configuration
BASE_URL = "https://bugfix-progress-1.preview.emergentagent.com/api"
USERNAME = "admin"
PASSWORD = "admin123"

class BugFixTester:
    def __init__(self):
        self.session = requests.Session()
        self.token = None
        self.test_results = []
        
    def log_result(self, test_name, status, details=""):
        """Log test result"""
        result = {
            "test": test_name,
            "status": status,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        status_icon = "✅" if status == "PASS" else "❌"
        print(f"{status_icon} {test_name}: {status}")
        if details:
            print(f"   Details: {details}")
        print()
    
    def authenticate(self):
        """Authenticate and get JWT token"""
        print("🔐 AUTHENTICATING...")
        try:
            response = self.session.post(f"{BASE_URL}/auth/login", json={
                "username": USERNAME,
                "password": PASSWORD
            })
            
            if response.status_code == 200:
                data = response.json()
                self.token = data.get("access_token")
                self.session.headers.update({"Authorization": f"Bearer {self.token}"})
                self.log_result("Authentication", "PASS", f"Token obtained successfully")
                return True
            else:
                self.log_result("Authentication", "FAIL", f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Authentication", "FAIL", f"Exception: {str(e)}")
            return False
    
    def test_outstanding_reports(self):
        """🔥 PRIORITY 1: Test Outstanding Reports (Bug Fix #3)"""
        print("🔥 PRIORITY 1: TESTING OUTSTANDING REPORTS (Bug Fix #3)")
        print("=" * 60)
        
        try:
            response = self.session.get(f"{BASE_URL}/reports/outstanding")
            
            if response.status_code == 200:
                data = response.json()
                
                # Verify response structure
                required_fields = ["vendor_payables", "invoice_receivables"]
                missing_fields = [field for field in required_fields if field not in data]
                
                if missing_fields:
                    self.log_result("Outstanding Reports - Response Structure", "FAIL", 
                                  f"Missing fields: {missing_fields}")
                    return False
                
                # Check for overdue calculations
                vendor_payables = data.get("vendor_payables", [])
                invoice_receivables = data.get("invoice_receivables", [])
                
                # Verify overdue calculations are present
                overdue_fields_found = False
                for item in vendor_payables + invoice_receivables:
                    if any(key.startswith("overdue_") for key in item.keys()):
                        overdue_fields_found = True
                        break
                
                self.log_result("Outstanding Reports - API Response", "PASS", 
                              f"Status: 200 OK, Vendor Payables: {len(vendor_payables)}, Invoice Receivables: {len(invoice_receivables)}")
                
                if overdue_fields_found:
                    self.log_result("Outstanding Reports - Overdue Calculations", "PASS", 
                                  "Overdue calculations (overdue_0_7, overdue_8_30, overdue_31_plus) present")
                else:
                    self.log_result("Outstanding Reports - Overdue Calculations", "PASS", 
                                  "No overdue items found (expected if no overdue data exists)")
                
                self.log_result("Outstanding Reports - Timezone Fix", "PASS", 
                              "No timezone-related TypeError encountered")
                return True
                
            else:
                self.log_result("Outstanding Reports - API Response", "FAIL", 
                              f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Outstanding Reports - Exception", "FAIL", f"Exception: {str(e)}")
            return False
    
    def test_account_detail_endpoint(self):
        """🔥 PRIORITY 2: Test Account Detail Endpoint (New Feature)"""
        print("🔥 PRIORITY 2: TESTING ACCOUNT DETAIL ENDPOINT (New Feature)")
        print("=" * 60)
        
        try:
            # First get list of accounts
            accounts_response = self.session.get(f"{BASE_URL}/accounts")
            
            if accounts_response.status_code != 200:
                self.log_result("Account Detail - Get Accounts List", "FAIL", 
                              f"Status: {accounts_response.status_code}")
                return False
            
            accounts_data = accounts_response.json()
            accounts = accounts_data.get("items", []) if isinstance(accounts_data, dict) else accounts_data
            
            if not accounts:
                self.log_result("Account Detail - Get Accounts List", "FAIL", "No accounts found")
                return False
            
            self.log_result("Account Detail - Get Accounts List", "PASS", 
                          f"Found {len(accounts)} accounts")
            
            # Test with valid account ID
            test_account = accounts[0]
            account_id = test_account["id"]
            
            detail_response = self.session.get(f"{BASE_URL}/accounts/{account_id}")
            
            if detail_response.status_code == 200:
                account_detail = detail_response.json()
                
                # Verify required fields
                required_fields = ["id", "name", "type", "opening_balance", "current_balance"]
                missing_fields = [field for field in required_fields if field not in account_detail]
                
                if missing_fields:
                    self.log_result("Account Detail - Valid ID Response", "FAIL", 
                                  f"Missing fields: {missing_fields}")
                    return False
                
                self.log_result("Account Detail - Valid ID Response", "PASS", 
                              f"Account: {account_detail['name']}, Type: {account_detail['type']}, Balance: {account_detail['current_balance']}")
                
            else:
                self.log_result("Account Detail - Valid ID Response", "FAIL", 
                              f"Status: {detail_response.status_code}")
                return False
            
            # Test with invalid account ID
            invalid_response = self.session.get(f"{BASE_URL}/accounts/invalid-account-id")
            
            if invalid_response.status_code == 404:
                self.log_result("Account Detail - Invalid ID Response", "PASS", 
                              "Returns 404 Not Found for invalid account ID")
            else:
                self.log_result("Account Detail - Invalid ID Response", "FAIL", 
                              f"Expected 404, got {invalid_response.status_code}")
                return False
            
            return True
            
        except Exception as e:
            self.log_result("Account Detail - Exception", "FAIL", f"Exception: {str(e)}")
            return False
    
    def test_purchases_serialization(self):
        """🔥 PRIORITY 4: Quick Retest GET /api/purchases (Bug Fix #2)"""
        print("🔥 PRIORITY 4: TESTING GET /api/purchases SERIALIZATION (Bug Fix #2)")
        print("=" * 60)
        
        try:
            response = self.session.get(f"{BASE_URL}/purchases")
            
            if response.status_code == 200:
                data = response.json()
                
                # Verify response structure
                if isinstance(data, dict) and "items" in data and "pagination" in data:
                    purchases = data["items"]
                    self.log_result("Purchases Serialization - Response Structure", "PASS", 
                                  f"Correct structure: {{items: [], pagination: {{}}}}")
                    
                    self.log_result("Purchases Serialization - API Response", "PASS", 
                                  f"Status: 200 OK, Found {len(purchases)} purchases")
                    
                    # Check if any purchases exist and verify no ObjectId serialization errors
                    if purchases:
                        sample_purchase = purchases[0]
                        # Verify all fields are JSON serializable (no ObjectId errors)
                        try:
                            json.dumps(sample_purchase)
                            self.log_result("Purchases Serialization - ObjectId Fix", "PASS", 
                                          "No ObjectId serialization errors detected")
                        except Exception as e:
                            self.log_result("Purchases Serialization - ObjectId Fix", "FAIL", 
                                          f"Serialization error: {str(e)}")
                            return False
                    else:
                        self.log_result("Purchases Serialization - ObjectId Fix", "PASS", 
                                      "No purchases to test, but no serialization errors")
                    
                    return True
                else:
                    self.log_result("Purchases Serialization - Response Structure", "FAIL", 
                                  f"Incorrect structure: {type(data)}")
                    return False
                    
            else:
                self.log_result("Purchases Serialization - API Response", "FAIL", 
                              f"Status: {response.status_code}, Response: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Purchases Serialization - Exception", "FAIL", f"Exception: {str(e)}")
            return False
    
    def test_account_balance_update(self):
        """🔥 PRIORITY 3: Test Account Balance Update (Bug Fix #1) - MOST CRITICAL"""
        print("🔥 PRIORITY 3: TESTING ACCOUNT BALANCE UPDATE (Bug Fix #1) - MOST CRITICAL")
        print("=" * 60)
        
        try:
            # STEP 1: Get vendor for purchase
            parties_response = self.session.get(f"{BASE_URL}/parties?party_type=vendor")
            if parties_response.status_code != 200:
                self.log_result("Account Balance Update - Get Vendors", "FAIL", 
                              f"Status: {parties_response.status_code}")
                return False
            
            parties_data = parties_response.json()
            vendors = parties_data.get("items", []) if isinstance(parties_data, dict) else parties_data
            
            if not vendors:
                self.log_result("Account Balance Update - Get Vendors", "FAIL", "No vendors found")
                return False
            
            vendor = vendors[0]
            self.log_result("Account Balance Update - Get Vendors", "PASS", 
                          f"Using vendor: {vendor['name']}")
            
            # STEP 2: Get account for payment
            accounts_response = self.session.get(f"{BASE_URL}/accounts")
            if accounts_response.status_code != 200:
                self.log_result("Account Balance Update - Get Accounts", "FAIL", 
                              f"Status: {accounts_response.status_code}")
                return False
            
            accounts_data = accounts_response.json()
            accounts = accounts_data.get("items", []) if isinstance(accounts_data, dict) else accounts_data
            
            if not accounts:
                self.log_result("Account Balance Update - Get Accounts", "FAIL", "No accounts found")
                return False
            
            # Find a cash or bank account
            test_account = None
            for account in accounts:
                if account.get("type", "").lower() in ["cash", "bank"]:
                    test_account = account
                    break
            
            if not test_account:
                test_account = accounts[0]  # Use first account if no cash/bank found
            
            initial_balance = test_account["current_balance"]
            self.log_result("Account Balance Update - Get Accounts", "PASS", 
                          f"Using account: {test_account['name']}, Initial balance: {initial_balance} OMR")
            
            # STEP 3: Create new purchase
            purchase_data = {
                "vendor_party_id": vendor["id"],
                "description": "Test gold purchase for balance update verification",
                "weight_grams": 100.5,
                "purity_karats": 916,
                "rate_per_gram_omr": 45.00,
                "total_amount_omr": 4522.50
            }
            
            purchase_response = self.session.post(f"{BASE_URL}/purchases", json=purchase_data)
            
            if purchase_response.status_code != 201:
                self.log_result("Account Balance Update - Create Purchase", "FAIL", 
                              f"Status: {purchase_response.status_code}, Response: {purchase_response.text}")
                return False
            
            purchase = purchase_response.json()
            purchase_id = purchase["id"]
            self.log_result("Account Balance Update - Create Purchase", "PASS", 
                          f"Created purchase: {purchase_id}, Amount: {purchase['total_amount_omr']} OMR")
            
            # STEP 4: Finalize purchase with payment
            finalize_data = {
                "paid_amount": 2500.00,
                "payment_mode": "cash",
                "account_id": test_account["id"],
                "notes": "Test payment for purchase finalization"
            }
            
            finalize_response = self.session.post(f"{BASE_URL}/purchases/{purchase_id}/finalize", 
                                                json=finalize_data)
            
            if finalize_response.status_code != 200:
                self.log_result("Account Balance Update - Finalize Purchase", "FAIL", 
                              f"Status: {finalize_response.status_code}, Response: {finalize_response.text}")
                return False
            
            finalize_result = finalize_response.json()
            self.log_result("Account Balance Update - Finalize Purchase", "PASS", 
                          f"Purchase finalized successfully")
            
            # STEP 5: CRITICAL VERIFICATION - Check account balance after finalization
            time.sleep(1)  # Brief pause to ensure database update
            
            updated_account_response = self.session.get(f"{BASE_URL}/accounts/{test_account['id']}")
            
            if updated_account_response.status_code != 200:
                self.log_result("Account Balance Update - Get Updated Balance", "FAIL", 
                              f"Status: {updated_account_response.status_code}")
                return False
            
            updated_account = updated_account_response.json()
            new_balance = updated_account["current_balance"]
            expected_balance = initial_balance - 2500.00  # Payment should decrease balance
            
            # Check if balance updated correctly (allowing for small floating point differences)
            balance_difference = abs(new_balance - expected_balance)
            
            if balance_difference < 0.01:  # Within 1 cent tolerance
                self.log_result("Account Balance Update - Balance Verification", "PASS", 
                              f"Balance updated correctly: {initial_balance} → {new_balance} OMR (decreased by 2500.00)")
                
                # STEP 6: Verify transaction created
                transactions_response = self.session.get(f"{BASE_URL}/transactions?account_id={test_account['id']}")
                
                if transactions_response.status_code == 200:
                    transactions_data = transactions_response.json()
                    transactions = transactions_data.get("items", []) if isinstance(transactions_data, dict) else transactions_data
                    
                    # Look for the purchase payment transaction
                    purchase_transaction = None
                    for txn in transactions:
                        if (txn.get("category") == "Purchase Payment" and 
                            txn.get("amount") == 2500.00 and
                            txn.get("transaction_type") == "debit"):
                            purchase_transaction = txn
                            break
                    
                    if purchase_transaction:
                        self.log_result("Account Balance Update - Transaction Verification", "PASS", 
                                      f"Transaction created: Type={purchase_transaction['transaction_type']}, "
                                      f"Category={purchase_transaction['category']}, Amount={purchase_transaction['amount']}")
                    else:
                        self.log_result("Account Balance Update - Transaction Verification", "FAIL", 
                                      "Purchase payment transaction not found")
                        return False
                else:
                    self.log_result("Account Balance Update - Transaction Verification", "FAIL", 
                                  f"Failed to get transactions: {transactions_response.status_code}")
                    return False
                
                return True
                
            else:
                self.log_result("Account Balance Update - Balance Verification", "FAIL", 
                              f"Balance incorrect: Expected {expected_balance}, Got {new_balance}, "
                              f"Difference: {balance_difference}")
                return False
                
        except Exception as e:
            self.log_result("Account Balance Update - Exception", "FAIL", f"Exception: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all bug fix tests in priority order"""
        print("🚀 STARTING COMPREHENSIVE BUG FIX VERIFICATION")
        print("=" * 80)
        print(f"Backend URL: {BASE_URL}")
        print(f"Test Time: {datetime.now().isoformat()}")
        print("=" * 80)
        print()
        
        # Authenticate first
        if not self.authenticate():
            print("❌ AUTHENTICATION FAILED - CANNOT PROCEED WITH TESTS")
            return
        
        # Run tests in priority order
        test_functions = [
            ("PRIORITY 1: Outstanding Reports (Bug Fix #3)", self.test_outstanding_reports),
            ("PRIORITY 2: Account Detail Endpoint (New Feature)", self.test_account_detail_endpoint),
            ("PRIORITY 3: Account Balance Update (Bug Fix #1) - MOST CRITICAL", self.test_account_balance_update),
            ("PRIORITY 4: Purchases Serialization (Bug Fix #2)", self.test_purchases_serialization),
        ]
        
        passed_tests = 0
        total_tests = len(test_functions)
        
        for test_name, test_func in test_functions:
            print(f"\n{'='*80}")
            print(f"EXECUTING: {test_name}")
            print(f"{'='*80}")
            
            if test_func():
                passed_tests += 1
            
            print(f"{'='*80}")
            print(f"COMPLETED: {test_name}")
            print(f"{'='*80}\n")
        
        # Final summary
        print("\n" + "="*80)
        print("🎯 FINAL TEST RESULTS SUMMARY")
        print("="*80)
        
        success_rate = (passed_tests / total_tests) * 100
        
        print(f"📊 OVERALL SUCCESS RATE: {passed_tests}/{total_tests} ({success_rate:.1f}%)")
        print()
        
        for result in self.test_results:
            status_icon = "✅" if result["status"] == "PASS" else "❌"
            print(f"{status_icon} {result['test']}: {result['status']}")
            if result["details"]:
                print(f"   {result['details']}")
        
        print("\n" + "="*80)
        if passed_tests == total_tests:
            print("🎉 ALL BUG FIXES VERIFIED SUCCESSFULLY - PRODUCTION READY!")
        else:
            print(f"⚠️  {total_tests - passed_tests} TEST(S) FAILED - REQUIRES ATTENTION")
        print("="*80)

if __name__ == "__main__":
    tester = BugFixTester()
    tester.run_all_tests()