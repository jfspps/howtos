---
title: Staging, .gitignore and diff
nav_order: 6
parent: Git
---

# Staging, .gitignore and diff

## Staging

## Adding changes to the index

The command ```git add fileName``` stages updates, placing the new file state in the index and (if needed) sets the file state to ```tracked```.

To query the state of the index, one would use ```git status```. This compares the working directory to the index. This also returns a list of files or subdirectories which have other states:

+ _ignored_: project files listed in ```.gitignore```
+ _untracked_: project files that are neither tracked or ignored.

As shown later, one can change the file state from ```tracked``` to ```untracked``` by removing the file from the Git index.

## Committing updates

Git compares the SHA value of the file in the working directory to that in the index to decide if it can commit staged updates. Note that Git will not commit files that are not already staged.

To ensure files are staged, one would use ```git add fileName``` before ```git commit -m someMessage```. To perform both operations, one can use ```git commit -a -m someMessage```; this will stage and then commit all tracked files.

Note that if a project subdirectory contains no tracked files or ha subdirectories with tracked files, then Git will not commit updates from subject subdirectory.

## Removing files from the Git index

Git provides two mechanisms re. file removal:

+ Remove (tracked) files from the index: ```git rm --cached fileName```
+ Remove (tracked) files from the index and the working directory: ```git rm fileName```

The command ```git rm fileName``` operates on the Git index, and assumes the file (with the fileName provided) is part of the index. If not, then Git replies with an error.

Note that Git will only remove the file from the working directory if the file version is the same as the latest version in the branch. In other words, Git will not remove an older version of the file from the working directory.

If one needs to recover a deleted file (from the working directory) then this can be achieved through Git with:

```bash
git checkout HEAD -- fileName
```

## Renaming files in the repository

This follows on from adding and removing staged project files, where the user renames the file in the working directory (via the OS file manager), before removing and immediately adding the file to/from the index:

```bash
mv oldName newName
git rm oldName
git add newName
```

Note that Git does not concern itself with filename changes, and only compares the SHA of the file content to decide if it should execute ```git rm```. This is in contrast to some other version controls systems which do track filename updates; the debate about which is superior or what the final solution should be goes on.

Git provides a convenient method to rename files within the working directory:

```bash
git mv oldName newName
```

## The .gitignore file

This file lists which files or subdirectories should be ignored (not tracked). 

It typically resides in the parent working directory, and can also be found in any project subdirectory. In such cases, the _.gitignore_ file in the current directory would override any _.gitignore_ file in its parent directory (or any above that).

The table below summaries the globbing patterns.

|Globbing pattern|Matches|
|-|-|
|*.txt|.txt|
||file.txt|
||another.txt|
||dir/someFile.txt|
|fileVer?.txt|fileVer1.txt|
||fileVer2.txt|
|*.[ab]|file1.a|
||file1.b|
|some.text|some.text|
||dir/some.text|
|dir/**/text|dir/text|
||dir/subdir/text|
||dir/subdir/subdiragain/text|
|**/text|dir/text|
||subdir/text|
||text|

In some cases, it may be necessary to declare a file that should never be ignored. This can be achieved by adding an exclamation mark ```!``` at the beginning of any of the above expressions. This effectively negates whatever comes next regarding file staging.

For example, ```!dir/**/text|dir/text``` would instruct Git to _not_ ignore the file ```text``` in any subdirectory. This and all other directives can of course can be overridden by any _.gitignore_ file in a subdirectory.

## Git diff

```git diff``` compares the differences between the working directory and the index i.e. only local changes (contrast to ```git status``` which also looks for differences with origin).

Git locates changes considering treelike objects:

+ any treee object in the commit graph
+ the working directory (_working tree_)
+ the index directory

### Commands

```git diff``` - reveals dirty changes

```git diff --cached commitSHA``` - shows differences between stage changes (in the index) and the given commit

```git diff commitSHA``` - shows differences between the working directory and given commit

```git diff commit1SHA commit2SHA``` - shows differences between both commits provided

On changing a project file, Git creates a virtual tree in the index that links/references: 

- the previous commit blob
- the working directory version
- the staged update (blob) referenced by the index

Staging an update simply updates the referenced blob

### git diff of files

One can get a summary of the differences between a (dirty) project file and the previous commit. This is also covered later when comparing the differences between commits (not between files; see [here](./MergingAndDiff.md#using-git-diff)).

For example, running ```git diff filename``` generates the report in the form shown below:

```
diff --git a/fileName b/fileName
index indexedFileAbbrevContentSHA..workDirAbbrevContentSHA 100644
--- a/fileName
+++ b/fileName
@@ oldFileChangerange newFileChangeRange @@
-LineRemoved from oldFile
-AnotherLineRemoved from oldFile
+NewLineAdded to newFile
 ThisLineFoundInBothOldAndNew
```

Notes:

+ The marker ```a/FileName``` references the old file (signified by ```---``` in the log) with ```b/fileName``` referencing the new file.
+ The number 100644 is the file permissions, here showing the file is not executable (i.e. ```chmod 644```; executable files have the value 100755) 
+ The change range are usually expressed as line numbers: e.g. ```-1,5``` or ```+1,5``` meaning to start from line 1, with five lines thereafter changed. The ```+``` or ```-``` reference the aforementioned markers
+ The actual changes are listed last (in the ```diff hunk``` section
