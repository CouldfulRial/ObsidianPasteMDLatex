# ObsidianPasteMDLatex

Obsidian plugin that converts pasted LaTeX/list syntax into Obsidian-friendly Markdown.

## Features

- Converts inline math: `\( ... \)` -> `$ ... $`
- Converts LaTeX headings:
	- `\section{...}` -> `# ...`
	- `\subsection{...}` -> `## ...`
	- `\subsubsection{...}` -> `### ...`
- Converts LaTeX bold text:
	- `\textbf{...}` -> `**...**`
- Converts LaTeX italic text:
	- `\textit{...}` and `\emph{...}` -> `*...*`
- Converts LaTeX quote text:
	- `\quote{...}` -> `> ...`
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
- Converts LaTeX tables to Obsidian-style markdown tables:
	- `\begin{table}` with `\begin{tabular}` -> `| ... | ... |` with header separator
- Normalizes markdown pipe-format tables to include proper Obsidian header separator:
	- Detects existing markdown tables and ensures `| --- | --- |` separator row
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

Headings and text style:

```text
Input:
\section{Introduction}
\subsection{Background}
\subsubsection{Details}
This is \textbf{bold} and this is \textit{italic}. Also \emph{emphasized}.

Output:
# Introduction
## Background
### Details
This is **bold** and this is *italic*. Also *emphasized*.
```

Quote text:

```text
Input:
\quote{This is a quoted passage.}

Output:
> This is a quoted passage.
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

LaTeX table:

```text
Input:
\begin{table}
\begin{tabular}{ll}
Name & Age \\
Alice & 30 \\
Bob & 25 \\
\end{tabular}
\end{table}

Output:
| Name | Age |
| --- | --- |
| Alice | 30 |
| Bob | 25 |
```

Markdown pipe table (with auto-added separator):

```text
Input:
| Color | Hex |
| Red | #FF0000 |
| Blue | #0000FF |

Output:
| Color | Hex |
| --- | --- |
| Red | #FF0000 |
| Blue | #0000FF |
```