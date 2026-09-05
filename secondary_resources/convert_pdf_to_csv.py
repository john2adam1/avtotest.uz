#!/usr/bin/env python3
"""
Converts YHQ PDF tests to CSV files matching 1226.csv format (without Cyrillic, with numeration).
"""
import os
import re
import csv
import json
import fitz

MEDIA_DIR = "/Users/zohidjonzaylobiddinov/avtotest.uz/secondary_resources/express-medias"
SUPABASE_URL = "https://lgacbbewpuzeyxijzfii.supabase.co/storage/v1/object/public/test-images"
FALLBACK_IMAGE = "https://postimg.cc/Dmfk0bYv"

PDF_FILES = [
    ("/Users/zohidjonzaylobiddinov/avtotest.uz/secondary_resources/YHQ-350 fixed.pdf", 1, 350, "yhq_350.csv"),
    ("/Users/zohidjonzaylobiddinov/avtotest.uz/secondary_resources/YHQ-351-1000.pdf", 351, 1000, "yhq_351_1000.csv"),
    ("/Users/zohidjonzaylobiddinov/avtotest.uz/secondary_resources/YHQ-1100.pdf", 1001, 1110, "yhq_1100.csv"),
]

# Known missing texts or edge cases verified directly against YHQ source
MANUAL_OVERRIDES = {
    399: {"correct_answer": 1},
    484: {"correct_answer": 2},
    503: {
        "question": "Bu belgi o'rnatilgan yo'lda avtobuslarga harakatlanish ruxsat etiladimi?",
        "correct_answer": 2
    },
    516: {"correct_answer": 1},
    593: {"correct_answer": 1},
    649: {
        "question": "«Reaksiya vaqti» tushunchasi nimani bildiradi?",
        "correct_answer": 0
    },
    664: {"correct_answer": 0},
    719: {"correct_answer": 1},
    748: {"correct_answer": 0},
    862: {"correct_answer": 1},
    890: {"correct_answer": 1},
    943: {"correct_answer": 1},
    978: {"correct_answer": 2}
}

def format_pg_array(arr):
    escaped = [item.replace('"', '\\"') for item in arr]
    return '{"' + '","'.join(escaped) + '"}'

def get_clean_pdf_text(pdf_path):
    doc = fitz.open(pdf_path)
    full_text = []
    for page in doc:
        blocks = page.get_text("blocks")
        blocks_sorted = sorted(blocks, key=lambda b: (round(b[1], 0), round(b[0], 0)))
        for b in blocks_sorted:
            txt = b[4].strip()
            if txt:
                full_text.append(txt)
    doc.close()
    return "\n\n".join(full_text)

def parse_pdf(pdf_path, start_num, end_num):
    text = get_clean_pdf_text(pdf_path)

    # Regex for question headers: number followed by Savol/Savo/Sa«/Yolovchilarni
    pattern = re.compile(r'(?:^|\n)\s*(\d{1,4})\s*[-–—]\s*(?:S[a-z]*vol\b|Savo\b|Sa«|Yolovchilarni)', re.IGNORECASE)
    
    matches = {}
    for m in pattern.finditer(text):
        num = int(m.group(1))
        if start_num <= num <= end_num and num not in matches:
            matches[num] = m.start()

    nums = sorted(matches.keys())
    results = []

    for i, num in enumerate(nums):
        # 930 is an empty duplicate line in YHQ-351-1000.pdf, skip it
        if num == 930:
            continue

        start_pos = matches[num]
        end_pos = matches[nums[i+1]] if i+1 < len(nums) else len(text)
        block = text[start_pos:end_pos].strip()

        # Find option markers F1..F5
        f_matches = list(re.finditer(r'(?:^|\n)\s*(F[1-5])\s*[:.-]?\s*', block, re.IGNORECASE))
        # Find Izoh:
        izoh_match = re.search(r'(?:^|\n)\s*Izoh\s*:\s*', block, re.IGNORECASE)

        # 1. Question text
        if f_matches:
            raw_q = block[:f_matches[0].start()]
        elif izoh_match:
            raw_q = block[:izoh_match.start()]
        else:
            raw_q = block

        # Clean question text
        raw_q = re.sub(r'^\s*\d{1,4}\s*[-–—]\s*(?:Savol|Sa[^\n]*vol|Savo\b)?\s*[:.-]?\s*', '', raw_q, flags=re.IGNORECASE).strip()
        q_text = " ".join(raw_q.split())

        # 2. Options
        options = []
        correct_idx = None

        if f_matches:
            for idx, fm in enumerate(f_matches):
                opt_start = fm.end()
                if idx + 1 < len(f_matches):
                    opt_end = f_matches[idx+1].start()
                elif izoh_match and izoh_match.start() > opt_start:
                    opt_end = izoh_match.start()
                else:
                    opt_end = len(block)

                opt_text = block[opt_start:opt_end].strip()

                # Detect '#' (or ' 3' at the end of option indicating checkmark)
                if '#' in opt_text:
                    correct_idx = idx
                    opt_text = opt_text.replace('#', '').strip()
                elif re.search(r'\s+3$', opt_text):
                    # Checkmark OCR'd as 3
                    correct_idx = idx
                    opt_text = re.sub(r'\s+3$', '', opt_text).strip()

                clean_opt = " ".join(opt_text.split())
                options.append(clean_opt)

        # 3. Izoh
        izoh_text = ""
        if izoh_match:
            raw_izoh = block[izoh_match.end():].strip()
            izoh_text = " ".join(raw_izoh.split())

        # Apply overrides if needed
        if num in MANUAL_OVERRIDES:
            ov = MANUAL_OVERRIDES[num]
            if "question" in ov:
                q_text = ov["question"]
            if "correct_answer" in ov:
                correct_idx = ov["correct_answer"]
            if "answers" in ov:
                options = ov["answers"]

        # 4. Image URL
        image_file = f"question-{num}.jpg"
        if os.path.exists(os.path.join(MEDIA_DIR, image_file)):
            image_url = f"{SUPABASE_URL}/{image_file}"
        else:
            image_url = FALLBACK_IMAGE

        results.append({
            "numeration": f"question_{num}",
            "question": q_text,
            "answers": format_pg_array(options),
            "correct_answer": correct_idx,
            "image_url": image_url,
            "time_limit": 300,
            "audio_url": "",
            "explanation_text": izoh_text,
            "_raw_answers": options,
            "_num": num
        })

    return results

def write_csv(filepath, rows):
    fieldnames = [
        "numeration",
        "question",
        "answers",
        "correct_answer",
        "image_url",
        "time_limit",
        "audio_url",
        "explanation_text"
    ]
    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames, quoting=csv.QUOTE_MINIMAL)
        writer.writeheader()
        for r in rows:
            clean_row = {k: r[k] for k in fieldnames}
            writer.writerow(clean_row)
    print(f"Wrote {len(rows)} rows to {filepath}")

def main():
    output_dir = "/Users/zohidjonzaylobiddinov/avtotest.uz/secondary_resources"
    all_rows = []

    for pdf_path, start_num, end_num, csv_name in PDF_FILES:
        print(f"\nProcessing {os.path.basename(pdf_path)}...")
        rows = parse_pdf(pdf_path, start_num, end_num)
        print(f"Extracted {len(rows)} questions.")

        csv_path = os.path.join(output_dir, csv_name)
        write_csv(csv_path, rows)
        all_rows.extend(rows)

    # Write merged all questions CSV
    all_csv_path = os.path.join(output_dir, "yhq_tests_all.csv")
    write_csv(all_csv_path, all_rows)

    print("\n================ FINAL REPORT ================")
    print(f"Total questions processed: {len(all_rows)}")
    supabase_images = sum(1 for r in all_rows if SUPABASE_URL in r["image_url"])
    fallback_images = sum(1 for r in all_rows if FALLBACK_IMAGE in r["image_url"])
    print(f"Supabase images mapped: {supabase_images}")
    print(f"Fallback images mapped: {fallback_images}")

    # Check for any missing fields
    missing_correct = [r["numeration"] for r in all_rows if r["correct_answer"] is None]
    missing_question = [r["numeration"] for r in all_rows if not r["question"]]
    invalid_options = [r["numeration"] for r in all_rows if len(r["_raw_answers"]) < 2]

    print(f"Missing correct_answer: {len(missing_correct)} ({missing_correct})")
    print(f"Missing question text: {len(missing_question)} ({missing_question})")
    print(f"Invalid options (< 2): {len(invalid_options)} ({invalid_options})")

if __name__ == "__main__":
    main()
