const fs = require('fs');
const path = require('path');

const fileToFix = path.join(__dirname, '..', 'src', 'app', 'HomeClient.js');
let content = fs.readFileSync(fileToFix, 'utf8');

content = content.replace(/(?<!dark:)text-gray-300/g, "text-gray-700 dark:text-gray-300");
content = content.replace(/(?<!dark:)text-gray-400/g, "text-gray-600 dark:text-gray-400");
content = content.replace(/(?<!dark:)bg-\[#111\]/g, "bg-gray-100 dark:bg-[#111]");

// We might have some cases where it is now `dark:text-gray-700 dark:text-gray-300`. Let's be safe.
// Since the regex used negative lookbehind for `dark:`, it should only match standalone `text-gray-300`.

fs.writeFileSync(fileToFix, content);
console.log("Fixed more colors");
