import os
import json
import re
import shutil
import hashlib
import tempfile
import subprocess
from datetime import datetime

LILYPOND_BLOCK_RE = re.compile(
    r":::lilypond(?:\s+([A-Za-z]+))?\s*\n(.*?)\n:::",
    re.DOTALL
)
TRANSLATE_RE = re.compile(r"translate\(([-\d.]+),\s*([-\d.]+)\)")


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


def _iter_markdown_files(blog_root):
    for root, _, files in os.walk(blog_root):
        for file in files:
            if file.endswith(".md"):
                yield os.path.join(root, file)


def _extract_lilypond_blocks(markdown_text):
    blocks = []
    for match in LILYPOND_BLOCK_RE.finditer(markdown_text):
        snippet = match.group(2).strip()
        if snippet:
            blocks.append(snippet)
    return blocks


def _lilypond_hash(snippet):
    normalized = snippet.replace("\r\n", "\n").strip()
    return hashlib.sha1(normalized.encode("utf-8")).hexdigest()[:16]


def _build_lilypond_source(snippet):
    normalized = snippet.replace("\r\n", "\n").strip()
    if "\\version" in normalized:
        return normalized + "\n"

    has_assignment = re.search(r"^\s*[A-Za-z][A-Za-z0-9_-]*\s*=", normalized, re.MULTILINE) is not None
    score_body = normalized
    preamble = ""
    if has_assignment and "<<" in normalized:
        split_idx = normalized.find("<<")
        preamble = normalized[:split_idx].strip()
        score_body = normalized[split_idx:].strip()

    return (
        '\\version "2.24.0"\n'
        "\\paper {\n"
        "  indent = 0\\mm\n"
        "  oddHeaderMarkup = ##f\n"
        "  oddFooterMarkup = ##f\n"
        "  bookTitleMarkup = ##f\n"
        "  scoreTitleMarkup = ##f\n"
        "}\n"
        + (preamble + "\n" if preamble else "")
        + "\\score {\n"
        + f"{score_body}\n"
        + "  \\layout {}\n"
        + "}\n"
    )


def _compile_lilypond_svg(lilypond_bin, snippet, output_dir):
    score_hash = _lilypond_hash(snippet)
    final_svg = os.path.join(output_dir, f"{score_hash}.svg")
    if os.path.exists(final_svg):
        return final_svg

    source = _build_lilypond_source(snippet)
    os.makedirs(output_dir, exist_ok=True)

    with tempfile.TemporaryDirectory() as tmpdir:
        input_path = os.path.join(tmpdir, f"{score_hash}.ly")
        output_base = os.path.join(tmpdir, score_hash)
        with open(input_path, "w", encoding="utf-8") as f:
            f.write(source)

        result = subprocess.run(
            [
                lilypond_bin,
                "-dbackend=svg",
                "-dno-point-and-click",
                "-dpreview",
                "-o",
                output_base,
                input_path,
            ],
            capture_output=True,
            text=True,
            check=False,
        )

        if result.returncode != 0:
            print(f"[lilypond] failed to compile snippet {score_hash}")
            if result.stderr:
                print(result.stderr.strip())
            return None

        candidates = [
            os.path.join(tmpdir, f"{score_hash}.svg"),
            os.path.join(tmpdir, f"{score_hash}-1.svg"),
        ]
        source_svg = next((p for p in candidates if os.path.exists(p)), None)
        if source_svg is None:
            print(f"[lilypond] no svg output generated for {score_hash}")
            return None

        shutil.copyfile(source_svg, final_svg)
        _crop_svg_viewbox(final_svg)
        return final_svg


def _crop_svg_viewbox(svg_path):
    try:
        with open(svg_path, "r", encoding="utf-8") as f:
            content = f.read()
    except OSError:
        return

    translations = [
        (float(x), float(y))
        for x, y in TRANSLATE_RE.findall(content)
    ]
    if not translations:
        return

    xs = [x for x, _ in translations]
    ys = [y for _, y in translations]

    # Tight crop heuristics in LilyPond viewBox units.
    pad_x = 1.2
    pad_y = 1.6
    glyph_extent_x = 4.0
    glyph_extent_y = 4.0

    min_x = min(xs) - pad_x
    min_y = min(ys) - pad_y
    width = (max(xs) - min(xs)) + glyph_extent_x + 2 * pad_x
    height = (max(ys) - min(ys)) + glyph_extent_y + 2 * pad_y

    if width <= 0 or height <= 0:
        return

    original_viewbox_match = re.search(r'viewBox="([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)"', content)
    old_view_w = None
    old_view_h = None
    if original_viewbox_match:
        old_view_w = float(original_viewbox_match.group(3))
        old_view_h = float(original_viewbox_match.group(4))

    width_match = re.search(r'width="([-\d.]+)([a-zA-Z%]*)"', content)
    height_match = re.search(r'height="([-\d.]+)([a-zA-Z%]*)"', content)

    content = re.sub(
        r'viewBox="[^"]+"',
        f'viewBox="{min_x:.4f} {min_y:.4f} {width:.4f} {height:.4f}"',
        content,
        count=1,
    )

    if width_match and height_match and old_view_w and old_view_h and old_view_w > 0 and old_view_h > 0:
        old_width_value = float(width_match.group(1))
        old_height_value = float(height_match.group(1))
        width_unit = width_match.group(2) or "mm"
        height_unit = height_match.group(2) or "mm"

        # Preserve glyph visual scale by keeping the old unit-per-viewBox ratio.
        new_width_value = old_width_value * (width / old_view_w)
        new_height_value = old_height_value * (height / old_view_h)

        content = re.sub(
            r'width="[^"]+"',
            f'width="{new_width_value:.4f}{width_unit}"',
            content,
            count=1,
        )
        content = re.sub(
            r'height="[^"]+"',
            f'height="{new_height_value:.4f}{height_unit}"',
            content,
            count=1,
        )
    else:
        # Fallback: keep units explicit so browser does not treat as tiny px.
        content = re.sub(r'width="[^"]+"', f'width="{width:.4f}mm"', content, count=1)
        content = re.sub(r'height="[^"]+"', f'height="{height:.4f}mm"', content, count=1)

    with open(svg_path, "w", encoding="utf-8") as f:
        f.write(content)


def _generate_lilypond_assets(blog_root, output_dir):
    lilypond_bin = shutil.which("lilypond")
    if lilypond_bin is None:
        print("[lilypond] lilypond binary not found, skipping score generation")
        return

    snippets = {}
    for markdown_path in _iter_markdown_files(blog_root):
        try:
            with open(markdown_path, "r", encoding="utf-8") as f:
                content = f.read()
        except UnicodeDecodeError:
            with open(markdown_path, "r", encoding="latin-1") as f:
                content = f.read()

        for snippet in _extract_lilypond_blocks(content):
            if snippet:
                snippets[_lilypond_hash(snippet)] = snippet

    needed_hashes = set(snippets.keys())

    for snippet in snippets.values():
        _compile_lilypond_svg(lilypond_bin, snippet, output_dir)

    # Remove stale generated files that no longer correspond to any
    # current :::lilypond block in the blog markdown.
    if os.path.isdir(output_dir):
        for filename in os.listdir(output_dir):
            if not filename.endswith(".svg"):
                continue
            file_hash = os.path.splitext(filename)[0]
            if file_hash not in needed_hashes:
                try:
                    os.remove(os.path.join(output_dir, filename))
                except OSError:
                    pass

blog_directory = './blog'   # path blog directory

if __name__ == '__main__':
    files_data = scan_markdown(blog_directory)
    latest_posts = _build_latest_posts(blog_directory, limit=6)
    _generate_lilypond_assets(blog_directory, './public/generated/lilypond')

    with open('./blog/index.json', 'w') as outfile:   # output json filename
        json.dump(files_data, outfile)  # to prettify the json in output file

    with open('./blog/featured.json', 'w', encoding='utf-8') as outfile:
        json.dump(latest_posts, outfile, ensure_ascii=False, indent=2)