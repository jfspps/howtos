---
title: Source file basics part 2
nav_order: 4
parent: LaTeX
---

# Source file basics part 1

Below is the source file (.tex) demonstrating the basics of LaTeX.

+ Formualas
+ How to typset < > and |

```latex
\documentclass{sample}
\begin{document}
In some cases, it may be necesary to enter text with \textbackslash text \{someText\} in order to build the correct layout. This is demonstrated in the next line.

Inline formulas are enclosed with \textbackslash \$, for example typing \textbackslash \$2 \textless\textbar\text{x}\textbar\textgreater y\textbackslash \$ yields $2 < |x| > y$.
\end{document}
```

The [source file](./examples/example_2.tex) and (required) [document class file](./examples/sample.cls) are included. A generated PDF can be found [here](./examples/example_2.pdf).