const quotePattern = /\\quote\{([^{}]+)\}/g;
const quoteEnvironmentPattern = /\\begin\{quote\}([\s\S]*?)\\end\{quote\}/g;

function convertQuoteText(input) {
  console.log('Input to convertQuoteText:', input);
  
  // First handle \begin{quote}...\end{quote} environments
  let transformed = input.replace(
    quoteEnvironmentPattern,
    (_match, content) => {
      console.log('Quote env match:', _match);
      console.log('Content:', content);
      const quotedText = content.trim();
      if (quotedText.length === 0) {
        return "\n>\n";
      }
      const result = "\n" + quotedText
        .split("\n")
        .map((line) => `> ${line.trim()}`)
        .join("\n") + "\n";
      console.log('Quote env result:', result);
      return result;
    }
  );

  console.log('After quote env processing:', transformed);

  // Then handle \quote{...} commands
  transformed = transformed.replace(quotePattern, (match, text, offset, wholeText) => {
    console.log('Quote match:', match);
    console.log('Text:', text);
    const quotedText = text.trim();
    if (quotedText.length === 0) {
      return "\n>\n";
    }

    const prefix = offset > 0 && wholeText[offset - 1] !== "\n" ? "\n" : "";
    const suffixOffset = offset + match.length;
    const suffix = suffixOffset < wholeText.length && wholeText[suffixOffset] !== "\n" ? "\n" : "";

    const result = `${prefix}${quotedText
      .split("\n")
      .map((line) => `> ${line.trim()}`)
      .join("\n")}${suffix}`;
    console.log('Quote result:', result);
    return result;
  });

  console.log('Final output:', transformed);
  return transformed;
}

const test1 = '\\quote{This is a quoted passage.}';
console.log('=== TEST 1: Inline quote ===');
const out1 = convertQuoteText(test1);
console.log('Output:\n', out1);

console.log('\n=== TEST 2: Quote environment ===');
const test2 = '\\begin{quote}\nThis is a longer quoted passage\n\\end{quote}';
const out2 = convertQuoteText(test2);
console.log('Output:\n', out2);
