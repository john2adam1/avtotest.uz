#!/usr/bin/env python3
"""
Uploads all images from secondary_resources/express-medias to Supabase Storage bucket 'test-images'.
"""
import os
import re
import sys
import glob
from concurrent.futures import ThreadPoolExecutor, as_completed
import urllib.request
import urllib.error

SUPABASE_URL = "https://lgacbbewpuzeyxijzfii.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxnYWNiYmV3cHV6ZXl4aWp6ZmlpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjY0MTgzNywiZXhwIjoyMDgyMjE3ODM3fQ.j3wByC2gSwGdAS3vkHgIGtXCbHkRMBBWhqdhtpxrYZY"
BUCKET = "test-images"
MEDIA_DIR = "/Users/zohidjonzaylobiddinov/avtotest.uz/secondary_resources/express-medias"

def upload_file(file_path):
    filename = os.path.basename(file_path)
    url = f"{SUPABASE_URL}/storage/v1/object/{BUCKET}/{filename}"
    
    with open(file_path, "rb") as f:
        file_bytes = f.read()

    req = urllib.request.Request(
        url,
        data=file_bytes,
        headers={
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "apikey": SUPABASE_KEY,
            "Content-Type": "image/jpeg",
            "x-upsert": "true",
        },
        method="POST"
    )

    max_retries = 3
    for attempt in range(max_retries):
        try:
            with urllib.request.urlopen(req, timeout=30) as response:
                if response.status in (200, 201):
                    return (True, filename, None)
                else:
                    return (False, filename, f"Status {response.status}")
        except urllib.error.HTTPError as e:
            err_msg = e.read().decode("utf-8", errors="ignore")
            if attempt == max_retries - 1:
                return (False, filename, f"HTTP {e.code}: {err_msg}")
        except Exception as e:
            if attempt == max_retries - 1:
                return (False, filename, str(e))
    return (False, filename, "Exceeded retries")

def main():
    image_files = sorted(glob.glob(os.path.join(MEDIA_DIR, "question-*.jpg")), key=lambda p: int(re.search(r'question-(\d+)', p).group(1)))
    total = len(image_files)
    print(f"Found {total} images to upload to bucket '{BUCKET}'...")

    success_count = 0
    fail_count = 0
    failed_files = []

    # Upload using ThreadPoolExecutor with 12 workers for fast parallel transfer
    with ThreadPoolExecutor(max_workers=12) as executor:
        futures = {executor.submit(upload_file, f): f for f in image_files}
        
        for i, future in enumerate(as_completed(futures), 1):
            success, filename, error = future.result()
            if success:
                success_count += 1
            else:
                fail_count += 1
                failed_files.append((filename, error))
            
            if i % 50 == 0 or i == total:
                print(f"Progress: [{i}/{total}] uploaded. (Success: {success_count}, Failed: {fail_count})")

    print("\n--- Summary ---")
    print(f"Total: {total}")
    print(f"Successfully uploaded: {success_count}")
    print(f"Failed: {fail_count}")

    if failed_files:
        print("Failed files sample:")
        for fn, err in failed_files[:10]:
            print(f"  {fn}: {err}")
        sys.exit(1)
    else:
        print("All images uploaded successfully!")

if __name__ == "__main__":
    main()
