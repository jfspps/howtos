# Source control with Git #

Source control is the practice of tracking changes to source code. Git and [Apache Subversion](https://subversion.apache.org/) (or just "SVN") represent the more popular source control management (SCM) tools in use. Older tools such as [CVS](https://savannah.nongnu.org/projects/cvs/) (Concurrent Version Control Systems), are still available though largely superseded.

This outline focuses on the core Git commands, which should be applicable to the range of remote repositories available, for example, GitHub, [GitLab](https://gitlab.com/) and [BitBucket](https://bitbucket.org/), as well as predominantly self-hosting options such as [Gogs](https://gogs.io/) and [Gitea](https://docs.gitea.io/en-us/).

## Basic ideas ##

Code changes start somewhere and can then ```branch``` off to focus on specific updates, changes or developments, depending on the project. In some cases the work carried out on a given branch may be abandoned, whereas in others they are merged with the ```master``` branch. During a ```merge```, the line of code with the latest timestamp is committed to the repository, though there are cases when merge conflicts arise and must be handled manually.

Unfortunately, the name of the developer who made changes is referred to in Git as ```blame```.

Each node along a branch is denoted by a hash, a ```commit hash``` or more casually a ```commit```. The changes to code are performed by first adding all files to a list that require uploading to the repo. This step is also known as ```staging```. The developer then commits the changes and builds a new hash. Quite often, this takes place on a local machine and therefore it is necessary to ```push``` the hash to a remote repository (referred to as ```upstream```). 

Any developer with access to a repository can ```pull``` the latest branch (by default the master branch) to their local repository. A developer can also query for upstream updates (without downloading the updates) by ```fetching``` from the repository.

## The HEAD pointer ##

The HEAD pointer represents the current reference point along a given branch. One can "check out" an existing branch and this by default, will set the HEAD pointer to the latest hash along the existing branch. Git commands generally assume the point of view of the HEAD pointer.

A given developer can only have one active branch at a time. Before checking out other branches, developer would need to commit changes. There are cases where this is not desirable (changes may be expected to pass tests before being committed) while also noting that the current changes should not simply be discarded. In these circumstances, Git provides a way to ```stash``` changes (more than once) and then return to them later.

## Resetting and reverting commits ##

Git can ```reset``` changes to a given commit. This means Git removes (deletes) all commits between the current one up to the given commit. A somewhat less destructive method is available by instead directing Git to ```revert``` on a branch. Instead of deleting prior commits, this instruction "re-commits" the previous hashes, in the order they appear up to the given commit. 

In short, for a branch ```A -> B -> C```, the a directive to reset to hash A would result in a branch ```A``` whereas a directive to revert to has A would lead to ```A -> B -> C -> B -> A```.

## Git commands ##

As mentioned, these commands assume the point of view of the HEAD pointer. There are far more commands available, as documented [here](https://git-scm.com/docs).

### Key commands ###

To initialise a new local repository:

```git
git init
```

To add (stage) all files:

```git
git add .
```

To map the current local repo to a remote repo:

```git
git remote add origin referenceToUpstream
```

To commit changes (after the current HEAD pointer) with a message:

```git
git commit -m 'insert your commit message here'
```

To push commits upstream, to the master branch use:

```git
git push
```

To push commits upstream to a non-master branch, use:

```git
git push -u origin branchName
```

## Status updates ###

To get the status of the current repo:

```git
git status
```

To get more specifics about which lines of code have changed (+ will mean new lines added, - will mean existing lines that were removed):

```git
git diff
```

If you are working on a non-master branch and want to compare to the master (or any other by valid name) branch, use:

```git
git diff master
```

### Branch related commands ###

To get the names of the branches on your local machine:

```git
git branch
```

To check out an existing branch:

```git
git checkout existingBranch
```

To create a new branch and then check out that branch:

```git
git checkout -b newBranch
```

### Merging, fetching and pulling ###

To merge the last commit of the named branch (below as "branchName") to that pointed to be HEAD:

```git
git merge branchName
```

To undo a merge:

```git
git merge --abort
```

To retrieve the status of updates available on the upstream (code is downloaded but not made part of the local repo):

```git
git fetch origin branchName
```

To compare the differences between the most recent fetch and an upstream branch, use:

```git
git diff origin/remoteBranchName
```

To pull changes (this is the same as fetch + merge) from a specific upstream branch (defaults to master otherwise), use:

```git
git pull origin branchName
```

### GitIgnore, stashing, reverting and resetting ###

GitIgnore files list other files that are neither staged nor committed. To add a file or directory to the ```.gitignore``` file:

```git
git rm --cached fileOrDirectoryName
```

The parameter ```--cached``` instructs Git to leave the file on the local system and only add the reference to gitignore.

To stash the current updates:

```git
git stash
```

To stash with a message:

```git
git stash save 'insert your message here'
```

To list all stashed work:

```git
git stash list
```

To get the first element (files stashed last):

```git
git stash pop
```

To select a specific n-th stashed element by the index:

```git
git stash apply stash@{n}
```

To reset commits up to a given previous commit:

```git
git reset --hard previousCommitHash
```

To revert up to a given previous commit:

```git
git revert previousCommitHash
```
