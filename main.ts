import { Editor, MarkdownView, Plugin } from "obsidian";

type ClipboardSnapshot = {
  text: string;
  capturedAt: number;
};

type ListKind = "itemize" | "enumerate";

const INTERNAL_PASTE_WINDOW_MS = 15_000;

const blockMathPattern = /\\begin\{(equation\*?|align\*?)\}\s*([\s\S]*?)\s*\\end\{\1\}/g;
const inlineMathPattern = /\\\(([^\n]+?)\\\)/g;
const supportedPattern =
  /\\\([^\n]+?\\\)|\\begin\{(?:equation\*?|align\*?|itemize|enumerate)\}|\\item\b/;
const innermostListPattern =
  /\\begin\{(itemize|enumerate)\}((?:(?!\\begin\{(?:itemize|enumerate)\}|\\end\{(?:itemize|enumerate)\})[\s\S])*)\\end\{\1\}/g;

export default class PasteMdLatexPlugin extends Plugin {
  private lastInternalClipboard: ClipboardSnapshot | null = null;

  async onload(): Promise<void> {
    this.registerDomEvent(document, "copy", () => {
      this.cacheCurrentSelection();
    });

    this.registerDomEvent(document, "cut", () => {
      this.cacheCurrentSelection();
    });

    this.registerEvent(
      this.app.workspace.on("editor-paste", (evt: ClipboardEvent, editor: Editor) => {
        this.handlePaste(evt, editor);
      })
    );
  }

  private handlePaste(evt: ClipboardEvent, editor: Editor): void {
    const plainText = evt.clipboardData?.getData("text/plain");
    if (!plainText) {
      return;
    }

    if (this.isLikelyInternalPaste(evt, plainText)) {
      return;
    }

    if (!supportedPattern.test(plainText)) {
      return;
    }

    const transformed = transformPastedText(plainText);
    if (transformed === plainText) {
      return;
    }

    evt.preventDefault();
    editor.replaceSelection(transformed);
  }

  private cacheCurrentSelection(): void {
    const markdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!markdownView) {
      return;
    }

    const selectedText = markdownView.editor.getSelection();
    if (!selectedText) {
      return;
    }

    this.lastInternalClipboard = {
      text: selectedText,
      capturedAt: Date.now(),
    };
  }

  private isLikelyInternalPaste(evt: ClipboardEvent, pastedText: string): boolean {
    const clipboardTypes = evt.clipboardData?.types
      ? Array.from(evt.clipboardData.types).map((value) => value.toLowerCase())
      : [];

    if (clipboardTypes.some((value) => value.includes("obsidian"))) {
      return true;
    }

    if (!this.lastInternalClipboard) {
      return false;
    }

    if (Date.now() - this.lastInternalClipboard.capturedAt > INTERNAL_PASTE_WINDOW_MS) {
      this.lastInternalClipboard = null;
      return false;
    }

    return this.lastInternalClipboard.text === pastedText;
  }
}

function transformPastedText(input: string): string {
  let transformed = normalizeLineEndings(input);
  transformed = convertBlockMathEnvironments(transformed);
  transformed = convertLatexLists(transformed);
  transformed = convertInlineMathDelimiters(transformed);
  transformed = normalizeSpacing(transformed);
  return transformed;
}

function normalizeLineEndings(text: string): string {
  return text.replace(/\r\n?/g, "\n");
}

function convertInlineMathDelimiters(input: string): string {
  return input.replace(inlineMathPattern, (_match, body: string) => {
    const trimmedBody = body.trim();
    return trimmedBody.length > 0 ? `$${trimmedBody}$` : "$$";
  });
}

function convertBlockMathEnvironments(input: string): string {
  return input.replace(
    blockMathPattern,
    (_match, envName: string, content: string): string => {
      const body = sanitizeBlockMathContent(envName, content).trim();
      if (body.length === 0) {
        return "$$\n$$";
      }
      return `$$\n${body}\n$$`;
    }
  );
}

function sanitizeBlockMathContent(envName: string, content: string): string {
  let sanitized = content;

  if (envName.startsWith("equation")) {
    sanitized = sanitized.replace(/\\label\s*\{[^{}]*\}\s*/g, "");
  }

  if (envName.startsWith("align")) {
    sanitized = removeUnescapedAmpersands(sanitized);
  }

  return sanitized;
}

function removeUnescapedAmpersands(input: string): string {
  let output = "";

  for (let i = 0; i < input.length; i += 1) {
    const current = input[i];

    if (current !== "&") {
      output += current;
      continue;
    }

    const isEscaped = i > 0 && input[i - 1] === "\\";
    if (!isEscaped) {
      continue;
    }

    output += current;
  }

  return output;
}

function convertLatexLists(input: string): string {
  let transformed = input;
  let hasChanges = true;

  while (hasChanges) {
    hasChanges = false;
    transformed = transformed.replace(
      innermostListPattern,
      (_match, kind: ListKind, body: string): string => {
        hasChanges = true;
        return convertSingleList(kind, body);
      }
    );
  }

  return transformed;
}

function convertSingleList(kind: ListKind, listBody: string): string {
  const itemPattern = /\\item(?:\s*\[[^\]]*\])?/g;
  const matches = Array.from(listBody.matchAll(itemPattern));

  if (matches.length === 0) {
    return listBody.trim();
  }

  const preamble = listBody.slice(0, matches[0].index ?? 0).trim();
  const outputLines: string[] = [];

  if (preamble.length > 0) {
    outputLines.push(preamble);
  }

  for (let index = 0; index < matches.length; index += 1) {
    const current = matches[index];
    const next = matches[index + 1];

    const start = (current.index ?? 0) + current[0].length;
    const end = next?.index ?? listBody.length;
    const itemContent = listBody.slice(start, end);

    const marker = kind === "enumerate" ? `${index + 1}.` : "-";
    outputLines.push(formatMarkdownItem(marker, itemContent));
  }

  return outputLines.join("\n");
}

function formatMarkdownItem(marker: string, content: string): string {
  const normalized = content
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.trimEnd());

  const firstNonEmpty = normalized.findIndex((line) => line.trim().length > 0);
  if (firstNonEmpty === -1) {
    return marker;
  }

  const compact = normalized.slice(firstNonEmpty);
  const firstLine = compact[0].trim();
  const remainder = compact.slice(1);

  if (remainder.length === 0) {
    return `${marker} ${firstLine}`;
  }

  const formattedRemainder = remainder
    .map((line) => (line.trim().length > 0 ? `  ${line}` : ""))
    .join("\n");

  return `${marker} ${firstLine}\n${formattedRemainder}`;
}

function normalizeSpacing(input: string): string {
  return input
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n");
}
