#!/usr/bin/env python3
"""
Test script to verify the use case generation endpoint
"""
import requests
import json

# Test data
business_problem = "We need to reduce customer churn by predicting which customers are likely to leave and proactively engaging them with personalized offers."
ai_pattern = "Predictive Analytics & Decision Support"
initiative_id = 1  # Assuming initiative ID 1 exists

# API endpoint
url = "http://localhost:8000/api/v1/ai-projects/pmi-cpmai/generate-tactical-use-cases"

# Make request
params = {
    "business_problem": business_problem,
    "ai_pattern": ai_pattern,
    "initiative_id": initiative_id
}

print("Testing use case generation endpoint...")
print(f"URL: {url}")
print(f"Params: {json.dumps(params, indent=2)}")
print("\nSending request...\n")

try:
    response = requests.post(url, params=params, timeout=60)
    
    print(f"Status Code: {response.status_code}")
    print(f"Response Headers: {dict(response.headers)}")
    print("\nResponse Body:")
    print(json.dumps(response.json(), indent=2))
    
    if response.status_code == 200:
        data = response.json()
        if data.get("success"):
            use_cases = data.get("data", {}).get("use_cases", [])
            print(f"\n✅ SUCCESS! Generated {len(use_cases)} use cases")
        else:
            print(f"\n❌ FAILED: {data.get('error', 'Unknown error')}")
    else:
        print(f"\n❌ HTTP Error: {response.status_code}")
        
except requests.exceptions.Timeout:
    print("\n❌ Request timed out after 60 seconds")
except requests.exceptions.ConnectionError:
    print("\n❌ Could not connect to backend server")
except Exception as e:
    print(f"\n❌ Error: {str(e)}")
