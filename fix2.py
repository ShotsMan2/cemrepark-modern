import glob, re

replacements = {
    'BentoBoxShowcase': 'export default memo(function BentoBoxShowcase({ discounted }) {',
    'BestSellersSection': 'export default memo(function BestSellersSection({ bestSellers, setQuickViewProduct }) {',
    'CategoryShowcase': 'export default memo(function CategoryShowcase({ categories }) {',
    'HeroSection': 'export default memo(function HeroSection({ activeBanners }) {',
    'FeaturesStrip': 'export default memo(function FeaturesStrip() {',
    'MarqueeSection': 'export default memo(function MarqueeSection() {',
    'NewsletterSignup': 'export default memo(function NewsletterSignup() {',
    'TestimonialsSection': 'export default memo(function TestimonialsSection() {',
}

for p in glob.glob('src/components/home/*.jsx'):
    with open(p, 'r', encoding='utf-8') as f:
        c = f.read()
    
    # Fix the `n
    c = c.replace(';`nexport', ';\nexport')
    
    for k, v in replacements.items():
        if k in p:
            c = re.sub(r'export default memo\(function ' + k + r'.*?\{', v, c, flags=re.DOTALL)
            break
            
    with open(p, 'w', encoding='utf-8') as f:
        f.write(c)
