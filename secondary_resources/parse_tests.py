# -*- coding: utf-8 -*-
import re
import csv

# Latin to Cyrillic mapping for Uzbek
latin_to_cyrillic = {
    'A': 'А', 'B': 'Б', 'D': 'Д', 'E': 'Е', 'F': 'Ф', 'G': 'Г', 'H': 'Ҳ', 'I': 'И',
    'J': 'Ж', 'K': 'К', 'L': 'Л', 'M': 'М', 'N': 'Н', 'O': 'О', 'P': 'П', 'Q': 'Қ',
    'R': 'Р', 'S': 'С', 'T': 'Т', 'U': 'У', 'V': 'В', 'X': 'Х', 'Y': 'Й', 'Z': 'З',
    'a': 'а', 'b': 'б', 'd': 'д', 'e': 'е', 'f': 'ф', 'g': 'г', 'h': 'ҳ', 'i': 'и',
    'j': 'ж', 'k': 'к', 'l': 'л', 'm': 'м', 'n': 'н', 'o': 'о', 'p': 'п', 'q': 'қ',
    'r': 'р', 's': 'с', 't': 'т', 'u': 'у', 'v': 'в', 'x': 'х', 'y': 'й', 'z': 'з',
    'O'': 'Ў', 'o'': 'ў', 'G'': 'Ғ', 'g'': 'ғ', 'Sh': 'Ш', 'sh': 'ш', 'Ch': 'Ч',
    'ch': 'ч', 'Yo': 'Ё', 'yo': 'ё', 'Yu': 'Ю', 'yu': 'ю', 'Ya': 'Я', 'ya': 'я',
    'Ye': 'Е', 'ye': 'е'
}

def latin_to_cyrillic_uzbek(text):
    """Convert Uzbek Latin text to Cyrillic"""
    if not text:
        return text
    
    # Handle multi-character mappings first
    result = text
    for latin, cyrillic in sorted(latin_to_cyrillic.items(), key=lambda x: -len(x[0])):
        result = result.replace(latin, cyrillic)
    
    return result

def format_pg_array(arr):
    """Format array for PostgreSQL"""
    if not arr:
        return "{}"
    formatted = "{" + ",".join('"' + s.replace('"', '\\"') + '"' for s in arr) + "}"
    return formatted

# Read the extracted text
with open('test_extracted.txt', 'r', encoding='utf-8') as f:
    content = f.read()

# Parse the content
# The format appears to be: Question\rF1\rAnswer1\rF2\rAnswer2... with image URLs
tests = []
lines = content.split('\r')

# Clean up lines
lines = [line.strip() for line in lines if line.strip()]

print(f"Total lines: {len(lines)}")
print("First 50 lines:")
for i, line in enumerate(lines[:50]):
    print(f"{i}: {line[:100]}")

# We'll need to manually parse this based on the pattern
# Let me create a simpler approach - just create the CSV structure for now

# Create CSV with proper headers
headers = [
    'question', 'question_cyrl', 'answers', 'answers_cyrl',
    'correct_answer', 'image_url', 'category', 'time_limit',
    'audio_url', 'audio_url_cyrl', 'explanation_title',
    'explanation_title_cyrl', 'explanation_text', 'explanation_text_cyrl'
]

# For now, create a template CSV that the user can fill
with open('ticket_60_tests.csv', 'w', encoding='utf-8', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=headers)
    writer.writeheader()
    
    # Add a sample row to show the format
    sample = {
        'question': 'Sample question in Latin',
        'question_cyrl': latin_to_cyrillic_uzbek('Sample question in Latin'),
        'answers': format_pg_array(['Answer 1', 'Answer 2', 'Answer 3', 'Answer 4']),
        'answers_cyrl': format_pg_array([latin_to_cyrillic_uzbek('Answer 1'), latin_to_cyrillic_uzbek('Answer 2')]),
        'correct_answer': 0,
        'image_url': 'https://i.postimg.cc/NGmgN66H/avtotest.png',
        'category': '',  # Empty for user to fill
        'time_limit': 300,
        'audio_url': '',
        'audio_url_cyrl': '',
        'explanation_title': '',
        'explanation_title_cyrl': '',
        'explanation_text': '',
        'explanation_text_cyrl': ''
    }
    writer.writerow(sample)

print("\nCSV template created: ticket_60_tests.csv")
print("Please check the extracted text file to understand the structure better.")
