---
title: Source file basics part 7
nav_order: 8
parent: LaTeX
---

# Source file basics part 7

Below is the source file (.tex) demonstrating the basics of LaTeX.

+ European accents
+ Text symbols

```latex
\documentclass{sample}
\usepackage{booktabs}
\begin{document}
\section{Dates}
Authors can access the date and time and then typset them in a document with \textbackslash the.

For example, today's date is \the\day, the current month is \the\month\ and the current year is \the\year. Note that in the source, authors will probably need to add a space after the command.

At the time of typesetting, the time (minutes since midnight) was \the\time. 

Another way to get the date is with \textbackslash today, for example \today.

\section{Accents and symbols}
European accents (see Table \ref{Ta: euroaccents}) and other symbols are available via commands (see the source for the type). Most the examples use the letter \texttt{o} but can be applied to others.

\begin{table}
\begin{center}
	\begin{tabular}{llc}
	\toprule
	Name & Typeset \\
	\midrule
	acute & \'{o}\\
	breve & \u{o}\\
	caron\textbackslash ha\v{c}ek & \v{o}\\
	cedilla & \c{o}\\
	curcumflex & \^{o}\\
	dieresis/umlaut & \"{o}\\
	dotless i & \i\\
	dotless j & \j\\
	double acute & \H{o}\\
	grave & \`{o}\\
	macron & \={o}\\
	overdot & \.{o}\\
	ring & \r{o}\\
	tie & \t{oo}\\
	tilde & \~{o}\\
	underdot & \d{o}\\
	underbar & \b{o}\\
	\bottomrule
	\end{tabular}
	\caption{European accents (see source for type or command)}
	\label{Ta:euroaccents}
\end{center}
\end{table}

Other European characters based on specific symbols (not universal as shown in Table \ref{Ta:euroaccents}) are given in Table \ref{Ta:euroaccents2}.
\begin{table}
\begin{center}
	\begin{tabular}{llc}
	\toprule
	Name & Typeset & Typeset \\
	\midrule
	a-ring & \aa & \AA\\
	aesc & \ae & \AE\\
	ethel & \oe & \OE\\
	eszett & \ss & \SS\\
	inverted question mark & ?`\\
	inverted exclamation mark & !`\\
	slashed L & \l & \L\\
	slashed O & \o & \O\\
	\bottomrule
	\end{tabular}
	\caption{More European accents (see source for type or command)}
	\label{Ta:euroaccents2}
\end{center}
\end{table}

Finally, Table \ref{ta:symbols} shows the commands reuqired to typeset text symbols.
\ref{Ta:euroaccents2}.
\begin{table}
\begin{center}
	\begin{tabular}{llc}
	\toprule
	Name & Typeset\\
	\midrule
	ampersand & \\
	asterisk bullet & \textasteriskcentered\\
	backslash & \textbackslash\\
	bar (caesura) & \textbar\\
	brace left & \{\\
	brace right & \}\\
	bullet & \textbullet\\
	circled (a) & \textcircled{a}\\
	circumflex & \textasciicircum\\
	copyright & \copyright\\
	dagger & \dag\\
	double dagger (diesis) & \ddag\\
	dollar& \$\\
	double quotation left & ``\\
	double quotation right & ''\\
	em dash & ---\\
	en dash & --\\
	exclamation down & \textexclamdown\\
	greater than & \textgreater\\
	less than & \textless\\
	lowline & \_\\
	midpoint & \textperiodcentered\\
	octothorp & \#\\
	percent & \%\\
	pilcrow (paragraph) & \P\\
	question down & \textquestiondown\\
	registered trademark & \textregistered\\
	section & \S\\
	\bottomrule
	\end{tabular}
	\caption{More text symbols (see source for type or command)}
	\label{Ta:symbols}
\end{center}
\end{table}
\end{document}
```

The [source file](./examples/example_7.tex) and (required) [document class file](./examples/sample.cls) are included. A generated PDF can be found [here](./examples/example_7.pdf).