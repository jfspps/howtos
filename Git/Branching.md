---
title: Branching
nav_order: 5
parent: Git
---

# Branching

One can initialise a new repository and set the main branch name as follows:

```bash
git init -b mainBranchName
```

One can rename a branch later with:

```bash
git branch -m oldName newName
```

Branches can be named with / to mimix Unix pathnames, and subsequently form a useful way to organise branches. For example

+ bug-fix/ticketX
+ bug-fix/ticketY

One can view a list of commits for multiple branches using a wildcard * as:

```bash
git show-branch 'bug-fix/*'
```

One can create a new branch and then checkout the new branch with:

```bash
git checkout -b newBranchName
```

## The HEAD pointer

The HEAD pointer represents the current reference point along a current branch and by default points to the latest commit. 

There is only one HEAD per repository, as such.

One can "check out" an existing branch and this by default, will set the HEAD pointer to the latest hash along the existing branch. It is possible to detach the HEAD pointer to some preceding commit hash. Git commands generally assume the point of view of the HEAD pointer.

## Stashing and carrying updates to a different branch

A given developer can only have one active branch at a time. Before checking out other branches, developer would need to commit changes. There are cases where this is not desirable (changes may be expected to pass tests before being committed) while also noting that the current changes should not simply be discarded. In these circumstances, Git provides a way to ```stash``` changes (sometimes more than once) and then return to them later. Use ```git stash -m "stash comment"```.

Developers can also merge uncommitted changes from the current branch to a desired branch following a ```git checkout targetBranchName``` command. This is not the same as merge of branches but actually an example of a ```three-way merge```.

## Listing branches

Use the following to view local (temporary) branches:

```bash
git branch 
```

The following will show remote (permanent) branches:

```bash
git branch -r
```

Finally, the following shows both local and remote branches:

```bash
git branch -a
```

As shown above, use ```git show-branch``` to list commits of the current branch.

## Checking out specific commits

One can checkout a specific commit in one of several ways:

+ by hash value (SHA)
+ by tag name
+ by reference to the HEAD pointer, with ^ e.g. ```git checkout HEAD^^^``` to checkout a commit three behind HEAD (this assumes that the path to the third commit is unambiguous)
+ by reference to the tip of the branch (latest commit) with ~ e.g. ```git checkout branchName~4``` to checkout a commit four behind the tip (again, assumes an unambiguous path)

Either way, this ```detaches``` the HEAD pointer from the tip of the branch. This effectively results in a HEAD that is not part of the branch anymore, and so any subsequent commits, while permitted, will not be associated with any branch. Consequently, when one tries to checkout the tip of the branch later, the aforementioned commits are unreachable (they do not belong to any branch).

To make the commits reachable, one must start a new branch when the HEAD is detached, before committing changes. It is also possible to tag a (dangling) commit and then be able to access the commit later via the tag.

Eventually, any commits that are not tagged or part of a branch are disposed via Git's garbage collection.

## Deleting branches

This is typically done locally, when short-lived bug fix or feature branches (not expected to be part of the remote repository) are deleted.

Revisiting the idea of unreachable commits again, Git safeguards users from deleting branches if it means that any commit is left unreachable. Some commits are part of more than one branch, so in such cases it is possible to delete one of the branches. In other cases, Git will be default prevent users from deleting branches.

If a situation arises whereby a commit would become unreachable, then in order to delete the branch, one would need to either:

- checkout a (different) branch that also has the commit (that should not be deleted) and then proceed to delete a different branch that also has the commits
- get the commits over to an existing branch via a merge, before deleting the branch

![Deleting branches](./graphml/deleting_branches.png)
