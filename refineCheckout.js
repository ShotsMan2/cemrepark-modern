const fs = require("fs");

let content = fs.readFileSync("src/app/checkout/page.tsx", "utf-8");

// 1. Make all steps permanently visible
content = content.replace(/\{activeStep === 1 && \(/g, "{true && (");
content = content.replace(/\{activeStep === 2 && \(/g, "{true && (");
content = content.replace(/\{activeStep === 3 && \(/g, "{true && (");

// 2. Hide the "Next" buttons instead of removing them, to avoid breaking anything else
content = content.replace(
  /className="bg-foreground text-background([^>]+>[\s\n]*Kargo Seçimine Geç)/,
  'className="hidden bg-foreground text-background$1'
);
content = content.replace(
  /className="bg-foreground text-background([^>]+>[\s\n]*Ödemeye Geç)/,
  'className="hidden bg-foreground text-background$1'
);

// 3. Remove onClick from accordion headers to disable collapsing
content = content.replace(/onClick=\{\(\) => setActiveStep\([123]\)\}/g, "");

// 4. Always use the active class logic for the cards
content = content.replace(
  /className=\{`glass-card rounded-\[2rem\] border transition-all duration-500 [^`]+`\}/g,
  'className="glass-card rounded-[2rem] border transition-all duration-500 border-primary shadow-[0_0_20px_var(--color-primary)] overflow-hidden relative backdrop-blur-xl mb-6"'
);

// 5. Fix the Chevron icons (make them point down constantly, removing rotate-180 logic)
content = content.replace(
  /<ChevronDown className=\{`w-5 h-5 transition-transform duration-500 [^`]+`\} \/>/g,
  '<ChevronDown className="w-5 h-5 transition-transform duration-500 rotate-180 text-primary" />'
);

// 6. Fix header circle numbers (always highlighted)
content = content.replace(
  /className=\{`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors \$\{activeStep === [123] [^`]+`\}/g,
  'className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors bg-primary text-background"'
);

content = content.replace(/\{activeStep > 1 \? <Check className="w-5 h-5"\/> : '1'\}/g, '"1"');
content = content.replace(/\{activeStep > 2 \? <Check className="w-5 h-5"\/> : '2'\}/g, '"2"');

fs.writeFileSync("src/app/checkout/page.tsx", content, "utf-8");
console.log("Safe replacement complete.");
