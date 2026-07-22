import os
import re

color_map = {
    'pink': 'primary',
    'rose': 'primary',
    'fuchsia': 'primary',
    'yellow': 'secondary',
    'amber': 'secondary',
    'gold': 'secondary',
    'indigo': 'accent',
    'violet': 'accent',
    'purple': 'purple',
    'emerald': 'success',
    'green': 'success',
    'red': 'danger',
    'blue': 'info',
    'sky': 'info',
    'cyan': 'info',
    'orange': 'warning'
}

def replace_colors_in_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
        return
    
    original = content
    
    # 1. Standard tailwind shades: text-pink-500, etc.
    pattern1 = r'\b(text|bg|border|ring|from|to|via|outline|shadow|divide|fill|stroke)-(' + '|'.join(color_map.keys()) + r')-(?:[1-9]00|50)(\/(?:[0-9]+|\[[^\]]+\]))?\b'
    
    def replacer1(match):
        prefix = match.group(1)
        color = match.group(2)
        opacity = match.group(3) or ''
        mapped_color = color_map.get(color, color)
        return f"{prefix}-{mapped_color}{opacity}"

    content = re.sub(pattern1, replacer1, content)
    
    # 2. Custom classes without shade (neon-pink, holo-gold)
    content = re.sub(r'\b(text|bg|border|ring|from|to|via|outline|shadow|divide|fill|stroke)-neon-pink(\/(?:[0-9]+|\[[^\]]+\]))?\b', r'\1-primary\2', content)
    content = re.sub(r'\b(text|bg|border|ring|from|to|via|outline|shadow|divide|fill|stroke)-holo-gold(\/(?:[0-9]+|\[[^\]]+\]))?\b', r'\1-secondary\2', content)
    
    if content != original:
        try:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Updated: {filepath}")
        except Exception as e:
            print(f"Error writing {filepath}: {e}")

def main():
    dirs = ['src/app', 'src/components']
    for d in dirs:
        if not os.path.exists(d):
            continue
        for root, dirs_list, files in os.walk(d):
            for file in files:
                if file.endswith(('.tsx', '.ts', '.jsx', '.js')):
                    if 'ChatWidget' in file:
                        continue
                    filepath = os.path.join(root, file)
                    replace_colors_in_file(filepath)

if __name__ == '__main__':
    main()
