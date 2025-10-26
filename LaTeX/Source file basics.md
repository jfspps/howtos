---
title: Source file basics
nav_order: 3
parent: LaTeX
---

# Source file basics

## Whitespace

Like other markup languages, LaTex in many instances ignores whitespace. A blank space, a tab and a single carriage are the same to LaTeX. 

A double carriage represents a blank line. This can also be achieved with the command:

```latex
\par
```

_Multiple_ blank lines represent the end of a paragraph.

## Document layout

```latex
% Some comment
\documentclass{classfilecls}
% Other LaTeX packages can be declared at this point and then commands defined therein declared in this source file

\begin{document}

\end{document}
```

## Commonly used commands

### Alignment

```latex
\begin{flushright}
This text right-aligned
\end{flushright}

\begin{center}
This text is centered
\end{center}
```

### Text styling

This also introduces commands with arguments.

```latex
\emph{this text is a parameter/argument of emph, and is italicised}

\textbf{this text is in boldface}

\texttt{this text is in typewriter style text}
```

### Punctuation marks and accents

```latex
% use two apostrophes for double quotes
''The ships is sinking''

% two hyphens is used for number ranges, producing an en dash
2--3

% three hyphens can be used for a longer dash, known as an em dash
this text is paused---until something happens

% accented letters, e.g. accented "a"
\"{a}
```

### Hyphenating long words

This sometimes causes problems with typesetting lines with long words, and is recorded as an error.

```latex
good luck getting this to typeset aaaabbbcccdddeeefffggghhhiiijjjkkklllmmmnnnooopppqqqrrssstttuuuvvvwwwxxxyyyzzzz
```

In such cases, either reword the line or instruct LaTeX where it can hyphenate long words with the hyphen command ```\-```.

```latex
this should typeset without issue now aaaa\-bbbcccddd\-eeefffggg\-hhhiii\-jjjkkk\-lllmmm\-nnnooo\-pppqqq\-rrsss\-tttuuu\-vvvwww\-xxxyyyzzzz
```

### Today's date

Display today's:

```latex
\today
```

### Line numbers


```latex
\documentclass{classfilecls}
\usepackage{lineno}
\linenumbers
\begin{document}
Each
line
will
be
numbered
\end{document}
```
