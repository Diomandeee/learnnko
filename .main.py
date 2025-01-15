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
            markdown_file.write("```typescript\n")
            markdown_file.write(content)
            markdown_file.write("\n```\n")
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
        "src/components/scheduling", 
        "src/app/api/scheduling"
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