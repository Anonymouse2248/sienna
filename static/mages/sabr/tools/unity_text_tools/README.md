Unity WebGL Addressables text extractor and patcher

This toolkit helps extract visible text strings from Addressables bundles in a built WebGL game and patch them with translations, without needing the original Unity project.

Overview
- scan_bundles.py: Scans .bundle files for UTF-8 strings containing Cyrillic (Russian) characters and writes them to strings_found.txt
- make_patch_map.py: Creates a JSON patch map from strings_found.txt with placeholders for English translations
- apply_patches.py: Applies a translation map to the bundles and writes patched copies alongside originals

Limitations
- Works best for plain TextAssets and serialized strings stored as UTF-8. Strings compiled inside code or font atlases cannot be patched here.
- Always back up your Build/ and StreamingAssets/ before patching.

Quick start (Windows PowerShell)
1) Create venv and install dependencies
   python -m venv .venv; .\.venv\Scripts\Activate.ps1; pip install -U unitypy

2) Scan bundles for Russian strings
   python tools\unity_text_tools\scan_bundles.py

3) Generate a translation template
   python tools\unity_text_tools\make_patch_map.py
   # Edit tools\unity_text_tools\patch_map.json to add English translations for each key

4) Apply patches (creates .patched copies)
   python tools\unity_text_tools\apply_patches.py

5) Point Addressables to patched bundles (optional):
   - Replace original bundle files with their .patched copies (after validating in a browser), OR
   - Update StreamingAssets/aa/catalog.json entries to point to the .patched filenames (advanced).

Notes
- You may need to clear the UnityCache in the browser (DevTools > Application > Clear storage) after patching.
- For full localization (fonts, layout, RTL), use the original Unity project when possible.
