#!/usr/bin/env python3
"""
Security Headers Test Script for Phase 3
Tests all security headers implementation according to requirements
"""

import requests
import sys

# Test configuration
BASE_URL = "http://localhost:8001"

def test_security_headers():
    """Test all security headers are properly set"""
    
    print("=" * 80)
    print("SECURITY HEADERS TEST - PHASE 3")
    print("=" * 80)
    print()
    
    # Make a request to the health endpoint
    print(f"Testing endpoint: {BASE_URL}/api/health")
    print("-" * 80)
    
    try:
        response = requests.get(f"{BASE_URL}/api/health", timeout=5)
        headers = response.headers
        
        # Define expected headers
        tests = [
            {
                "name": "Content-Security-Policy (CSP)",
                "header": "content-security-policy",
                "expected_contains": [
                    "default-src 'self'",
                    "script-src 'self'",
                    "frame-ancestors 'none'",
                    "object-src 'none'"
                ],
                "requirement": "Restrict script sources, prevent inline scripts"
            },
            {
                "name": "X-Frame-Options",
                "header": "x-frame-options",
                "expected_value": "DENY",
                "requirement": "DENY (prevent clickjacking)"
            },
            {
                "name": "X-Content-Type-Options",
                "header": "x-content-type-options",
                "expected_value": "nosniff",
                "requirement": "nosniff"
            },
            {
                "name": "Strict-Transport-Security (HSTS)",
                "header": "strict-transport-security",
                "expected_contains": [
                    "max-age=31536000",
                    "includeSubDomains",
                    "preload"
                ],
                "requirement": "max-age=31536000; includeSubDomains; preload"
            },
            {
                "name": "X-XSS-Protection",
                "header": "x-xss-protection",
                "expected_contains": ["1", "mode=block"],
                "requirement": "1; mode=block"
            },
            {
                "name": "Referrer-Policy",
                "header": "referrer-policy",
                "expected_value": "strict-origin-when-cross-origin",
                "requirement": "Control referrer information"
            },
            {
                "name": "Permissions-Policy",
                "header": "permissions-policy",
                "expected_contains": ["geolocation=()", "camera=()", "microphone=()"],
                "requirement": "Restrict browser features"
            }
        ]
        
        # Test each header
        passed = 0
        failed = 0
        
        for test in tests:
            print()
            print(f"Testing: {test['name']}")
            print(f"Requirement: {test['requirement']}")
            
            header_value = headers.get(test['header'], '').lower()
            
            if not header_value:
                print(f"❌ FAILED: Header '{test['header']}' not found")
                failed += 1
                continue
            
            # Check expected value
            if 'expected_value' in test:
                if header_value == test['expected_value'].lower():
                    print(f"✅ PASSED: {test['header']}: {headers[test['header']]}")
                    passed += 1
                else:
                    print(f"❌ FAILED: Expected '{test['expected_value']}', got '{headers[test['header']]}'")
                    failed += 1
            
            # Check expected contains
            elif 'expected_contains' in test:
                all_found = True
                missing = []
                for expected in test['expected_contains']:
                    if expected.lower() not in header_value:
                        all_found = False
                        missing.append(expected)
                
                if all_found:
                    print(f"✅ PASSED: {test['header']}")
                    print(f"   Value: {headers[test['header']]}")
                    passed += 1
                else:
                    print(f"❌ FAILED: Missing values: {missing}")
                    print(f"   Actual: {headers[test['header']]}")
                    failed += 1
        
        # Print summary
        print()
        print("=" * 80)
        print("TEST SUMMARY")
        print("=" * 80)
        print(f"Total Tests: {len(tests)}")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print()
        
        if failed == 0:
            print("🎉 ALL SECURITY HEADERS TESTS PASSED!")
            print()
            print("Security Improvements Achieved:")
            print("✅ XSS Protection: CSP restricts script execution")
            print("✅ Clickjacking Protection: X-Frame-Options denies iframe embedding")
            print("✅ MIME Sniffing Protection: X-Content-Type-Options prevents content sniffing")
            print("✅ HTTPS Enforcement: HSTS forces secure connections")
            print("✅ Browser XSS Filter: X-XSS-Protection enables browser filtering")
            print("✅ Referrer Control: Referrer-Policy controls information leakage")
            print("✅ Feature Restriction: Permissions-Policy limits browser capabilities")
            print()
            return True
        else:
            print("⚠️ SOME TESTS FAILED - Please review the failures above")
            return False
            
    except requests.RequestException as e:
        print(f"❌ ERROR: Failed to connect to {BASE_URL}")
        print(f"   Error: {e}")
        return False
    except Exception as e:
        print(f"❌ ERROR: Unexpected error occurred")
        print(f"   Error: {e}")
        return False

if __name__ == "__main__":
    success = test_security_headers()
    sys.exit(0 if success else 1)
