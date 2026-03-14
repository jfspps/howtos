---
title: Source file basics part 5
nav_order: 6
parent: LaTeX
---

# Source file basics part 5

Below is the source file (.tex) demonstrating the basics of LaTeX.

+ Document structure and layout with the ```amsart``` class
+ Adding images with ```graphicx```
+ Optional arguments with [] (see ```\includegraphics```)

```latex
\documentclass{amsart}
\usepackage{graphicx}
\graphicspath{ {./} }
\begin{document}
\title{An old problem renewed: molecular deformations}
\author{James Apps}
\address{Department of Chemistry\\
University of Somewhere\\
City\\
AB12 3CD\\
Country}
\email[James Apps]{somewhere@someplace.net}
\urladdr[James Apps]{https://jfspps.github.io/howtos}
\date{14th March 2026}
\keywords{molecular, deformation}
\begin{abstract}
We present new findings that extend the present understanding of protein configuration
\end{abstract}
\maketitle
\section{Introduction}
This article utlises the \emph{amsart} document class.
\section{The graphicx package}
Authors can insert graphics with the \texttt{graphicx} package and then call upon \textbackslash \texttt{includegraphics}. The image has been scaled to match the width of the document. It is not necessary to include the file extension.
\begin{figure}[hbt]
\centering{\includegraphics[width=\textwidth]{Castle}}
\caption{Bodiam Castle, East Sussex}\label{I:castle}
\end{figure}

As with equations, it is always recommended to set up your own \textbackslash label (here using a convention \texttt{I:} for image) after the \textbackslash caption command.

Also note for this document class that the date and keyword list appear once, on the front page.
\end{document}
```

The [source file](./examples/example_5.tex) and (included with LaTeX) the document class ```amsart```. A generated PDF can be found [here](./examples/example_5.pdf).