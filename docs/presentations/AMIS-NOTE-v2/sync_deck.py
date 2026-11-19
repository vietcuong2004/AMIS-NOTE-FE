#!/usr/bin/env python3
"""
AMIS-NOTE-V2 Automated 2-Way Synchronization Engine
- Local -> Google Drive:
    When AMIS-NOTE-V2.md or AMIS-NOTE-V2.pptx is modified locally:
    -> Updates PPTX -> Compiles PDF -> Pushes to Google Drive in-place!
- Google Drive -> Local:
    When you edit online on Google Drive / Google Slides:
    -> Pulls latest PPTX to local -> Compiles PDF!
"""

import os
import sys
import time
import subprocess
import zipfile
import re
import json
import xml.etree.ElementTree as ET

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MD_PATH = os.path.join(SCRIPT_DIR, "AMIS-NOTE-V2.md")
PPTX_PATH = os.path.join(SCRIPT_DIR, "AMIS-NOTE-V2.pptx")
PDF_PATH = os.path.join(SCRIPT_DIR, "AMIS-NOTE-V2.pdf")

GDRIVE_PPTX_ID = "16hDARXsNqahH2lxMbgMB6_4-6a1p3dQG"
GDRIVE_PDF_ID = "17XRe-wRQNTh_3rdPq0YA8AvVlnQfE-ZQ"

NS = {
    'p': 'http://schemas.openxmlformats.org/presentationml/2006/main',
    'a': 'http://schemas.openxmlformats.org/drawingml/2006/main',
    'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
}

for prefix, uri in NS.items():
    ET.register_namespace(prefix, uri)

def log(msg):
    now = time.strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{now}] {msg}", flush=True)

def parse_markdown(md_text):
    slide_chunks = re.split(r'\n(?=# Slide \d+)', md_text)
    deck = {}
    for chunk in slide_chunks:
        chunk = chunk.strip()
        if not chunk.startswith('# Slide'):
            continue
        first_line = chunk.split('\n')[0]
        m = re.match(r'# Slide (\d+)\s*[-:]?\s*(.*)', first_line)
        if not m:
            continue
        num = int(m.group(1))
        tracker = m.group(2).strip()

        title_m = re.search(r'^##\s+(.*)', chunk, re.MULTILINE)
        title = title_m.group(1).strip() if title_m else ''

        tbl_matches = re.findall(r'(\|(?:[^\n]+\|)+)', chunk)
        rows = []
        if tbl_matches:
            for l in tbl_matches:
                if re.match(r'\|(?:\s*[-:]+[-|\s:]*)\|', l):
                    continue
                cells = [c.strip() for c in l.strip('|').split('|')]
                rows.append(cells)

        banner_m = re.search(r'\*\*(Giá trị mang lại|Kết quả kỳ vọng|Định hướng cốt lõi|Định hướng chung|Bài học & Giải pháp áp dụng cho AMIS NOTE):\*\*\s*(.*)', chunk)
        banner_prefix = banner_m.group(1) if banner_m else ''
        banner_text = banner_m.group(2).strip() if banner_m else ''

        deck[num] = {
            'tracker': tracker,
            'title': title,
            'table': rows,
            'banner_prefix': banner_prefix,
            'banner_text': banner_text
        }
    return deck

def update_slide_xml(xml_content, slide_data, slide_num):
    try:
        root = ET.fromstring(xml_content)
    except Exception as e:
        log(f"Error parsing slide {slide_num} XML: {e}")
        return xml_content

    # 1. Update Tracker
    if slide_data.get('tracker'):
        for sp in root.findall('.//p:sp', NS):
            cNvPr = sp.find('p:nvSpPr/p:cNvPr', NS)
            name = cNvPr.attrib.get('name', '') if cNvPr is not None else ''
            p_first = sp.find('.//a:p', NS)
            if p_first is not None:
                t_first = ''.join([t.text for t in p_first.findall('.//a:t', NS) if t.text])
                if name == 'Tracker' or t_first.startswith('PHẦN '):
                    r_first = p_first.find('.//a:r', NS)
                    if r_first is not None:
                        t_node = r_first.find('a:t', NS)
                        if t_node is not None:
                            t_node.text = slide_data['tracker']

    # 2. Update Main Title
    if slide_data.get('title'):
        for sp in root.findall('.//p:sp', NS):
            cNvPr = sp.find('p:nvSpPr/p:cNvPr', NS)
            name = cNvPr.attrib.get('name', '') if cNvPr is not None else ''
            if name in ['MainTitle', 'Text 1'] or 'Mục tiêu' in name:
                p_nodes = sp.findall('.//a:p', NS)
                for p in p_nodes:
                    r_nodes = p.findall('a:r', NS)
                    for r in r_nodes:
                        rPr = r.find('a:rPr', NS)
                        if rPr is not None and int(rPr.attrib.get('sz', '0')) >= 1800:
                            t_node = r.find('a:t', NS)
                            if t_node is not None:
                                t_node.text = slide_data['title']

    # 3. Update Table if present
    table_rows = slide_data.get('table', [])
    if table_rows:
        tbl = root.find('.//a:tbl', NS)
        if tbl is not None:
            xml_rows = tbl.findall('a:tr', NS)
            for r_idx, (m_row, x_row) in enumerate(zip(table_rows, xml_rows)):
                x_cells = x_row.findall('a:tc', NS)
                for c_idx, (m_cell, x_cell) in enumerate(zip(m_row, x_cells)):
                    p_node = x_cell.find('.//a:p', NS)
                    if p_node is not None:
                        r_nodes = p_node.findall('a:r', NS)
                        if r_nodes:
                            first_r = r_nodes[0]
                            t_node = first_r.find('a:t', NS)
                            clean_text = re.sub(r'\*\*(.*?)\*\*', r'\1', m_cell).replace('<br>', '\n')
                            if t_node is not None:
                                t_node.text = clean_text
                            for rem_r in r_nodes[1:]:
                                p_node.remove(rem_r)

    # 4. Update Bottom Banner
    if slide_data.get('banner_text'):
        full_banner = slide_data['banner_text']
        prefix = slide_data.get('banner_prefix', '')
        for sp in root.findall('.//p:sp', NS):
            cNvPr = sp.find('p:nvSpPr/p:cNvPr', NS)
            name = cNvPr.attrib.get('name', '') if cNvPr is not None else ''
            p_node = sp.find('.//a:p', NS)
            if p_node is not None:
                t_nodes = p_node.findall('.//a:t', NS)
                all_t = ''.join([t.text for t in t_nodes if t.text])
                if name in ['BannerText', 'Text 5_Bottom', 'Text 2'] or any(k in all_t for k in ['Giá trị mang lại', 'Kết quả kỳ vọng', 'Định hướng cốt lõi', 'Định hướng chung', 'Bài học & Giải pháp']):
                    r_nodes = p_node.findall('a:r', NS)
                    if len(r_nodes) >= 2:
                        t0 = r_nodes[0].find('a:t', NS)
                        t1 = r_nodes[1].find('a:t', NS)
                        if t0 is not None and prefix:
                            t0.text = f"{prefix}: "
                        if t1 is not None:
                            t1.text = full_banner
                    elif len(r_nodes) == 1:
                        t0 = r_nodes[0].find('a:t', NS)
                        if t0 is not None:
                            t0.text = f"{prefix}: {full_banner}" if prefix else full_banner

    return ET.tostring(root, encoding='utf-8', xml_declaration=True)

def sync_md_to_pptx():
    log("Reading markdown source...")
    with open(MD_PATH, 'r', encoding='utf-8') as f:
        md_text = f.read()

    deck = parse_markdown(md_text)
    log(f"Parsed {len(deck)} slides from Markdown.")

    temp_pptx = PPTX_PATH + ".tmp"
    with zipfile.ZipFile(PPTX_PATH, 'r') as zin, zipfile.ZipFile(temp_pptx, 'w', zipfile.ZIP_DEFLATED) as zout:
        for item in zin.infolist():
            content = zin.read(item.filename)
            m = re.match(r'ppt/slides/slide(\d+)\.xml$', item.filename)
            if m:
                slide_num = int(m.group(1))
                if slide_num in deck:
                    content = update_slide_xml(content, deck[slide_num], slide_num)
            zout.writestr(item, content)

    os.replace(temp_pptx, PPTX_PATH)
    log(f"Successfully synchronized {PPTX_PATH} from Markdown.")

def compile_pdf():
    log("Compiling PDF with LibreOffice...")
    cmd = [
        "soffice", "--headless", "--convert-to", "pdf",
        PPTX_PATH, "--outdir", SCRIPT_DIR
    ]
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if res.returncode == 0:
        log(f"PDF compiled successfully: {PDF_PATH}")
    else:
        log(f"LibreOffice warning: {res.stderr}")

def upload_to_gdrive():
    log("Uploading latest files to Google Drive (in-place)...")
    cmd_pptx = ["gdrive", "mutate", "update", GDRIVE_PPTX_ID, PPTX_PATH]
    res_pptx = subprocess.run(cmd_pptx, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if res_pptx.returncode == 0:
        log(f"Google Drive PPTX updated: {res_pptx.stdout.strip()}")

    cmd_pdf = ["gdrive", "mutate", "update", GDRIVE_PDF_ID, PDF_PATH]
    res_pdf = subprocess.run(cmd_pdf, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if res_pdf.returncode == 0:
        log(f"Google Drive PDF updated: {res_pdf.stdout.strip()}")

def get_cloud_modified_time():
    try:
        cmd = ["gdrive", "readonly", "info", GDRIVE_PPTX_ID, "--json"]
        res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        if res.returncode == 0:
            data = json.loads(res.stdout)
            return data.get("modifiedTime")
    except Exception:
        pass
    return None

def pull_from_gdrive():
    log("Downloading latest version from Google Drive...")
    cmd = ["gdrive", "readonly", "download", GDRIVE_PPTX_ID, "--out", PPTX_PATH]
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if res.returncode == 0:
        log("Downloaded latest PPTX from Google Drive.")
        compile_pdf()
        log("Local PPTX & PDF updated from Google Drive successfully!")
    else:
        log(f"Failed to pull from Google Drive: {res.stderr}")

def watch():
    log("Starting AMIS-NOTE-V2 2-Way Synchronization Watcher...")
    log(f"Local files: {MD_PATH} & {PPTX_PATH}")
    log(f"Google Drive PPTX: https://docs.google.com/presentation/d/{GDRIVE_PPTX_ID}/edit")

    last_md_mtime = os.path.getmtime(MD_PATH) if os.path.exists(MD_PATH) else 0
    last_pptx_mtime = os.path.getmtime(PPTX_PATH) if os.path.exists(PPTX_PATH) else 0
    last_cloud_mtime = get_cloud_modified_time()
    last_cloud_check = time.time()

    while True:
        try:
            time.sleep(2)
            now = time.time()

            # 1. Check local MD changes
            curr_md_mtime = os.path.getmtime(MD_PATH) if os.path.exists(MD_PATH) else 0
            if curr_md_mtime > last_md_mtime:
                log("Local change detected in AMIS-NOTE-V2.md! Pushing to PPTX, PDF & Google Drive...")
                sync_md_to_pptx()
                compile_pdf()
                upload_to_gdrive()
                last_md_mtime = os.path.getmtime(MD_PATH)
                last_pptx_mtime = os.path.getmtime(PPTX_PATH)
                last_cloud_mtime = get_cloud_modified_time()
                continue

            # 2. Check local PPTX changes
            curr_pptx_mtime = os.path.getmtime(PPTX_PATH) if os.path.exists(PPTX_PATH) else 0
            if curr_pptx_mtime > last_pptx_mtime:
                log("Local change detected in AMIS-NOTE-V2.pptx! Compiling PDF & pushing to Google Drive...")
                compile_pdf()
                upload_to_gdrive()
                last_pptx_mtime = os.path.getmtime(PPTX_PATH)
                last_cloud_mtime = get_cloud_modified_time()
                continue

            # 3. Check Google Drive changes every 20 seconds
            if now - last_cloud_check > 20:
                last_cloud_check = now
                cloud_mtime = get_cloud_modified_time()
                if cloud_mtime and last_cloud_mtime and cloud_mtime != last_cloud_mtime:
                    log(f"Cloud update detected on Google Drive ({cloud_mtime})! Pulling to local...")
                    pull_from_gdrive()
                    last_cloud_mtime = cloud_mtime
                    last_pptx_mtime = os.path.getmtime(PPTX_PATH)

        except KeyboardInterrupt:
            log("Watcher stopped.")
            break
        except Exception as e:
            log(f"Watcher loop notice: {e}")
            time.sleep(2)

if __name__ == '__main__':
    if len(sys.argv) > 1:
        if sys.argv[1] == '--watch':
            watch()
        elif sys.argv[1] == '--pull':
            pull_from_gdrive()
        elif sys.argv[1] == '--push':
            sync_md_to_pptx()
            compile_pdf()
            upload_to_gdrive()
    else:
        sync_md_to_pptx()
        compile_pdf()
        upload_to_gdrive()
