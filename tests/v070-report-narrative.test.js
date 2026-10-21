import test from 'node:test';
import assert from 'node:assert/strict';
import { readableNarrativeTables } from '../report/v070/narrative-format.mjs';

test('two-column conclusions become readable headings while exact statistics remain unchanged',()=>{
 const conclusions=['61.0% [56.1%, 65.7%]；6项等价、22项不足。','最终批次 q<0.05；不代表超过±10pp。'];
 const input=`## 结论\n\n| 问题 | 实测结论 |\n|---|---|\n| 策略 | ${conclusions[0]} |\n| 差异 | ${conclusions[1]} |\n\n结尾。`;
 const output=readableNarrativeTables(input);
 assert.ok(output.includes('问题 / 实测结论'));assert.ok(output.includes('### 策略'));assert.ok(output.includes('### 差异'));
 for(const text of conclusions)assert.ok(output.includes(text));
 assert.ok(!output.includes('|---|'));assert.ok(output.startsWith('## 结论'));assert.ok(output.endsWith('结尾。'));
});
test('ordinary prose and unsupported multi-column tables are preserved',()=>{const input='A | B\n\n| A | B | C |\n|---|---|---|\n| 1 | 2 | 3 |';assert.equal(readableNarrativeTables(input),input);});
test('escaped cell delimiters remain text and do not split conclusions',()=>{const input='| 问题 | 结论 |\n|---|---|\n| A \\| B | 1.80、3.35、8.34 |';assert.ok(readableNarrativeTables(input).includes('### A \\| B'));assert.ok(readableNarrativeTables(input).includes('1.80、3.35、8.34'));});
