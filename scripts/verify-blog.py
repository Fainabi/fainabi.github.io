import os
import re
import hashlib
import json
import sys

# Constants for matching scan.py logic
BLOG_ROOT = "blog"
LILYPOND_DIR = "public/generated/lilypond"
LILYPOND_BLOCK_RE = re.compile(r":::lilypond(?:\s+([A-Za-z]+))?\s*\n(.*?)\n:::", re.DOTALL)

def get_lilypond_hash(snippet):
    normalized = snippet.replace("\r\n", "\n").strip()
    return hashlib.sha1(normalized.encode("utf-8")).hexdigest()[:16]

def check_article(filepath):
    errors = []
    with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()

    # Check :::meta block
    meta_match = re.search(r":::meta\s*\n(.*?)\n:::", content, re.DOTALL)
    if not meta_match:
        errors.append("Missing :::meta block at the top of the file.")
    else:
        meta_content = meta_match.group(1)
        if "title :" not in meta_content.lower():
            errors.append("Missing 'title :' in meta block.")
        # Note: quickview is optional for agents as per BLOG.md

    # Check LilyPond assets
    lily_matches = LILYPOND_BLOCK_RE.findall(content)
    for _, snippet in lily_matches:
        l_hash = get_lilypond_hash(snippet)
        svg_path = os.path.join(LILYPOND_DIR, f"{l_hash}.svg")
        if not os.path.exists(svg_path):
            errors.append(f"LilyPond block found but missing generated asset: {svg_path}. (Run scan.py)")

    return errors

def verify_all():
    all_errors = {}
    found_any = False
    
    for root, _, files in os.walk(BLOG_ROOT):
        for file in files:
            # Skip non-articles and internal tracking files
            if file.endswith(".md") and file.lower() not in ["readme.md", "todo.md"]:
                found_any = True
                path = os.path.join(root, file)
                errs = check_article(path)
                if errs:
                    all_errors[path] = errs

    # Check if index.json exists
    if not os.path.exists("blog/index.json"):
        all_errors["System"] = ["Missing blog/index.json. (Run scan.py)"]

    if all_errors:
        print("❌ Blog Verification Failed:")
        for path, errs in all_errors.items():
            print(f"\n[{path}]")
            for e in errs:
                print(f"  - {e}")
        return False
    
    if not found_any:
        print("⚠️ No blog posts found to verify.")
        return True

    print("✅ All blog posts adhere to the framework.")
    return True

if __name__ == "__main__":
    success = verify_all()
    if not success:
        sys.exit(1)
