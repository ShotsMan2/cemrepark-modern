const fs = require('fs');
const file = 'src/app/checkout/page.tsx';
let code = fs.readFileSync(file, 'utf8');

if(!code.includes('const [currentStep, setCurrentStep]')) {
  code = code.replace(
    'const [paymentMethod, setPaymentMethod] = useState<\"card\" | \"cod\">(\"card\");',
    'const [paymentMethod, setPaymentMethod] = useState<\"card\" | \"cod\">(\"card\");\n  const [currentStep, setCurrentStep] = useState(1);'
  );
}

const progressBarRegex = /<div className=\"w-full max-w-3xl mx-auto mb-12 hidden md:block\">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/;
const newProgressBar = \
<div className=\"w-full max-w-3xl mx-auto mb-12 hidden md:block\">
  <div className=\"flex items-center justify-between relative\">
    <div className=\"absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 dark:bg-white/10 -z-10 rounded-full\"></div>
    <div className=\\\bsolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-neon-pink to-holo-gold -z-10 rounded-full transition-all duration-500\\\ style={{ width: currentStep === 1 ? '33%' : currentStep === 2 ? '66%' : '100%' }}></div>
    
    {[1, 2, 3].map((step) => (
      <div key={step} className=\"flex flex-col items-center gap-2 cursor-pointer\" onClick={() => setCurrentStep(step)}>
        <div className={\\\w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all \\\\\\}>
          {currentStep > step ? <svg className=\"w-5 h-5\" fill=\"none\" stroke=\"currentColor\" viewBox=\"0 0 24 24\"><path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth=\"2\" d=\"M5 13l4 4L19 7\"></path></svg> : step}
        </div>
        <span className={\\\	ext-[10px] uppercase tracking-widest font-bold \\\\\\}>
          {step === 1 ? 'Kisisel Bilgiler' : step === 2 ? 'Kargo & Ödeme' : 'Onay'}
        </span>
      </div>
    ))}
  </div>
</div>
\;
code = code.replace(progressBarRegex, newProgressBar);

code = code.replace(/bg-white\/40 dark:bg-zinc-900\/40 backdrop-blur-3xl p-6 md:p-10 rounded-\[2\.5rem\] shadow-2xl border border-white\/50 dark:border-white\/10/g, 'glass-panel p-6 md:p-10 rounded-[2.5rem]');
code = code.replace(/bg-white\/40 dark:bg-zinc-900\/40 backdrop-blur-3xl p-6 md:p-8 rounded-\[2\.5rem\] shadow-2xl border border-white\/50 dark:border-white\/10/g, 'glass-panel p-6 md:p-8 rounded-[2.5rem]');
code = code.replace(/bg-white\/50 dark:bg-zinc-800\/50 p-6 rounded-\[2rem\] border border-white\/20 dark:border-white\/5 shadow-inner/g, 'glass-card p-6');
code = code.replace(/bg-white\/60 dark:bg-zinc-950\/60 border/g, 'glass-panel border');

fs.writeFileSync(file, code);
