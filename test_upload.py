#!/usr/bin/env python3
"""
Simple test script to verify file upload functionality
"""

import requests
import os
from PIL import Image
import io

def create_test_image():
    """Create a simple test image"""
    # Create a simple 100x100 red image
    img = Image.new('RGB', (100, 100), color='red')
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='PNG')
    img_bytes.seek(0)
    return img_bytes

def test_upload():
    """Test the file upload endpoint"""
    base_url = 'http://localhost:8000'
    
    # First, get the CSRF token from the main page
    session = requests.Session()
    
    try:
        print("Getting CSRF token...")
        response = session.get(f'{base_url}/')
        
        if response.status_code != 200:
            print(f"Failed to get main page. Status: {response.status_code}")
            return
            
        # Extract CSRF token from the page
        csrf_token = None
        for line in response.text.split('\n'):
            if 'csrfmiddlewaretoken' in line:
                # Extract token value from input field
                start = line.find('value="') + 7
                end = line.find('"', start)
                csrf_token = line[start:end]
                break
        
        if not csrf_token:
            print("Could not find CSRF token in the page")
            return
            
        print(f"Found CSRF token: {csrf_token[:20]}...")
        
        # Create test image
        test_image = create_test_image()
        
        # Prepare files for upload
        files = {
            'image': ('test_image.png', test_image, 'image/png')
        }
        
        # Prepare headers with CSRF token
        headers = {
            'X-CSRFToken': csrf_token,
            'Referer': f'{base_url}/'
        }
        
        print("Testing file upload...")
        response = session.post(f'{base_url}/predict/', files=files, headers=headers)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            print("SUCCESS! File upload test PASSED!")
            try:
                result = response.json()
                print(f"Response: {result}")
            except:
                print(f"Response text: {response.text[:200]}...")
        else:
            print("FAILED! File upload test FAILED!")
            print(f"Response: {response.text[:500]}...")
            
    except requests.exceptions.ConnectionError:
        print("Could not connect to server. Make sure Django server is running on localhost:8000")
    except Exception as e:
        print(f"Error during test: {e}")

if __name__ == "__main__":
    test_upload()
