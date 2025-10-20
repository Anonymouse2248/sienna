from pathlib import Path
import json

ROOT = Path(__file__).resolve().parent
FOUND = ROOT / "strings_found.txt"
PATCH_MAP = ROOT / "patch_map.json"


def main():
    if not FOUND.exists():
        print(f"[error] {FOUND} not found. Run scan_bundles.py first.")
        return
    keys = []
    for line in FOUND.read_text(encoding="utf-8").splitlines():
        s = line.strip()
        if not s:
            continue
        keys.append(s)
    template = {"__comment": "Fill values with English translations. Exact match replace.", "map": {k: "" for k in keys}}
    PATCH_MAP.write_text(json.dumps(template, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"[done] wrote template to {PATCH_MAP}")


if __name__ == "__main__":
    main()
