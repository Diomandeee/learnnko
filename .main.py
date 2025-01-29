# import os
# import re
# from typing import List, Optional, TextIO
# from pathlib import Path

# class DirectoryTraversal:
#     def __init__(
#         self,
#         root_dir: str,
#         exclude_dirs: Optional[List[str]] = None,
#         exclude_ext: Optional[List[str]] = None,
#         exclude_markdown: Optional[List[str]] = None
#     ):
#         self.root_dir = Path(root_dir)
#         self.exclude_dirs = set(exclude_dirs or [])
#         self.exclude_ext = set(exclude_ext or [])
#         self.exclude_markdown = set(exclude_markdown or [])
#         self.pyc_pattern = re.compile(r".*\.cpython-\d+\.pyc$")

#     def _should_exclude(self, path: Path) -> bool:
#         """Check if a path should be excluded based on exclusion rules."""
#         normalized_path = str(path.relative_to(self.root_dir)).replace(os.sep, '/')
#         return (normalized_path in self.exclude_dirs or 
#                 path.name in self.exclude_dirs or 
#                 self.pyc_pattern.match(path.name) is not None)

#     def _should_exclude_from_markdown(self, path: Path) -> bool:
#         """Check if a path should be excluded from markdown documentation."""
#         normalized_path = str(path.relative_to(self.root_dir)).replace(os.sep, '/')
#         return normalized_path in self.exclude_markdown

#     def _write_to_markdown(self, file_path: Path, markdown_file: TextIO) -> None:
#         """Write file contents to markdown with proper error handling."""
#         try:
#             content = file_path.read_text(encoding='utf-8')
#             markdown_file.write(f"### {file_path.absolute()}\n")
#             markdown_file.write(f"{content}\n")
#             markdown_file.write("_" * 80 + "\n")
#         except (UnicodeDecodeError, FileNotFoundError) as e:
#             print(f"Skipped file {file_path}: {e}")

#     def print_structure(
#         self,
#         current_dir: Optional[Path] = None,
#         prefix: str = "",
#         markdown_file: Optional[TextIO] = None
#     ) -> None:
#         """Print directory structure and optionally write to markdown file."""
#         current_dir = current_dir or self.root_dir

#         try:
#             # Get and sort items
#             items = sorted(current_dir.iterdir(), key=lambda p: p.name.lower())
            
#             for index, item in enumerate(items):
#                 if self._should_exclude(item):
#                     continue

#                 is_last_item = index == len(items) - 1
#                 connector = "└──" if is_last_item else "├──"
                
#                 print(f"{prefix}{connector} {item.name}{'/' if item.is_dir() else ''}")

#                 if item.is_dir():
#                     new_prefix = prefix + ("    " if is_last_item else "│   ")
#                     self.print_structure(item, new_prefix, markdown_file)
#                 elif (markdown_file and 
#                       not self._should_exclude_from_markdown(item) and 
#                       not any(item.name.endswith(ext) for ext in self.exclude_ext)):
#                     self._write_to_markdown(item, markdown_file)

#         except PermissionError:
#             print(f"Permission denied: {current_dir}")

# def main():
#     # Configuration
#     root_directory = "src"
#     excluded_directories = [
#         "node_modules", ".next", ".git", "package-lock.json", ".env",
#         "fonts", "public", "favicon.ico", ".DS_Store", "package.json",
#         "README.md", ".gitignore", "tailwind.config.ts", "tsconfig.json",
#         "next.config.mjs", "postcss.config.mjs", "next-env.d.ts",
#         ".eslintrc.json", "setup_auth.sh", "src/components/ui",
#         "src/components/landing", ".dir_struc.py", "crontab.txt",
#         "directory_contents.md", "setup-registration.sh",
#         "setup-qr-landing.sh", "data", "__pycache__"
#     ]
#     excluded_from_markdown = ["src/components/ui"]
#     excluded_extensions = [".ext"]

#     traversal = DirectoryTraversal(
#         root_directory,
#         excluded_directories,
#         excluded_extensions,
#         excluded_from_markdown
#     )

#     with open('directory_contents.md', 'w', encoding='utf-8') as markdown_file:
#         traversal.print_structure(markdown_file=markdown_file)

# if __name__ == "__main__":
#     main()



# # 
import os
import re
from typing import List, Optional, TextIO
from pathlib import Path

class DirectoryTraversal:
    def __init__(
        self,
        target_dirs: List[str],
        exclude_dirs: Optional[List[str]] = None,
        exclude_ext: Optional[List[str]] = None
    ):
        self.target_dirs = [Path(d) for d in target_dirs]
        self.exclude_dirs = set(exclude_dirs or [])
        self.exclude_ext = set(exclude_ext or [])
        self.pyc_pattern = re.compile(r".*\.cpython-\d+\.pyc$")

    def _should_exclude(self, path: Path) -> bool:
        """Check if a path should be excluded based on exclusion rules."""
        return (path.name in self.exclude_dirs or 
                self.pyc_pattern.match(path.name) is not None)

    def _write_to_markdown(self, file_path: Path, markdown_file: TextIO) -> None:
        """Write file contents to markdown with proper error handling."""
        try:
            content = file_path.read_text(encoding='utf-8')
            markdown_file.write(f"### {file_path.absolute()}\n")
            # markdown_file.write("```typescript\n")
            markdown_file.write(content)
            # markdown_file.write("\n```\n")
            markdown_file.write("_" * 80 + "\n")
        except (UnicodeDecodeError, FileNotFoundError) as e:
            print(f"Skipped file {file_path}: {e}")

    def print_structure(
        self,
        markdown_file: Optional[TextIO] = None
    ) -> None:
        """Print directory structure and write contents to markdown file."""
        for target_dir in self.target_dirs:
            print(f"\nDirectory: {target_dir}")
            
            try:
                if not target_dir.exists():
                    print(f"Directory not found: {target_dir}")
                    continue

                # Recursively traverse directory
                for root, dirs, files in os.walk(target_dir):
                    root_path = Path(root)
                    relative_path = root_path.relative_to(target_dir)
                    
                    # Print directory structure
                    print(f"{relative_path}/")
                    
                    # Sort and process files
                    for file in sorted(files):
                        file_path = root_path / file
                        if not self._should_exclude(file_path):
                            print(f"  - {file}")
                            
                            # Write file contents to markdown
                            if markdown_file and not any(file.endswith(ext) for ext in self.exclude_ext):
                                self._write_to_markdown(file_path, markdown_file)

            except PermissionError:
                print(f"Permission denied: {target_dir}")

def main():
    # Configuration
    target_directories = [
        "src/app/dashboard/coffee-shops/",
        "src/components/coffee-shops/",
        # "src/app/api/coffee-shops/",
        # "src/app/api/routes/",
        # "src/hooks/",
        # "prisma/",
        # "src/app/dashboard/routes/",
        # "src/components/routes/",
        # "src/store/"
    ]
    
    excluded_directories = [
        "node_modules", ".next", ".git", "__pycache__"
    ]
    
    excluded_extensions = [
        ".js.map", ".d.ts", ".log"
    ]

    traversal = DirectoryTraversal(
        target_directories,
        excluded_directories,
        excluded_extensions
    )

    with open('scheduling_contents.md', 'w', encoding='utf-8') as markdown_file:
        traversal.print_structure(markdown_file=markdown_file)

    print("\nContents have been written to scheduling_contents.md")

if __name__ == "__main__":
    main()

    target_directories = [
        "src/components/scheduling", 
        "src/app/api/scheduling",
        "src/components/directory",
        "src/app/api/directory",
        "src/types/scheduling",
        "prisma/",

    ]
# from selenium import webdriver
# from selenium.webdriver.common.by import By
# from selenium.webdriver.support.ui import WebDriverWait
# from selenium.webdriver.support import expected_conditions as EC
# from selenium.webdriver.chrome.options import Options
# from selenium.common.exceptions import TimeoutException, NoSuchElementException, ElementClickInterceptedException
# import csv
# import time

# def clean_text(text):
#     """Clean text by removing extra whitespace and newlines"""
#     if text:
#         return ' '.join(text.strip().split())
#     return ''

# def load_all_stores(driver, wait):
#     """Click 'Show More Stores' button until all stores are loaded"""
#     previous_store_count = 0
#     retries = 0
#     max_retries = 3
    
#     while retries < max_retries:
#         try:
#             # Get current number of stores
#             store_elements = driver.find_elements(By.CSS_SELECTOR, "li.tier")
#             current_store_count = len(store_elements)
            
#             # Try to find the "Show More Stores" button
#             show_more_button = driver.find_element(By.CLASS_NAME, "strmpr-view-more-stores-button")
            
#             # If button is not visible, we're done
#             if not show_more_button.is_displayed():
#                 break
            
#             # Scroll to button and click using JavaScript
#             driver.execute_script("arguments[0].scrollIntoView(true);", show_more_button)
#             time.sleep(1)  # Wait for scroll to complete
            
#             # Click using JavaScript to avoid intercepted click
#             driver.execute_script("arguments[0].click();", show_more_button)
#             print("Clicked 'Show More Stores' button...")
            
#             # Wait for new stores to load
#             time.sleep(2)
            
#             # Check if we got more stores
#             new_store_count = len(driver.find_elements(By.CSS_SELECTOR, "li.tier"))
#             if new_store_count > current_store_count:
#                 previous_store_count = new_store_count
#                 retries = 0  # Reset retries on successful load
#                 print(f"Loaded {new_store_count} stores so far...")
#             else:
#                 retries += 1
#                 print(f"No new stores loaded, retry {retries}/{max_retries}")
            
#         except NoSuchElementException:
#             print("No more 'Show More' button found")
#             break
#         except Exception as e:
#             print(f"Error while loading more stores: {e}")
#             retries += 1
#             time.sleep(1)
    
#     if retries >= max_retries:
#         print("Max retries reached, continuing with current stores")

# def scrape_parlor_locations():
#     """
#     Scrapes store location data from Parlor Coffee's website using Selenium
#     """
#     # Setup Chrome options
#     chrome_options = Options()
#     chrome_options.add_argument('--headless')
#     chrome_options.add_argument('--disable-gpu')
#     chrome_options.add_argument('--no-sandbox')
#     chrome_options.add_argument('--disable-dev-shm-usage')
#     chrome_options.add_argument('--window-size=1920,1080')  # Set larger window size
    
#     # Initialize the driver
#     driver = webdriver.Chrome(options=chrome_options)
#     wait = WebDriverWait(driver, 20)
    
#     try:
#         print("Loading webpage...")
#         driver.get("https://parlorcoffee.com/pages/where-to-find-us")
        
#         # Wait for initial store listings to load
#         print("Waiting for store listings to load...")
#         wait.until(
#             EC.presence_of_element_located((By.CSS_SELECTOR, "li.tier"))
#         )
        
#         # Load all stores
#         print("Loading all stores...")
#         load_all_stores(driver, wait)
        
#         # Get all store elements
#         store_elements = driver.find_elements(By.CSS_SELECTOR, "li.tier")
#         print(f"\nFound {len(store_elements)} stores")
        
#         # Process the stores data
#         processed_stores = []
#         seen_stores = set()  # Track unique store names and addresses
        
#         for store in store_elements:
#             try:
#                 # Get store name and address
#                 name = clean_text(store.find_element(By.CLASS_NAME, "storemapper-title").text)
#                 address_elem = store.find_element(By.CLASS_NAME, "storemapper-address")
#                 full_address = clean_text(address_elem.text)
                
#                 # Skip duplicate entries
#                 store_key = f"{name}:{full_address}"
#                 if store_key in seen_stores:
#                     continue
#                 seen_stores.add(store_key)
                
#                 # Parse address components
#                 address_parts = full_address.split(',')
#                 street_address = address_parts[0].strip() if len(address_parts) > 0 else ''
#                 city = address_parts[1].strip() if len(address_parts) > 1 else ''
#                 state_zip = address_parts[2].strip().split(' ') if len(address_parts) > 2 else ['', '']
#                 state = state_zip[0].strip() if len(state_zip) > 0 else ''
#                 zip_code = state_zip[1].strip() if len(state_zip) > 1 else ''
                
#                 # Get other details
#                 try:
#                     phone_elem = store.find_element(By.CLASS_NAME, "storemapper-phone")
#                     phone = clean_text(phone_elem.find_element(By.TAG_NAME, "a").text)
#                 except:
#                     phone = ''
                
#                 try:
#                     url_elem = store.find_element(By.CLASS_NAME, "storemapper-url")
#                     website = url_elem.find_element(By.TAG_NAME, "a").get_attribute("href")
#                 except:
#                     website = ''
                
#                 try:
#                     map_link = store.find_element(By.CLASS_NAME, "storemapper-storelink")
#                     latitude = map_link.get_attribute("data-lat")
#                     longitude = map_link.get_attribute("data-lng")
#                 except:
#                     latitude = ''
#                     longitude = ''
                
#                 try:
#                     distance = clean_text(store.find_element(By.CLASS_NAME, "storemapper-distance").text)
#                 except:
#                     distance = ''
                
#                 store_data = {
#                     'position': '0',
#                     'title': name,
#                     'address': f"{street_address}, {city}, {state} {zip_code}",
#                     'website': website if website else '0',
#                     'phone': phone if phone else '0',
#                     'visited': 'No',
#                     'order_online': 'No',
#                     'rating': '0',
#                     'reviews': '0',
#                     'price': '0',
#                     'thumbnail': 'https://lh5.googleusercontent.com/p/AF1QipND6J67Y58kMdRe6Ro8M5AeSH3c88_n9CIEEsqe=w122-h92-k-no',
#                     'unclaimed_listing': 'FALSE',
#                     'type': 'Coffee shop',
#                     'types': '[ "Coffee shop", "Gourmet grocery store", "Kosher grocery store", "Tourist attraction" ]',
#                     'service_options': '{ "in_store_pickup": true, "delivery": true }',
#                     'hours': 'Open ⋅ Closes 7:30 PM',
#                     'operating_hours': '{ "friday": "8 AM–7:30 PM", "saturday": "8 AM–7:30 PM", "sunday": "9 AM–6 PM", "monday": "8 AM–7:30 PM", "tuesday": "8 AM–7:30 PM", "wednesday": "8 AM–7:30 PM", "thursday": "8 AM–7:30 PM" }',
#                     'place_id': '0',
#                     'data_id': '0',
#                     'data_cid': '0',
#                     'gps_coordinates': '{ "latitude": ' + (latitude if latitude else '0') + ', "longitude": ' + (longitude if longitude else '0') + ' }',
#                     'latitude': latitude if latitude else '0',
#                     'longitude': longitude if longitude else '0',
#                     'area': city if city else '0',
#                     'is_source': 'FALSE',
#                     'quality_score': '94'
#                 }
#                 processed_stores.append(store_data)
                
#             except Exception as e:
#                 print(f"Error processing store: {e}")
#                 continue
        
#         # Sort stores by name
#         processed_stores.sort(key=lambda x: x['title'])
        
#         # Save to CSV
#         if processed_stores:
#             filename = 'parlor_coffee_locations.csv'
#             with open(filename, 'w', newline='', encoding='utf-8') as file:
#                 writer = csv.DictWriter(file, fieldnames=processed_stores[0].keys())
#                 writer.writeheader()
#                 writer.writerows(processed_stores)
#             print(f"\nData saved to {filename}")
            
#         print(f"\nSuccessfully scraped {len(processed_stores)} unique locations")
#         return processed_stores
        
#     except Exception as e:
#         print(f"Error processing the data: {e}")
#         print("Full error:")
#         import traceback
#         traceback.print_exc()
#         return []
        
#     finally:
#         driver.quit()

# if __name__ == "__main__":
#     print("Scraping Parlor Coffee locations...")
#     stores = scrape_parlor_locations()
    