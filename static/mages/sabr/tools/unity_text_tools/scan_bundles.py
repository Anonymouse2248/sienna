import os
import re
from pathlib import Path

BUNDLE_DIR = Path(__file__).resolve().parents[2] / "StreamingAssets" / "aa" / "WebGL"
OUTPUT = Path(__file__).resolve().parent / "strings_found.txt"

CYRILLIC_RE = re.compile(r"[\u0400-\u04FF]+")


def iter_bundle_paths():
    if not BUNDLE_DIR.exists():
        return
    for p in BUNDLE_DIR.glob("*.bundle"):
        yield p


def extract_strings_from_bytes(data: bytes, min_len: int = 3):
    results = set()
    try:
        text = data.decode("utf-8", errors="ignore")
    except Exception:
        return results
    # Find substrings with Cyrillic characters; expand to word boundaries
    for m in CYRILLIC_RE.finditer(text):
        s = m.group(0)
        if len(s) >= min_len:
            results.add(s)
    return results


def scan_file(path: Path):
    try:
        with open(path, "rb") as f:
            data = f.read()
        return extract_strings_from_bytes(data)
    except Exception as e:
        print(f"[warn] failed to scan {path}: {e}")
        return set()


def main():
    found = set()
    for bp in iter_bundle_paths():
        strs = scan_file(bp)
        if strs:
            print(f"[scan] {bp.name}: {len(strs)} strings")
            found.update(strs)
    if found:
        with open(OUTPUT, "w", encoding="utf-8") as out:
            for s in sorted(found):
                out.write(s + "\n")
        print(f"[done] wrote {len(found)} unique strings to {OUTPUT}")
    else:
        print("[done] no Cyrillic strings found in bundles")


if __name__ == "__main__":
    main()
