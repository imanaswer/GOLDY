import requests
import sys
import json
from datetime import datetime

class GoldShopERPTester:
    def __init__(self, base_url="https://goldtracker-18.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.user_id = None
        self.created_resources = {
            'headers': [],
            'parties': [],
            'accounts': [],
            'jobcards': [],
            'invoices': []
        }

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {method} {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return True, response.json()
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_detail = response.json()
                    print(f"   Error: {error_detail}")
                except:
                    print(f"   Response: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_login(self):
        """Test login with admin credentials"""
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "auth/login",
            200,
            data={"username": "admin", "password": "admin123"}
        )
        if success and 'access_token' in response:
            self.token = response['access_token']
            self.user_id = response['user']['id']
            print(f"   Token obtained: {self.token[:20]}...")
            return True
        return False

    def test_auth_me(self):
        """Test getting current user info"""
        success, response = self.run_test(
            "Get Current User",
            "GET",
            "auth/me",
            200
        )
        return success and response.get('username') == 'admin'

    def test_inventory_headers(self):
        """Test inventory headers CRUD"""
        # Get existing headers
        success, headers = self.run_test(
            "Get Inventory Headers",
            "GET",
            "inventory/headers",
            200
        )
        if not success:
            return False

        # Create new header
        test_header_name = f"Test Category {datetime.now().strftime('%H%M%S')}"
        success, new_header = self.run_test(
            "Create Inventory Header",
            "POST",
            "inventory/headers",
            200,
            data={"name": test_header_name}
        )
        if success and new_header.get('id'):
            self.created_resources['headers'].append(new_header['id'])
            return True
        return False

    def test_stock_movements(self):
        """Test stock movements"""
        # First ensure we have a header
        if not self.created_resources['headers']:
            return False

        header_id = self.created_resources['headers'][0]
        
        # Create stock movement
        movement_data = {
            "movement_type": "Stock IN",
            "header_id": header_id,
            "description": "Test stock movement",
            "qty_delta": 5,
            "weight_delta": 25.500,
            "purity": 916,
            "notes": "Test movement"
        }
        
        success, movement = self.run_test(
            "Create Stock Movement",
            "POST",
            "inventory/movements",
            200,
            data=movement_data
        )
        
        if success:
            # Get stock totals
            success2, totals = self.run_test(
                "Get Stock Totals",
                "GET",
                "inventory/stock-totals",
                200
            )
            return success2
        return False

    def test_parties(self):
        """Test parties CRUD"""
        # Create customer
        customer_data = {
            "name": f"Test Customer {datetime.now().strftime('%H%M%S')}",
            "phone": "+968 9999 9999",
            "address": "Test Address",
            "party_type": "customer",
            "notes": "Test customer"
        }
        
        success, customer = self.run_test(
            "Create Customer",
            "POST",
            "parties",
            200,
            data=customer_data
        )
        
        if success and customer.get('id'):
            self.created_resources['parties'].append(customer['id'])
            
            # Get all parties
            success2, parties = self.run_test(
                "Get All Parties",
                "GET",
                "parties",
                200
            )
            
            # Get outstanding summary
            success3, outstanding = self.run_test(
                "Get Outstanding Summary",
                "GET",
                "parties/outstanding-summary",
                200
            )
            
            return success2 and success3
        return False

    def test_accounts(self):
        """Test accounts CRUD"""
        account_data = {
            "name": f"Test Cash Account {datetime.now().strftime('%H%M%S')}",
            "account_type": "cash",
            "opening_balance": 1000.000
        }
        
        success, account = self.run_test(
            "Create Account",
            "POST",
            "accounts",
            200,
            data=account_data
        )
        
        if success and account.get('id'):
            self.created_resources['accounts'].append(account['id'])
            
            # Get all accounts
            success2, accounts = self.run_test(
                "Get All Accounts",
                "GET",
                "accounts",
                200
            )
            return success2
        return False

    def test_transactions(self):
        """Test transactions"""
        if not self.created_resources['accounts']:
            return False
            
        account_id = self.created_resources['accounts'][0]
        
        transaction_data = {
            "transaction_type": "credit",
            "mode": "cash",
            "account_id": account_id,
            "amount": 500.000,
            "category": "sales",
            "notes": "Test transaction"
        }
        
        success, transaction = self.run_test(
            "Create Transaction",
            "POST",
            "transactions",
            200,
            data=transaction_data
        )
        
        if success:
            # Get all transactions
            success2, transactions = self.run_test(
                "Get All Transactions",
                "GET",
                "transactions",
                200
            )
            return success2
        return False

    def test_jobcards(self):
        """Test job cards"""
        if not self.created_resources['parties']:
            return False
            
        customer_id = self.created_resources['parties'][0]
        
        jobcard_data = {
            "card_type": "individual",
            "customer_id": customer_id,
            "delivery_date": "2025-01-15",
            "notes": "Test job card",
            "items": [{
                "category": "Chain",
                "description": "Gold chain repair",
                "qty": 1,
                "weight_in": 15.500,
                "weight_out": 15.200,
                "purity": 916,
                "work_type": "polish",
                "remarks": "Polish and clean"
            }]
        }
        
        success, jobcard = self.run_test(
            "Create Job Card",
            "POST",
            "jobcards",
            200,
            data=jobcard_data
        )
        
        if success and jobcard.get('id'):
            self.created_resources['jobcards'].append(jobcard['id'])
            
            # Get all job cards
            success2, jobcards = self.run_test(
                "Get All Job Cards",
                "GET",
                "jobcards",
                200
            )
            
            # Update job card status to completed
            success3, update_result = self.run_test(
                "Update Job Card Status",
                "PATCH",
                f"jobcards/{jobcard['id']}",
                200,
                data={"status": "completed"}
            )
            
            if success3:
                # Convert to invoice
                success4, invoice = self.run_test(
                    "Convert Job Card to Invoice",
                    "POST",
                    f"jobcards/{jobcard['id']}/convert-to-invoice",
                    200
                )
                
                if success4 and invoice.get('id'):
                    self.created_resources['invoices'].append(invoice['id'])
                    return success2 and success4
            
            return success2
        return False

    def test_invoices(self):
        """Test invoices"""
        # Get all invoices
        success, invoices = self.run_test(
            "Get All Invoices",
            "GET",
            "invoices",
            200
        )
        return success

    def test_audit_logs(self):
        """Test audit logs"""
        success, logs = self.run_test(
            "Get Audit Logs",
            "GET",
            "audit-logs",
            200
        )
        return success

    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 Starting Gold Shop ERP Backend Tests")
        print(f"📍 Testing against: {self.base_url}")
        print("=" * 60)

        # Authentication tests
        if not self.test_login():
            print("❌ Login failed, stopping tests")
            return False

        if not self.test_auth_me():
            print("❌ Auth verification failed")
            return False

        # Core functionality tests
        test_results = {
            "Inventory Headers": self.test_inventory_headers(),
            "Stock Movements": self.test_stock_movements(),
            "Parties Management": self.test_parties(),
            "Accounts Management": self.test_accounts(),
            "Transactions": self.test_transactions(),
            "Job Cards": self.test_jobcards(),
            "Invoices": self.test_invoices(),
            "Audit Logs": self.test_audit_logs()
        }

        # Print results summary
        print("\n" + "=" * 60)
        print("📊 TEST RESULTS SUMMARY")
        print("=" * 60)
        
        for test_name, result in test_results.items():
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"{test_name:<25} {status}")

        print(f"\n📈 Overall: {self.tests_passed}/{self.tests_run} tests passed")
        
        success_rate = (self.tests_passed / self.tests_run) * 100 if self.tests_run > 0 else 0
        print(f"🎯 Success Rate: {success_rate:.1f}%")

        return success_rate >= 80

def main():
    tester = GoldShopERPTester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())