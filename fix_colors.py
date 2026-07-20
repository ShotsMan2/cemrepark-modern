import os
import re

def replace_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        original_content = content

    # Storefront color upgrades
    content = re.sub(r'\btext-gray-900 dark:text-white\b', 'text-foreground', content)
    content = re.sub(r'\btext-gray-900 dark:text-gray-100\b', 'text-foreground', content)
    content = re.sub(r'\btext-gray-800 dark:text-white\b', 'text-foreground', content)
    content = re.sub(r'\btext-gray-800 dark:text-gray-200\b', 'text-foreground/90', content)
    content = re.sub(r'\btext-gray-700 dark:text-gray-300\b', 'text-foreground/80', content)
    content = re.sub(r'\btext-gray-600 dark:text-gray-400\b', 'text-foreground/70', content)
    content = re.sub(r'\btext-gray-500 dark:text-gray-400\b', 'text-foreground/60', content)
    content = re.sub(r'\btext-gray-500 dark:text-gray-500\b', 'text-foreground/50', content)
    
    content = re.sub(r'\bbg-white dark:bg-\[#120a10\]\b', 'bg-background', content)
    content = re.sub(r'\bbg-white dark:bg-black\b', 'bg-background', content)
    content = re.sub(r'\bbg-white dark:bg-gray-900\b', 'bg-background', content)
    content = re.sub(r'\bbg-gray-50 dark:bg-gray-900\b', 'bg-foreground/5', content)
    content = re.sub(r'\bbg-gray-100 dark:bg-gray-800\b', 'bg-foreground/10', content)
    content = re.sub(r'\bbg-gray-200 dark:bg-gray-700\b', 'bg-foreground/20', content)

    content = re.sub(r'\bborder-gray-200 dark:border-white/5\b', 'border-glass-border', content)
    content = re.sub(r'\bborder-gray-200 dark:border-white/10\b', 'border-glass-border', content)
    content = re.sub(r'\bborder-gray-300 dark:border-gray-700\b', 'border-glass-border', content)
    content = re.sub(r'\bborder-gray-300 dark:border-gray-800\b', 'border-glass-border', content)
    content = re.sub(r'\bbg-white/90 dark:bg-black/80\b', 'glass-panel', content)
    content = re.sub(r'\bbg-white/95 dark:bg-black/95\b', 'glass-panel', content)

    # Replaces admin leftovers:
    content = re.sub(r'\btext-white\b', 'text-foreground', content)
    content = re.sub(r'\bbg-black/80\b', 'bg-background/80', content)

    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

def main():
    dirs_to_process = ['src/app', 'src/components']
    for d in dirs_to_process:
        for root, dirs, files in os.walk(d):
            for file in files:
                if file.endswith('.tsx') or file.endswith('.ts'):
                    # Do not modify ChatWidget
                    if 'ChatWidget' in file:
                        continue
                    replace_in_file(os.path.join(root, file))

if __name__ == '__main__':
    main()
