"""Create a checksum-verified APK delta using identical ZIP entry payloads.

Usage: python scripts/make-apk-update.py BASE_APK NEW_APK
Only public, signed APK bytes are included; no signing credentials are read.
"""
import base64
import gzip
import hashlib
import json
import struct
import sys
import zipfile
from pathlib import Path

base_path, target_path = map(Path, sys.argv[1:3])
base, target = base_path.read_bytes(), target_path.read_bytes()
def payload(info, data):
    name_length, extra_length = struct.unpack_from('<HH', data, info.header_offset + 26)
    begin = info.header_offset + 30 + name_length + extra_length
    return begin, begin + info.compress_size
with zipfile.ZipFile(base_path) as archive:
    previous = {info.filename: payload(info, base) for info in archive.infolist()}
operations = []
def literal(data):
    if data:
        operations.append({'data': base64.b64encode(data).decode('ascii')})
cursor = 0
with zipfile.ZipFile(target_path) as archive:
    for info in sorted(archive.infolist(), key=lambda item: item.header_offset):
        begin, end = payload(info, target)
        literal(target[cursor:begin])
        old = previous.get(info.filename)
        if old and base[old[0]:old[1]] == target[begin:end] and end > begin:
            operations.append({'offset': old[0], 'length': end - begin})
        else:
            literal(target[begin:end])
        cursor = end
literal(target[cursor:])
rebuilt = b''.join(base[op['offset']:op['offset'] + op['length']] if 'offset' in op else base64.b64decode(op['data']) for op in operations)
assert rebuilt == target, 'Reconstruction differs from signed APK'
patch = {'baseSha256': hashlib.sha256(base).hexdigest(), 'sha256': hashlib.sha256(target).hexdigest(), 'filename': target_path.name, 'size': len(target), 'operations': operations}
destination = Path(__file__).with_name('apk-update.json.gz')
destination.write_bytes(gzip.compress(json.dumps(patch, separators=(',', ':')).encode(), mtime=0))
print('Verified delta:', destination.stat().st_size, 'bytes; target SHA256:', patch['sha256'])
