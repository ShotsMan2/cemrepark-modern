import glob

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
        lines = f.readlines()
    
    out = []
    skip = False
    for i, l in enumerate(lines):
        if 'export default memo(function' in l:
            # find the component name
            for k, v in replacements.items():
                if k in l:
                    out.append(v + '\n')
                    skip = True
                    break
        elif skip:
            if 'return (' in l:
                skip = False
                out.append(l)
        else:
            out.append(l)
            
    with open(p, 'w', encoding='utf-8') as f:
        f.writelines(out)
