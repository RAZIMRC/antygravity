import os
import argparse
import fitz  # PyMuPDF
import cv2
import numpy as np
from playwright.sync_api import sync_playwright
from pyzbar.pyzbar import decode

def extract_qr_code_from_pdf(pdf_path):
    print(f"Loading PDF: {pdf_path}")
    doc = fitz.open(pdf_path)
    
    for page_num in range(len(doc)):
        print(f"Scanning page {page_num + 1}...")
        page = doc.load_page(page_num)
        
        # Try to render at high enough DPI to make QR code scannable
        pix = page.get_pixmap(dpi=300)
        
        # Convert pixmap to numpy array for OpenCV
        # Handling the shape based on whether it's RGB or RGBA
        width, height = pix.w, pix.h
        
        # Sometimes pix.samples is bytes
        img_data = np.frombuffer(pix.samples, dtype=np.uint8)
        
        if pix.n == 4:
            img_data = img_data.reshape(height, width, 4)
            img_cv = cv2.cvtColor(img_data, cv2.COLOR_RGBA2BGR)
        elif pix.n == 3:
            img_data = img_data.reshape(height, width, 3)
            img_cv = cv2.cvtColor(img_data, cv2.COLOR_RGB2BGR)
        else:
            # Grayscale
            img_data = img_data.reshape(height, width, 1)
            img_cv = cv2.cvtColor(img_data, cv2.COLOR_GRAY2BGR)
            
        # Detect and decode the QR code with pyzbar
        decoded_objects = decode(img_cv)
        if decoded_objects:
            data = decoded_objects[0].data.decode('utf-8')
            print(f"-> SUCCESS: Found QR Code on page {page_num + 1}: {data}")
            return data
            
    return None

def save_webpage_to_pdf(url, output_path):
    print(f"Opening browser to visit {url}...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={'width': 1280, 'height': 800},
            device_scale_factor=2,
            accept_downloads=True
        )
        page = context.new_page()
        
        download_event = []
        page.on("download", lambda d: download_event.append(d))
        
        try:
            page.goto(url, wait_until='networkidle', timeout=30000)
        except Exception as e:
            if "Download is starting" in str(e):
                pass
            else:
                print(f"Failed to load page: {e}")
                
        if download_event:
            print("Direct file download detected! Saving natively...")
            download = download_event[0]
            download.save_as(output_path)
            print(f"-> SUCCESS: Saved downloaded file to {output_path}")
        else:
            try:
                print("Page loaded, generating beautiful PDF...")
                page.pdf(
                    path=output_path, 
                    format='A4',
                    print_background=True,
                    margin={'top': '1cm', 'bottom': '1cm', 'left': '1cm', 'right': '1cm'}
                )
                print(f"-> SUCCESS: Saved webpage to {output_path}")
            except Exception as e:
                print(f"Failed to capture webpage: {e}")
        
        browser.close()


def main(pdf_file_path):
    print("=" * 60)
    print("PDF QR Code & Web Archiver Tool")
    print("=" * 60)

    if not os.path.exists(pdf_file_path):
        print(f"Error: Could not find PDF file at '{pdf_file_path}'")
        return

    # Step 1: Read PDF and extract QR Code
    url = extract_qr_code_from_pdf(pdf_file_path)
    
    if url:
        if not url.startswith('http'):
            print(f"Error: Decoded text from QR code is not a valid URL: '{url}'")
            return
            
        output_pdf = "Rendered_Webpage.pdf"
        
        # Step 2: Render webpage to PDF
        save_webpage_to_pdf(url, output_pdf)
        
        if os.path.exists(output_pdf):
            print(f"Workflow completed successfully! Saved webpage to {output_pdf}")
        else:
            print("Error: The webpage PDF was not generated.")
    else:
        print("No QR code found in the PDF. Workflow stopped.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Scan PDF for QR code, render target webpage, and upload to Google Drive.")
    parser.add_argument("pdf_file", help="Path to your input PDF file containing a QR code")
    args = parser.parse_args()
    
    main(args.pdf_file)
