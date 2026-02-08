---
title: Source control with Git
nav_order: 1
parent: Git
---

# Source control with Git

Source control is the practice of tracking changes to source code. Git and [Apache Subversion](https://subversion.apache.org/) (or just "SVN") represent the more popular source control management (SCM) tools in use. Older tools such as [CVS](https://savannah.nongnu.org/projects/cvs/) (Concurrent Version Control Systems), are still available though largely superseded.

This outline focuses on the core Git commands, which should be applicable to the range of remote repositories available, for example, GitHub, [GitLab](https://gitlab.com/) and [BitBucket](https://bitbucket.org/), as well as predominantly self-hosting options such as [Gogs](https://gogs.io/) and [Gitea](https://docs.gitea.io/en-us/).

## Basic ideas

Code changes start somewhere and can then ```branch``` off to focus on specific updates, changes or developments, depending on the project. In some cases the work carried out on a given branch may be abandoned, whereas in others they are merged with the ```master``` branch. During a ```merge```, the line of code with the latest timestamp is committed to the repository, though there are cases when merge conflicts arise and must be handled manually.

Each node along a branch is denoted by a hash, a ```commit hash``` or more casually a ```commit```. The changes to code are performed by first adding all files (with ```git add```) to a list that require uploading to the repo; this step is also known as ```staging```. The developer then commits the changes (with ```git commit```) which builds a new hash. Quite often, this takes place on a local machine and therefore it is necessary to push the commit hash (with ```git push```) to a remote repository (typically known as ```origin``` but more accurately referred to as ```upstream```). 

Any developer with access to a repository can pull the latest branch (with ```git pull```), by default the master branch, to their local repository. A developer can also query for upstream updates (without downloading the updates) by fetching the status (with ``` git fetch```) from the repository.

## The HEAD pointer

The HEAD pointer represents the current reference point along a given branch. One can "check out" an existing branch and this by default, will set the HEAD pointer to the latest hash along the existing branch. It is possible to detach the HEAD pointer to some preceding commit hash. Git commands generally assume the point of view of the HEAD pointer.

A given developer can only have one active branch at a time. Before checking out other branches, developer would need to commit changes. There are cases where this is not desirable (changes may be expected to pass tests before being committed) while also noting that the current changes should not simply be discarded. In these circumstances, Git provides a way to ```stash``` changes (more than once) and then return to them later. Developers can also merge uncommitted changes from the current branch to a desired branch following a ```git checkout``` command. 

## Resetting and reverting commits

Git can ```reset``` changes to a given commit. This means Git removes (deletes) all commits between the current one up to the given commit. A somewhat less destructive method is available by instead directing Git to ```revert``` on a branch. Instead of deleting prior commits, this instruction "re-commits" the previous hashes, in the order they appear up to the given commit. 

To compare both methods using a branch with the sequence ```A -> B -> C```, a reset to hash A would result in a branch ```A``` whereas a revert to has A would lead to ```A -> B -> C -> B -> A```.
