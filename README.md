# ObsidianPasteMDLatex

Obsidian plugin that converts pasted LaTeX/list syntax into Obsidian-friendly Markdown.

## Features

- Converts inline math: `\( ... \)` -> `$ ... $`
- Converts block math environments to fenced math blocks:
	- `\begin{equation} ... \end{equation}` -> `$$ ... $$`
	- `\begin{equation*} ... \end{equation*}` -> `$$ ... $$`
	- `\begin{align} ... \end{align}` -> `$$ ... $$`
	- `\begin{align*} ... \end{align*}` -> `$$ ... $$`
- Converts LaTeX itemized lists to Markdown bullets:
	- `\begin{itemize}` / `\item` / `\end{itemize}` -> `- ...`
- Converts LaTeX enumerated lists to Markdown numbered lists:
	- `\begin{enumerate}` / `\item` / `\end{enumerate}` -> `1. ...`
- Handles nested `itemize` / `enumerate` structures with indentation.
- Leaves paste behavior untouched when there are no supported patterns.

## Development Setup

1. Install dependencies:

```bash
npm install
```

2. Build plugin:

```bash
npm run build
```

3. Copy the generated files into your Obsidian vault plugin folder:
	 - `manifest.json`
	 - `main.js`
	 - `styles.css`

Typical path:

```bash
<your-vault>/.obsidian/plugins/obsidian-paste-md-latex/
```

4. In Obsidian, enable the plugin from Community Plugins.

## Behavior

- The plugin listens to editor paste events.
- It targets plain-text pasted content that matches supported LaTeX/list patterns.
- It attempts to avoid transforming likely internal Obsidian copy/cut content.

## Examples

Inline equation:

```text
Input:  The solution is \( x^2 + y^2 = 1 \).
Output: The solution is $x^2 + y^2 = 1$.
```

Block equation:

```text
Input:
\begin{equation}
E = mc^2
\end{equation}

Output:
$$
E = mc^2
$$
```

Bullet list:

```text
Input:
\begin{itemize}
\item Alpha
\item Beta
\end{itemize}

Output:
- Alpha
- Beta
```

Numbered list:

```text
Input:
\begin{enumerate}
\item First
\item Second
\end{enumerate}

Output:
1. First
2. Second
```