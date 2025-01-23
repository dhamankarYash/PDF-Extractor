import json
import pdfplumber
import re
import sys
import os

def extract_data_from_pdf(pdf_path):
    # Ensure the file exists and is a PDF
    if not os.path.exists(pdf_path):
        return json.dumps({"error": "File not found."}, indent=4)

    if not pdf_path.lower().endswith('.pdf'):
        return json.dumps({"error": "Invalid file type. Only PDF files are supported."}, indent=4)

    try:
        # Read the PDF and extract text
        with pdfplumber.open(pdf_path) as pdf:
            raw_text = "\n".join(page.extract_text() or "" for page in pdf.pages)

        # Initialize a dictionary to store extracted data
        extracted_data = {
            "name": "",
            "phone": "",
            "address": "",
            "role": ""
        }

        # Define regex patterns for each field
        name_pattern = re.compile(r"Name\s*:\s*(.+)")
        phone_pattern = re.compile(r"Phone\s*:\s*([\+0-9().\-\s]+)")
        address_pattern = re.compile(r"Address\s*:\s*(.+)")
        role_pattern = re.compile(r"Role\s*:\s*(.+)")

        # Extract fields using regex
        name_match = name_pattern.search(raw_text)
        phone_match = phone_pattern.search(raw_text)
        address_match = address_pattern.search(raw_text)
        role_match = role_pattern.search(raw_text)

        if name_match:
            extracted_data["name"] = name_match.group(1).strip()
        if phone_match:
            extracted_data["phone"] = phone_match.group(1).strip()
        if address_match:
            extracted_data["address"] = address_match.group(1).strip()
        if role_match:
            extracted_data["role"] = role_match.group(1).strip()

        # Return extracted data as JSON
        return json.dumps(extracted_data, indent=4)

    except Exception as e:
        return json.dumps({"error": f"An error occurred while processing the PDF: {str(e)}"}, indent=4)


if __name__ == "__main__":
    # Check if a file path argument is provided
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No PDF file path provided."}, indent=4))
        sys.exit(1)

    # Get the file path from the command-line arguments
    pdf_path = sys.argv[1]

    # Call the extraction function and print the result
    print(extract_data_from_pdf(pdf_path))

