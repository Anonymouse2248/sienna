from pathlib import Path
import json
import shutil

ROOT = Path(__file__).resolve().parents[2]
BUNDLE_DIR = ROOT / "StreamingAssets" / "aa" / "WebGL"
PATCH_MAP = Path(__file__).resolve().parent / "patch_map.json"


def load_map():
    if not PATCH_MAP.exists():
        raise FileNotFoundError(f"Patch map not found: {PATCH_MAP}. Run make_patch_map.py and edit translations.")
    data = json.loads(PATCH_MAP.read_text(encoding="utf-8"))
    mp = data.get("map", {})
    # Filter only entries with non-empty translations
    return {k: v for k, v in mp.items() if isinstance(v, str) and v.strip()}


def apply_to_file(path: Path, mapping: dict):
    src = path.read_bytes()
    text = src.decode("utf-8", errors="ignore")
    changed = False
    for k, v in mapping.items():
        if k in text:
            text = text.replace(k, v)
            changed = True
    if not changed:
        return None
    out_path = path.with_suffix(path.suffix + ".patched")
    out_path.write_text(text, encoding="utf-8")
    return out_path


def main():
    mapping = load_map()
    if not mapping:
        print("[info] No translations provided. Fill patch_map.json first.")
        return
    patched = []
    for p in BUNDLE_DIR.glob("*.bundle"):
        out = apply_to_file(p, mapping)
        if out:
            print(f"[patch] {p.name} -> {out.name}")
            patched.append(out)
    if not patched:
        print("[done] No files changed. Ensure the keys match the source strings exactly.")
    else:
        print(f"[done] Patched {len(patched)} file(s).")
        print("Next steps: replace originals with .patched or update catalog to point to patched files.")


if __name__ == "__main__":
    main()
