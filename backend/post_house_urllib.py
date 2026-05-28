import urllib.request
import json

url = 'http://127.0.0.1:8000/houses/'
data = {
    "title": "Test House",
    "location": "Nairobi, Kenya",
    "price": 25000,
    "description": "A beautiful test house",
    "owner_name": "Nelson Omwenga",
    "owner_email": "nelson@example.com"
}

json_data = json.dumps(data).encode('utf-8')
req = urllib.request.Request(url, data=json_data, headers={'Content-Type': 'application/json'})

try:
    with urllib.request.urlopen(req) as response:
        result = response.read().decode('utf-8')
        print(f'Status: {response.status}')
        print(f'Response: {result}')
except Exception as e:
    print(f'Error: {e}')