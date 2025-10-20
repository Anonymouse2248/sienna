import json
import re
from pathlib import Path
import UnityPy

ROOT = Path(__file__).resolve().parents[2]
BUNDLE_DIR = ROOT / "StreamingAssets" / "aa" / "WebGL"
OUT_JSON = Path(__file__).resolve().parent / "unity_strings.json"
CYRILLIC_RE = re.compile(r"[\u0400-\u04FF]+")


def walk_tree(tree, path_prefix=""):
    entries = []
    if isinstance(tree, dict):
        for k, v in tree.items():
            subp = f"{path_prefix}.{k}" if path_prefix else k
            entries.extend(walk_tree(v, subp))
    elif isinstance(tree, list):
        for idx, v in enumerate(tree):
            subp = f"{path_prefix}[{idx}]"
            entries.extend(walk_tree(v, subp))
    else:
        if isinstance(tree, str) and CYRILLIC_RE.search(tree):
            entries.append((path_prefix, tree))
    return entries


def extract_from_bundle(bundle_path: Path):
    env = UnityPy.load(bundle_path.read_bytes())
    results = []
    for obj in env.objects:
        try:
            if obj.type.name in ("TextAsset",):
                data = obj.read()
                # text content may be in .script or .m_Script depending on version
                content = None
                if hasattr(data, "script") and isinstance(data.script, bytes):
                    try:
                        content = data.script.decode("utf-8", errors="ignore")
                    except Exception:
                        content = None
                if content and CYRILLIC_RE.search(content):
                    results.append({
                        "bundle": bundle_path.name,
                        "type": obj.type.name,
                        "path_id": obj.path_id,
                        "container": obj.container or "",
                        "field": "script",
                        "value": content,
                    })
            elif obj.type.name in ("MonoBehaviour",):
                # Try typetree
                tree = obj.read_typetree()
                pairs = walk_tree(tree)
                for field_path, text in pairs:
                    results.append({
                        "bundle": bundle_path.name,
                        "type": obj.type.name,
                        "path_id": obj.path_id,
                        "container": obj.container or "",
                        "field": field_path,
                        "value": text,
                    })
        except Exception:
            # best effort, skip object on error
            pass
    return results


def main():
    all_results = []
    if not BUNDLE_DIR.exists():
        print(f"[error] bundle dir missing: {BUNDLE_DIR}")
        return
    bundles = list(BUNDLE_DIR.glob("*.bundle"))
    print(f"[info] scanning {len(bundles)} bundles...")
    for bp in bundles:
        res = extract_from_bundle(bp)
        if res:
            print(f"[scan] {bp.name}: {len(res)} strings")
            all_results.extend(res)
    with open(OUT_JSON, "w", encoding="utf-8") as f:
        json.dump(all_results, f, ensure_ascii=False, indent=2)
    print(f"[done] wrote {OUT_JSON} with {len(all_results)} entries")


if __name__ == "__main__":
    main()
