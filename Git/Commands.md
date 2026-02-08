---
title: Common Git commands
nav_order: 3
parent: Git
---

# Common Git commands

As mentioned, these commands assume the point of view of the HEAD pointer. There are far more commands available, as documented [here](https://git-scm.com/docs).

## Key commands

To initialise a new local repository:

```bash
git init
```

To add (stage) all files:

```bash
git add .
```

To map the current local repo to a remote repo:

```bash
git remote add origin referenceToUpstream
```

To commit changes (after the current HEAD pointer) with a message:

```bash
git commit -m 'insert your commit message here'
```

To push commits upstream, to the master branch use:

```bash
git push
```

To push commits upstream to a non-master branch, use:

```bash
git push -u origin branchName
```

## Status updates

To get the status of the current repo:

```bash
git status
```

To get more specifics about which lines of code have changed (+ will mean new lines added, - will mean existing lines that were removed):

```bash
git diff
```

If you are working on a non-master branch and want to compare to the master (or any other by valid name) branch, use:

```bash
git diff master
```

## Branch related commands

To get the names of the branches on your local machine:

```bash
git branch
```

To check out an existing branch:

```bash
git checkout existingBranch
```

To create a new branch and then check out that branch:

```bash
git checkout -b newBranch
```

## Merging, fetching and pulling

To merge the last commit of the named branch (below as "branchName") to that pointed to be HEAD:

```bash
git merge branchName
```

To undo a merge:

```bash
git merge --abort
```

To retrieve the status of updates available on the upstream (code is downloaded but not made part of the local repo):

```bash
git fetch origin branchName
```

To compare the differences between the most recent fetch and an upstream branch, use:

```bash
git diff origin/remoteBranchName
```

To pull changes (this is the same as fetch + merge) from a specific upstream branch (defaults to master otherwise), use:

```bash
git pull origin branchName
```

## GitIgnore, stashing, reverting and resetting

GitIgnore files list other files that are neither staged nor committed. To add a file or directory to the ```.gitignore``` file:

```bash
git rm --cached fileOrDirectoryName
```

The parameter ```--cached``` instructs Git to leave the file on the local system and only add the reference to gitignore.

To stash the current updates:

```bash
git stash
```

To stash with a message:

```bash
git stash save 'insert your message here'
```

To list all stashed work:

```bash
git stash list
```

To get the first element (files stashed last):

```bash
git stash pop
```

To select a specific n-th stashed element by the index:

```bash
git stash apply stash@{n}
```

To reset commits up to a given previous commit:

```bash
git reset --hard previousCommitHash
```

To revert up to a given previous commit:

```bash
git revert previousCommitHash
```