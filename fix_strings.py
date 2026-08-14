import re
import os
import glob

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Pattern: language === 'bn' ? '...' : '...'
    # Or language === 'bn' ? "..." : "..."
    # Or language === 'bn' ? `...` : `...`
    # Also handle multiline matches
    
    # We will use a regex that looks for `language === 'bn' ? <string> : <string>`
    
    # Actually, simpler: write a regex that matches `language === 'bn' ? [^:]+ : ('[^']+'|"[^"]+"|`[^`]+`)`
    
    # Let's do it manually because regex might be tricky with nested quotes.
    
    # I'll just use a regex that matches `language === 'bn'\s*\??\s*(['"`].*?['"`])\s*:\s*(['"`].*?['"`])`
    # Wait, some are `language === 'bn' ? 'BN' : 'EN'`
    pattern1 = r"language === 'bn'\s*\?\s*['\"][^'\"]*['\"]\s*:\s*('[^']*'|\"[^\"]*\")"
    content = re.sub(pattern1, r"\1", content, flags=re.DOTALL)
    
    pattern2 = r"language === 'bn'\s*\?\s*`[^`]*`\s*:\s*(`[^`]*`)"
    content = re.sub(pattern2, r"\1", content, flags=re.DOTALL)
    
    # Let's handle the specific long one in ProductReviews
    pattern_long = r"language === 'bn'\s*\?\s*'দুঃখিত!.*?'\s*:\s*('[^']*')"
    content = re.sub(pattern_long, r"\1", content, flags=re.DOTALL)
    
    # what about `(language === 'bn' ? 'bn' : 'en')` => `('en')` => let's just do `language === 'bn' ? 'bn' : 'en'` to `'en'`
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Processed {filepath}")

for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith(('.tsx', '.ts')):
            process_file(os.path.join(root, file))

