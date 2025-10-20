import json
from pathlib import Path
import UnityPy

ROOT = Path(__file__).resolve().parents[2]
BUNDLE_DIR = ROOT / "StreamingAssets" / "aa" / "WebGL"
PATCH_JSON = Path(__file__).resolve().parent / "unity_patch_map.json"


def apply_to_bundle(bundle_path: Path, patch_map: dict):
    data = bundle_path.read_bytes()
    env = UnityPy.load(data)
    changed = False

    for obj in env.objects:
        try:
            if obj.type.name == "TextAsset":
                ta = obj.read()
                if hasattr(ta, "script") and isinstance(ta.script, bytes):
                    text = ta.script.decode("utf-8", errors="ignore")
                    new_text = text
                    for k, v in patch_map.items():
                        if k and k in new_text:
                            new_text = new_text.replace(k, v)
                    if new_text != text:
                        ta.script = new_text.encode("utf-8")
                        ta.save()
                        changed = True
            elif obj.type.name == "MonoBehaviour":
                tree = obj.read_typetree()
                def patch_tree(node):
                    if isinstance(node, dict):
                        for k in list(node.keys()):
                            node[k] = patch_tree(node[k])
                    elif isinstance(node, list):
                        for i in range(len(node)):
                            node[i] = patch_tree(node[i])
                    elif isinstance(node, str):
                        s = node
                        for k, v in patch_map.items():
                            if k and k in s:
                                s = s.replace(k, v)
                        if s != node:
                            return s
                        return node
                    return node
                new_tree = patch_tree(tree)
                if new_tree != tree:
                    obj.save_typetree(new_tree)
                    changed = True
        except Exception:
            pass

    if changed:
        out = env.file.save(packer=(64, 2))
        out_path = bundle_path.with_suffix(bundle_path.suffix + ".patched")
        out_path.write_bytes(out)
        return out_path
    return None


def main():
    if not PATCH_JSON.exists():
        print(f"[error] missing patch map: {PATCH_JSON}")
        return
    patch_map = json.loads(PATCH_JSON.read_text(encoding="utf-8")).get("map", {})
    if not patch_map:
        print("[info] empty patch map")
        return
    patched = []
    for p in BUNDLE_DIR.glob("*.bundle"):
        out = apply_to_bundle(p, patch_map)
        if out:
            print(f"[patch] {p.name} -> {out.name}")
            patched.append(out)
    print(f"[done] patched {len(patched)} bundles")


if __name__ == "__main__":
    main()
