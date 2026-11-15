import glob
import os

html_files = glob.glob(r"c:\Users\Administrator\Downloads\pfa (2)\pfa (1)\pfa (1)\pfa\PFA html - Copie - Copie\*.html")
for f in html_files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    if 'user_actions.js' not in content:
        content = content.replace('<script src="script.js"></script>', '<script src="user_actions.js"></script>\n    <script src="script.js"></script>')
        with open(f, 'w', encoding='utf-8') as file:
            file.write(content)
        print(f"Updated {f}")
    else:
        print(f"Skipped {f}")
