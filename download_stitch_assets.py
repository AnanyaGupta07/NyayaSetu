import json
import os
import subprocess

# Load the screens metadata
with open(r'C:\Users\10pri\Downloads\genz bakwaas project 3\nyayasetu_screens.json', 'r') as f:
    data = json.load(f)

screens = data['screens']
output_dir = r'c:\Users\10pri\Downloads\genz bakwaas project 3\nyayasetu\assets\stitch'

if not os.path.exists(output_dir):
    os.makedirs(output_dir)

user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"

for screen in screens:
    title = screen['title'].replace('/', '-').replace(':', '-')
    screenshot_url = screen['screenshot']['downloadUrl']
    html_url = screen['htmlCode']['downloadUrl']
    
    # Download screenshot
    screenshot_file = os.path.join(output_dir, f"{title}.png")
    print(f"Downloading screenshot for {title}...")
    subprocess.run(['curl.exe', '-L', '-A', user_agent, screenshot_url, '-o', screenshot_file], check=True)
    
    # Download HTML code
    html_file = os.path.join(output_dir, f"{title}.html")
    print(f"Downloading HTML for {title}...")
    subprocess.run(['curl.exe', '-L', '-A', user_agent, '-H', 'Accept: text/html', html_url, '-o', html_file], check=True)

print("Done.")
