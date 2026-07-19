import glob, re

for p in glob.glob('src/components/home/*.jsx'):
    with open(p, 'r', encoding='utf-8') as f:
        c = f.read()
    
    # Fix the missing parenthesis if it matches { args } {
    c = re.sub(r'(export default memo\(function \w+\([^{)]*)\s*\{', r'\1) {', c)
    c = re.sub(r'(export default memo\(function \w+\(.*?\))\s*\{', r'\1 {', c) # just to be safe
    c = re.sub(r'(export default memo\(function \w+\(.*?\)) \)\s*\{', r'\1 {', c)

    c = c.replace(';`nexport', ';\nexport')
    
    with open(p, 'w', encoding='utf-8') as f:
        f.write(c)
