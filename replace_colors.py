import os
import re

def replace_colors(dir_path):
    for root, dirs, files in os.walk(dir_path):
        for file in files:
            if file.endswith(('.tsx', '.ts', '.js')):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                original = content
                content = content.replace('neon-pink', 'primary')
                content = content.replace('holo-gold', 'secondary')
                content = content.replace('from-pink-50', 'from-emerald-50')
                content = content.replace('dark:from-pink-950', 'dark:from-emerald-950')
                
                if content != original:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(content)

replace_colors('src/app')
