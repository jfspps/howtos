---
title: The TeX system
nav_order: 2
parent: LaTeX
---

# The TeX system

TeX is the programming language (Donald Knuth) that provides the typesetting instructions. Later, a simplified version of TeX, known as _LaTeX_ (Leslie Lamport) was released.
LaTeX is markup language, like HTML and Markdown. Authors enter both the document content and _markup commands_.

## Installing LaTeX

One must install TeX, the _Computer Modern_ fonts and then LaTeX, with any LaTeX extensions (known as LaTeX _packages_). Most LaTeX installations these days do this automatically.

+ (Tex Live)[https://tug.org/texlive/]
+ (MiKTeX)[https://miktex.org/]

## A LaTeX project

A project is typically composed of:

+ Source files: extension _tex_, these contain the document content and markup commands
+ Class files: extension _cls_, these define the visual layout of all document elements and are always declared at the beginning of a source file when required
+ Auxiliary files: extension _aux_, these store e.g. cross-references and citations
+ Log files: extension _log_, these record warnings and messages from a typesetting (_document composition_) session

Authors typically update and save the source file (not the auxiliary file), then typeset the document. LaTeX will use the auxiliary file from the previous session (if it exists) and usually build a PDF. It then updates the
auxiliary file. (Consequently, any changes to referencing will not normally appear until the author typesets the document twice).
