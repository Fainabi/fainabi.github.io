import os
import json
from datetime import datetime

def scan_markdown(filepath):
    (root, dirs, files) = next(os.walk(filepath))
    basename = os.path.basename(filepath)

    dir = []
    for file in files:
        if file.endswith('.md'):
            dir.append({'name': file, 'dir': []})

    for subdir in dirs:
        dir.append(scan_markdown(os.path.join(root, subdir)))

    return {'name': basename, 'dir': dir}


def _extract_title_and_description(file_path):
    title = os.path.splitext(os.path.basename(file_path))[0]
    description = ""

    try:
        with open(file_path, "r", encoding="utf-8") as f:
            lines = f.readlines()
    except UnicodeDecodeError:
        with open(file_path, "r", encoding="latin-1") as f:
            lines = f.readlines()

    in_meta = False
    for raw_line in lines:
        line = raw_line.strip()
        if line == ":::meta":
            in_meta = True
            continue
        if in_meta and line == ":::":  # end of meta block
            in_meta = False
            continue
        if in_meta and " : " in line:
            key, value = line.split(" : ", 1)
            key = key.strip().lower()
            value = value.strip()
            if key == "title" and value:
                title = value
            elif key == "quickview" and value and not description:
                description = value

    if description:
        return title, description

    for raw_line in lines:
        line = raw_line.strip()
        if not line or line.startswith("#") or line.startswith(":::"):
            continue
        if " : " in line and line.split(" : ", 1)[0].isalpha():
            continue
        description = line
        break

    if not description:
        description = "Latest blog article."

    return title, description


def _build_latest_posts(blog_root, limit=5):
    markdown_files = []
    for root, _, files in os.walk(blog_root):
        for file in files:
            if not file.endswith(".md"):
                continue
            if file.lower() == "readme.md":
                continue
            full_path = os.path.join(root, file)
            created_ts = os.path.getctime(full_path)
            markdown_files.append((full_path, created_ts))

    markdown_files.sort(key=lambda x: x[1], reverse=True)
    latest = markdown_files[:limit]

    posts = []
    for full_path, created_ts in latest:
        rel_path = os.path.relpath(full_path, blog_root)
        path_parts = rel_path.split(os.sep)
        title, description = _extract_title_and_description(full_path)
        date = datetime.fromtimestamp(created_ts).strftime("%Y-%m-%d")
        posts.append({
            "title": title,
            "description": description,
            "date": date,
            "path": path_parts,
        })

    return posts

blog_directory = './blog'   # path blog directory

if __name__ == '__main__':
    files_data = scan_markdown(blog_directory)
    latest_posts = _build_latest_posts(blog_directory, limit=6)

    with open('./blog/index.json', 'w') as outfile:   # output json filename
        json.dump(files_data, outfile)  # to prettify the json in output file

    with open('./blog/featured.json', 'w', encoding='utf-8') as outfile:
        json.dump(latest_posts, outfile, ensure_ascii=False, indent=2)