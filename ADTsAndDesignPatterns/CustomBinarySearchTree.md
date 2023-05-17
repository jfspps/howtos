---
title: The Binary Search Tree
nav_order: 10
parent: ADTs and Design Patterns in Java
---

# The Binary Search Tree

This represents an example showing how to implement a [binary search tree](../DataStructuresAndAlgorithmsinC%2B%2B/22_Binary_search_trees.md).

Overall, the construction of a BST is as follows. A sorted array of Integer is passed to ```buildBinarySearchTree()``` and then the parent BinaryTree structure is applied. The passed array is then partitioned as left and right arrays, both of which are independently passed again into ```buildBinarySearchTree()```, repeating the process.

```java
public class BinarySearchTree extends BinaryTree<Integer> {

    public BinarySearchTree(Integer data) {
        super(data);
    }

    public BinarySearchTree buildBinarySearchTree(Integer[] sortedArray) {
        if (sortedArray.length == 1){
            return new BinarySearchTree(sortedArray[0]);
        }

        if (sortedArray.length > 1) {
            int length = sortedArray.length;
            BinarySearchTree parent = new BinarySearchTree(sortedArray[length / 2]);

            Integer[] left = new Integer[length / 2];
            for (int i = 0; i < length / 2; i++) {
                left[i] = sortedArray[i];
            }

            Integer[] right;
            if (length % 2 == 0) {
                // right-hand will be one element smaller than the left
                right = new Integer[(length / 2) - 1];
                for (int j = 0; j < (length / 2) - 1; j++) {
                    right[j] = sortedArray[j + (length / 2) + 1];
                }
            } else {
                // left- and right-hand arrays would be of equal length
                right = new Integer[(length / 2)];
                for (int j = 0; j < (length / 2); j++) {
                    right[j] = sortedArray[j + (length / 2) + 1];
                }
            }

            parent.setChildren(
              buildBinarySearchTree(left), buildBinarySearchTree(right));
            return parent;
        } else
            return null;
    }

    /**
     * Builds a linked list of each level in the BST
     * level is zero-based to coincide with ArrayList and denotes which 
     * level is being processed; when calling initially, set level to 0
     * time complexity is O(n), where n = number of nodes + null nodes
     **/
    public ArrayList<LinkedList<BinaryTree<Integer>>> createLevelLinkedList(
            BinaryTree<Integer> node, 
            ArrayList<LinkedList<BinaryTree<Integer>>> levelList,
            int level){
        if (node == null){
            return null;
        }

        // dataList stores the node; levelList stores a collection of 
        // dataLists for a given level; note that levelList is stored
        // externally of the first call of createLevelLinkedList

        LinkedList<BinaryTree<Integer>> dataList;
        // **initially, size() is 0 and level is 0 meaning this level 
        // has not been visited before;
        if (levelList.size() == level){
            dataList = new LinkedList<>();
            levelList.add(dataList);
        } else {
            // for the right-child, levelList.size > level
            // levelList.size != level so instead dataList will get the
            // list of nodes which already contains left-child
            dataList = levelList.get(level);
        }

        dataList.add(node);
        createLevelLinkedList(node.getLeftChild(), levelList, level + 1);
        createLevelLinkedList(node.getRightChild(), levelList, level + 1);
        return levelList;
    }

    // traverse a BST and retrieve the node with the matching "data" value
    public BinarySearchTree getNode(BinarySearchTree parent, Integer data){
        if (parent == null){
            return null;
        }

        if (parent.getData().equals(data)){
            return parent;
        }

        if (data < parent.getData()){
            return getNode((BinarySearchTree) parent.getLeftChild(), data);
        } else
            return getNode((BinarySearchTree) parent.getRightChild(), data);
    }

    // from a given node, find the next in-order node
    public BinarySearchTree getNextInOrder(BinarySearchTree node) {
        // if a parent with a right-child
        if (node.getRightChild() != null) {
            BinarySearchTree tree = (BinarySearchTree) node.getRightChild();
            while (tree.getLeftChild() != null) {
                tree = (BinarySearchTree) tree.getLeftChild();
            }
            return tree;
        } else if (node.getParent() != null) {
            // leaf nodes next...
            BinarySearchTree parent = (BinarySearchTree) node.getParent();

            // if at right-child leaf
            if (parent.getRightChild() == node && parent.getParent() != null) {
                // check if parent is left child of grandparent
                if (parent.getParent().getLeftChild() == parent){
                    return (BinarySearchTree) parent.getParent();
                } else {
                    // currently on rightmost subtree
                    return null;
                }
            }

            // if a left-child leaf
            if (parent.getLeftChild() == node) {
                return parent;
            }
        }
        return null;
    }
  }
```
