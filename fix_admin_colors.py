import os
import re

def replace_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # text-white -> text-foreground
    content = re.sub(r'\btext-white\b', 'text-foreground', content)
    # text-gray-500 -> text-foreground/60
    content = re.sub(r'\btext-gray-500\b', 'text-foreground/60', content)
    # text-gray-400 -> text-foreground/50
    content = re.sub(r'\btext-gray-400\b', 'text-foreground/50', content)
    # text-gray-300 -> text-foreground/70
    content = re.sub(r'\btext-gray-300\b', 'text-foreground/70', content)
    # bg-white/5 -> bg-foreground/5
    content = re.sub(r'\bbg-white/5\b', 'bg-foreground/5', content)
    # bg-white/10 -> bg-foreground/10
    content = re.sub(r'\bbg-white/10\b', 'bg-foreground/10', content)
    # bg-white/20 -> bg-foreground/20
    content = re.sub(r'\bbg-white/20\b', 'bg-foreground/20', content)
    # border-white/5 -> border-glass-border
    content = re.sub(r'\bborder-white/5\b', 'border-glass-border', content)
    # border-white/10 -> border-glass-border
    content = re.sub(r'\bborder-white/10\b', 'border-glass-border', content)
    
    # bg-black/80 -> bg-background/80
    content = re.sub(r'\bbg-black/80\b', 'bg-background/80', content)
    # bg-black/50 -> bg-background/50
    content = re.sub(r'\bbg-black/50\b', 'bg-background/50', content)
    # text-black -> text-background
    # content = re.sub(r'\btext-black\b', 'text-background', content)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

def main():
    admin_dir = 'src/app/admin'
    for root, dirs, files in os.walk(admin_dir):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                replace_in_file(os.path.join(root, file))

if __name__ == '__main__':
    main()
