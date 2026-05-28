import requests

url = 'http://127.0.0.1:8000/houses/'
data = {
    "title": "Test House",
    "location": "Nairobi, Kenya",
    "price": 25000,
    "description": "A beautiful test house",
    "owner_name": "Nelson Omwenga",
    "owner_email": "nelson@example.com"
}

try:
    response = requests.post(url, json=data)
    print(f'Status: {response.status_code}')
    print(f'Response: {response.text}')
except Exception as e:
    print(f'Error: {e}')