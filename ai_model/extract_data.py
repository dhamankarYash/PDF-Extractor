import json
import pdfplumber
import re
import sys
import os

def extract_data_from_pdf(pdf_path):
    print(f"Processing PDF file: {pdf_path}", file=sys.stderr)
    
    if not os.path.exists(pdf_path):
        return json.dumps({"error": f"File not found: {pdf_path}"})

    if not pdf_path.lower().endswith('.pdf'):
        return json.dumps({"error": "Invalid file type. Only PDF files are supported."})

    try:
        with pdfplumber.open(pdf_path) as pdf:
            print(f"Successfully opened PDF file", file=sys.stderr)
            raw_text = "\n".join(page.extract_text() or "" for page in pdf.pages)
            print(f"Extracted text length: {len(raw_text)}", file=sys.stderr)

        # Initialize extracted data
        extracted_data = {
            "name": "",
            "phone": "",
            "address": "",
            "role": ""
        }

        # Define regex patterns
        patterns = {
            "name": [
                r"Name\s*:\s*([^\n]+)",
                r"Full Name\s*:\s*([^\n]+)",
                r"Name\s*([^\n]+)"
            ],
            "phone": [
                r"Phone\s*:\s*([\+0-9().\-\s]+)",
                r"Tel\s*:\s*([\+0-9().\-\s]+)",
                r"Mobile\s*:\s*([\+0-9().\-\s]+)",
                r"Contact\s*:\s*([\+0-9().\-\s]+)"
            ],
            "address": [
                r"Address\s*:\s*([^\n]+)",
                r"Location\s*:\s*([^\n]+)",
                r"Residence\s*:\s*([^\n]+)"
            ],
            "role": [
                r"Role\s*:\s*([^\n]+)",
                r"Position\s*:\s*([^\n]+)",
                r"Title\s*:\s*([^\n]+)",
                r"Designation\s*:\s*([^\n]+)"
            ]
        }

        # Extract data using multiple patterns
        for field, pattern_list in patterns.items():
            for pattern in pattern_list:
                match = re.search(pattern, raw_text, re.IGNORECASE)
                if match:
                    extracted_data[field] = match.group(1).strip()
                    break

        print(f"Extracted data: {extracted_data}", file=sys.stderr)
        return json.dumps(extracted_data, indent=2)

    except Exception as e:
        error_msg = f"An error occurred while processing the PDF: {str(e)}"
        print(error_msg, file=sys.stderr)
        return json.dumps({"error": error_msg})

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No PDF file path provided."}))
        sys.exit(1)

    pdf_path = sys.argv[1]
    result = extract_data_from_pdf(pdf_path)
    print(result)  # This will be captured by Node.js

