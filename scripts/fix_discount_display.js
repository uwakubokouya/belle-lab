const fs = require('fs');
let c = fs.readFileSync('src/app/reserve/[castId]/page.tsx', 'utf-8');

// 1. STEP 2 (Options List) Price Display
const tPrice1 = `{course.price > 0 ? \`¥\${course.price.toLocaleString()}\` : course.price < 0 ? \`-¥\${Math.abs(course.price).toLocaleString()}\` : '無料'}`;
const rPrice1 = `{course.price > 0 ? (type === 'DISCOUNT' ? \`-¥\${course.price.toLocaleString()}\` : \`¥\${course.price.toLocaleString()}\`) : course.price < 0 ? \`-¥\${Math.abs(course.price).toLocaleString()}\` : '無料'}`;
let newC = c.split(tPrice1).join(rPrice1);
if (newC === c) {
    newC = c.split(tPrice1.replace(/\n/g, '\r\n')).join(rPrice1.replace(/\n/g, '\r\n'));
}
c = newC;

// 2. STEP 4 (Confirm) Discount Price Display
const tPrice2 = `{selectedDiscount.price < 0 ? \`-¥\${Math.abs(selectedDiscount.price).toLocaleString()}\` : '無料'}`;
const rPrice2 = `{selectedDiscount.price !== 0 ? \`-¥\${Math.abs(selectedDiscount.price).toLocaleString()}\` : '無料'}`;
newC = c.split(tPrice2).join(rPrice2);
if (newC === c) {
    newC = c.split(tPrice2.replace(/\n/g, '\r\n')).join(rPrice2.replace(/\n/g, '\r\n'));
}
c = newC;

// 3. STEP 4 (Confirm) Total Calculation
const tTotal = `const dPrice = selectedDiscount?.price || 0;\n                                        const total = cPrice + nPrice + oPrice + dPrice;`;
const rTotal = `const dPrice = selectedDiscount?.price ? Math.abs(selectedDiscount.price) * -1 : 0;\n                                        const total = cPrice + nPrice + oPrice + dPrice;`;
newC = c.split(tTotal).join(rTotal);
if (newC === c) {
    newC = c.split(tTotal.replace(/\n/g, '\r\n')).join(rTotal.replace(/\n/g, '\r\n'));
}
// fallback if spaces differ:
if (newC === c) {
    newC = c.replace(/const dPrice = selectedDiscount\?\.price \|\| 0;\s*const total = cPrice \+ nPrice \+ oPrice \+ dPrice;/, 
        "const dPrice = selectedDiscount?.price ? Math.abs(selectedDiscount.price) * -1 : 0;\n                                        const total = cPrice + nPrice + oPrice + dPrice;");
}
c = newC;

fs.writeFileSync('src/app/reserve/[castId]/page.tsx', c);
console.log('Fixed discount displays and total calculation');
