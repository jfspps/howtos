---
title: Source file basics part 3
nav_order: 5
parent: LaTeX
---

# Source file basics part 3

Below is the source file (.tex) demonstrating the basics of LaTeX.

+ Arithmetic
+ Subscripts and superscripts
+ Fractions
+ Binomial coefficients
+ Congruences
+ Delimiters
+ Ellipses
+ Integrals
+ Accents
+ Matrices
+ n-th roots
+ Sums and products

```latex
\documentclass{sample}
\begin{document}
Moving onto formulas in more detail, the operators are typed in the normal way: $a + b / c -d$. The spaces between operands in a math environment are ignored, and only used here to aid readability.

The multiplication operator can take the form of \textbackslash cdot or \textbackslash times, as shown: $a \cdot b \text{ does not equal } a \times b$.

As demonstrated previously, fractions are handled with \textbackslash frac\{num\}\{den\}, for example:
\[
\frac{numerator}{denominator}
\]

Subscripts are handled with underscores e.g. $C_{2}H_{5}OH$. Superscripts are handled with carets e.g. $Mg^{2+}$. While not mandatory as single character subscripts and superscripts, both need be typed with curly braces \{ and \} as arguments for more complicated expressions.

Binomial coefficients can be typset with \textbackslash binom as either inline or displayed formulas. For example, $\binom{c}{d + r}$.

Congruences can be typset with \textbackslash equiv as:
\[
a \equiv v \pmod{\theta}
\]
\[
a \equiv v \pod{\theta}
\]

Delimiters e.g. [ ] ( ) appear as normal for inline formulas and can be proportioned based on what they delimit with \textbackslash left and \textbackslash right:
\[
\left(\frac{1 + x}{2 - y^2} \right)^3
\]

in other words, the expression \texttt{\textbackslash left (} intructs LaTeX to expand the left-hand bracket that follows it (the lone \texttt{(} entered). This scaling is matched with the command  \texttt{\textbackslash right )}.

Ellipses can typset with \textbackslash ldots, printed on the line as $a\ldots b$ or centered $F(x_1 \cdots x_n)$ with \textbackslash cdots.

Integrals are typset with \textbackslash int, with the aforementioned subscript and superscript commands denoting the lower and upper limits respectively. 
\[
\int_0^{\pi} \sin x \, dx = 2
\]

The command \texttt{\textbackslash ,} is used to introduce a space (between \texttt{x} and \texttt{dx}) in the math environment.

Accents can take the form of a bar, hat, tilde or vector:
\[
\bar{a} from \text{\textbackslash bar\{a\}}
\]
\[
\hat{a} from \text{\textbackslash hat\{a\}}
\]
\[
\tilde{a} from \text{\textbackslash tilde\{a\}}
\]
\[
\vec{a} from \text{\textbackslash vec\{a\}}
\]

Matrices can appear inline or displayed, and are typset with \textbackslash matrix as begin and end blocks, with the ampersand \& as the element delimiter and two backslashes as the row delimiter, as shown below:
\[
\mathbf{B} =
\begin{matrix}
a + b + d & hmn\\
qr & f \times d
\end{matrix}
\]

One can also introduce stretched parentheses (with \textbackslash pmatrix), with bars (with \textbackslash vmatrix) and with square brackets (with \textbackslash bmatrix) just as \textbackslash left and \textbackslash right do:
\[
\mathbf{B} =
\begin{pmatrix}
a + b + d & hmn\\
qr & f \times d
\end{pmatrix}
\begin{vmatrix}
3\\
4
\end{vmatrix}
\begin{bmatrix}
\alpha\\
\beta
\end{bmatrix}
\]

Other operators such as sine $\sin x$ were introduced above. One can also typset products and sums with the subscript and superscript commands as follows:
\[
\sum_{i=1}^{n} x_{i}^2 \,\text{and}\, \prod_{i=1}^{n} x_{i}^2
\]

\textit{n}-th roots are typset with \textbackslash sqrt[n]\{operand\}, for example $\sqrt[3]{5}$. The \textit{n}-th parameter is only used if a square root is not required.
\end{document}
```

The [source file](./examples/example_3.tex) and (required) [document class file](./examples/sample.cls) are included. A generated PDF can be found [here](./examples/example_3.pdf).