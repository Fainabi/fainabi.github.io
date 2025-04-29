import os
import json

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

blog_directory = './blog'   # path blog directory

if __name__ == '__main__':
    files_data = scan_markdown(blog_directory)

    with open('./blog/index.json', 'w') as outfile:   # output json filename
        json.dump(files_data, outfile)  # to prettify the json in output file