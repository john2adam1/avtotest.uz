# -*- coding: utf-8 -*-
"""
DOCX to CSV Converter for Uzbek Tests
Converts tests from DOCX to CSV with Latin and Cyrillic versions
"""

import re
import csv
import sys

# Latin to Cyrillic mapping for Uzbek
def latin_to_cyrillic_uzbek(text):
    """Convert Uzbek Latin text to Cyrillic"""
    if not text:
        return text
    
    # Multi-character replacements first (order matters!)
    replacements = [
        ("O'", "Ў"), ("o'", "ў"),
        ("G'", "Ғ"), ("g'", "ғ"),
        ("Sh", "Ш"), ("sh", "ш"),
        ("Ch", "Ч"), ("ch", "ч"),
        ("Yo", "Ё"), ("yo", "ё"),
        ("Yu", "Ю"), ("yu", "ю"),
        ("Ya", "Я"), ("ya", "я"),
        # Single characters
        ("A", "А"), ("a", "а"),
        ("B", "Б"), ("b", "б"),
        ("D", "Д"), ("d", "д"),
        ("E", "Е"), ("e", "е"),
        ("F", "Ф"), ("f", "ф"),
        ("G", "Г"), ("g", "г"),
        ("H", "Ҳ"), ("h", "ҳ"),
        ("I", "И"), ("i", "и"),
        ("J", "Ж"), ("j", "ж"),
        ("K", "К"), ("k", "к"),
        ("L", "Л"), ("l", "л"),
        ("M", "М"), ("m", "м"),
        ("N", "Н"), ("n", "н"),
        ("O", "О"), ("o", "о"),
        ("P", "П"), ("p", "п"),
        ("Q", "Қ"), ("q", "қ"),
        ("R", "Р"), ("r", "р"),
        ("S", "С"), ("s", "с"),
        ("T", "Т"), ("t", "т"),
        ("U", "У"), ("u", "у"),
        ("V", "В"), ("v", "в"),
        ("X", "Х"), ("x", "х"),
        ("Y", "Й"), ("y", "й"),
        ("Z", "З"), ("z", "з"),
    ]
    
    result = text
    for latin, cyrillic in replacements:
        result = result.replace(latin, cyrillic)
    
    return result

def format_pg_array(arr):
    """Format array for PostgreSQL"""
    if not arr:
        return "{}"
    # Escape quotes and format
    formatted = "{" + ",".join('"' + str(s).replace('"', '\\"').replace('\\', '\\\\') + '"' for s in arr) + "}"
    return formatted

def extract_docx_text(filename):
    """Extract text from DOCX using PowerShell"""
    import subprocess
    
    ps_script = f'''
$word = New-Object -ComObject Word.Application
$word.Visible = $false
$doc = $word.Documents.Open((Resolve-Path '{filename}').Path)
$doc.Content.Text
$doc.Close()
$word.Quit()
[System.Runtime.Interopservices.Marshal]::ReleaseComObject($word) | Out-Null
'''
    
    result = subprocess.run(
        ['powershell', '-Command', ps_script],
        capture_output=True,
        text=True,
        encoding='utf-8'
    )
    
    return result.stdout

def parse_tests_from_text(text):
    """Parse tests from extracted text"""
    tests = []
    
    # Split by bilet markers
    bilet_pattern = r'(\d+-BILET)'
    parts = re.split(bilet_pattern, text)
    
    current_bilet = None
    for i, part in enumerate(parts):
        if re.match(r'\d+-BILET', part):
            current_bilet = part
        elif current_bilet and part.strip():
            # Parse questions in this bilet
            questions = part.split('\r\r')
            
            for q_text in questions:
                if not q_text.strip():
                    continue
                
                lines = [l.strip() for l in q_text.split('\r') if l.strip()]
                
                if len(lines) < 3:  # Need at least question + 2 answers
                    continue
                
                question = lines[0]
                answers = []
                correct_idx = 0
                image_url = 'https://i.postimg.cc/NGmgN66H/avtotest.png'
                
                # Parse answers and find correct one
                i = 1
                while i < len(lines):
                    line = lines[i]
                    
                    # Check for image URL
                    if line.startswith('http'):
                        image_url = line
                        i += 1
                        continue
                    
                    # Check for answer marker (F1, F2, etc)
                    if re.match(r'F\d+', line):
                        i += 1
                        if i < len(lines):
                            answer_text = lines[i]
                            # Check if this is the correct answer (has + marker)
                            if '+' in line or answer_text.endswith('+'):
                                correct_idx = len(answers)
                                answer_text = answer_text.replace('+', '').strip()
                            answers.append(answer_text)
                        i += 1
                    else:
                        i += 1
                
                if len(answers) >= 2:  # Valid test
                    tests.append({
                        'question': question,
                        'answers': answers,
                        'correct_answer': correct_idx,
                        'image_url': image_url
                    })
    
    return tests

# Main processing
print("Starting DOCX to CSV conversion...")
print("=" * 60)

files = [
    'test1-10.docx',
    'test11-20.docx', 
    'test21-30.docx',
    'test31-40.docx',
    'test41-50.docx',
    'test51-60.docx'
]

all_tests = []

for filename in files:
    print(f"\nProcessing {filename}...")
    try:
        text = extract_docx_text(filename)
        tests = parse_tests_from_text(text)
        all_tests.extend(tests)
        print(f"  ✓ Extracted {len(tests)} tests")
    except Exception as e:
        print(f"  ✗ Error: {e}")

print(f"\n{'=' * 60}")
print(f"Total tests extracted: {len(all_tests)}")
print(f"{'=' * 60}\n")

# Create CSV
headers = [
    'question', 'question_cyrl', 'answers', 'answers_cyrl',
    'correct_answer', 'image_url', 'category', 'time_limit',
    'audio_url', 'audio_url_cyrl', 'explanation_title',
    'explanation_title_cyrl', 'explanation_text', 'explanation_text_cyrl'
]

output_file = 'ticket_60_tests.csv'
with open(output_file, 'w', encoding='utf-8', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=headers)
    writer.writeheader()
    
    for test in all_tests:
        row = {
            'question': test['question'],
            'question_cyrl': latin_to_cyrillic_uzbek(test['question']),
            'answers': format_pg_array(test['answers']),
            'answers_cyrl': format_pg_array([latin_to_cyrillic_uzbek(a) for a in test['answers']]),
            'correct_answer': test['correct_answer'],
            'image_url': test['image_url'],
            'category': '',  # Empty for user to fill
            'time_limit': 300,
            'audio_url': '',
            'audio_url_cyrl': '',
            'explanation_title': '',
            'explanation_title_cyrl': '',
            'explanation_text': '',
            'explanation_text_cyrl': ''
        }
        writer.writerow(row)

print(f"✓ CSV file created: {output_file}")
print(f"✓ Total rows: {len(all_tests)}")
print("\nNext steps:")
print("1. Open the CSV in Excel")
print("2. Fill in the 'category' column")
print("3. Import to Supabase")
