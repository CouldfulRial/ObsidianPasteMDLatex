// Test regex patterns
const quotePattern = /\\quote\{([^{}]+)\}/g;
const quoteEnvironmentPattern = /\\begin\{quote\}([\s\S]*?)\\end\{quote\}/g;

// Test cases
const test1 = '\\quote{This is a quoted passage.}';
const test2 = '\\begin{quote}\nThis is a longer quoted passage that spans\nmultiple lines in the quote environment.\nIt will preserve the structure.\n\\end{quote}';

console.log('Test 1 - inline quote:');
console.log('Input:', test1);
console.log('quotePattern matches:', quotePattern.test(test1));
quotePattern.lastIndex = 0; // reset
const match1 = quotePattern.exec(test1);
console.log('Match:', match1);

console.log('\nTest 2 - quote environment:');
console.log('Input:', test2);
console.log('quoteEnvironmentPattern matches:', quoteEnvironmentPattern.test(test2));
quoteEnvironmentPattern.lastIndex = 0; // reset
const match2 = quoteEnvironmentPattern.exec(test2);
console.log('Match:', match2);

// Test supportedPattern
const supportedPattern = /\\\([^\n]+?\\\)|\\begin\{(?:algorithm|equation\*?|align\*?|itemize|enumerate|table|tabular|center|quote)\}|\\item\b|\|[^\n]*\||\\quote\{/;
console.log('\nTest supportedPattern with inline quote:');
console.log('Matches:', supportedPattern.test(test1));

console.log('\nTest supportedPattern with quote environment:');
console.log('Matches:', supportedPattern.test(test2));
