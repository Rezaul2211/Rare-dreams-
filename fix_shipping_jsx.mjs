import fs from 'fs';
let code = fs.readFileSync('src/pages/Checkout.tsx', 'utf-8');

code = code.replace(
  "\`৳ \${shipping.toFixed(0)}\`",
  "{\`৳ \${shipping.toFixed(0)}\`}"
);

fs.writeFileSync('src/pages/Checkout.tsx', code);
console.log("JSX fixed");
