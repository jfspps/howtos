---
title: The Binary Tree
nav_order: 9
parent: ADTs and Design Patterns in Java
---

# The Binary Tree

This represents an example showing how to implement a binary tree.

Methods for in-order, pre-order and post-order traversal are also given. Notice here that the level-order traversal of a tree (which uses a queue to store, in order, future nodes to be processed) scans all child nodes before moving to the next level. Thus, the level-order algorithm forms the basis of a _breadth-first search_.

A check to see if the binary tree is actually a binary search tree (such that the left child <= parent >= right child) is given towards the end of the class.

```java
public class BinaryTree<T> {

    private T data;
    private BinaryTree<T> leftChild;
    private BinaryTree<T> rightChild;
    private BinaryTree<T> parent;

    // root node cannot be null
    public BinaryTree(T data) {
        if (data != null){
            this.data = data;
        }
    }

    /**
     * Print the passed node data (can be null)
     * @param node
     */
    public StringBuilder printNode(BinaryTree<T> node, StringBuilder builder) {
        return builder.append(node.data).append(" ");
    }

    public T getData() {
        return this.data;
    }

    public BinaryTree<T> getLeftChild() {
        return leftChild;
    }

    public BinaryTree<T> getRightChild() {
        return rightChild;
    }


    public BinaryTree<T> getParent(){
        return this.parent;
    }

    /**
     * Set the left node; data can be null
     * @param leftChild
     */
    public void setLeftChild(BinaryTree<T> leftChild) {
        if (leftChild != null){
            this.leftChild = leftChild;
            leftChild.parent = this;
        }
    }

    /**
     * Set the right node; data can be null
     * @param rightChild
     */
    public void setRightChild(BinaryTree<T> rightChild) {
        if (rightChild != null){
            this.rightChild = rightChild;
            rightChild.parent = this;
        }
    }

    /**
     * Set both the left and right nodes
     * @param lChild
     * @param rChild
     */
    public void setChildren(BinaryTree<T> lChild, BinaryTree<T> rChild) {
        if (lChild != null){
            this.leftChild = lChild;
            lChild.parent = this;
        }
        if (rChild != null){
            this.rightChild = rChild;
            rChild.parent = this;
        }
    }

    /**
     * Perform an in-Order binary tree traversal
     * @param tree
     */
    public void inOrderTraversal(BinaryTree<T> tree, StringBuilder builder) {
        // reach the bottom of the tree and return the leftChild, then the node, 
        // then the right child
        if (tree != null) {
            inOrderTraversal(tree.leftChild, builder);
            printNode(tree, builder);
            inOrderTraversal(tree.rightChild, builder);
        }
    }

    /**
     * Perform a pre-Order binary tree traversal
     * @param tree
     */
    public void preOrderTraversal(BinaryTree<T> tree, StringBuilder builder) {
        // process current node then visit the child nodes, left-to-right
        if (tree != null) {
            printNode(tree, builder);
            preOrderTraversal(tree.leftChild, builder);
            preOrderTraversal(tree.rightChild, builder);
        }
    }

    /**
     * Perform a post-Order binary tree traversal
     * @param tree
     */
    public void postOrderTraversal(BinaryTree<T> tree, StringBuilder builder) {
        // process the child nodes first, left-to-right and then process the given node
        if (tree != null) {
            postOrderTraversal(tree.leftChild, builder);
            postOrderTraversal(tree.rightChild, builder);
            printNode(tree, builder);
        }
    }

    /**
     * Perform a level-Order binary tree traversal, left-to-right
     * @param root
     */
    public void levelOrderTraversal(BinaryTree<T> root, StringBuilder builder){
        Queue<BinaryTree<T>> queue = new Queue<>();
        printNode(root, builder);
        queue.enqueue(root);

        while (!queue.isEmpty()){
            root = queue.dequeue();

            if (root.getLeftChild() != null){
                printNode(root.leftChild, builder);
                queue.enqueue(root.getLeftChild());
            }

            if (root.getRightChild() != null){
                printNode(root.rightChild, builder);
                queue.enqueue(root.getRightChild());
            }
        }
    }

    /**
     * Perform a level-Order traversal binary tree traversal, right-to-left
     * @param root
     */
    public void levelOrderReversedTraversal(BinaryTree<T> root, StringBuilder builder){
        Queue<BinaryTree<T>> queue = new Queue<>();
        printNode(root, builder);
        queue.enqueue(root);

        while (!queue.isEmpty()){
            root = queue.dequeue();

            if (root.getRightChild() != null){
                printNode(root.rightChild, builder);
                queue.enqueue(root.getRightChild());
            }

            if (root.getLeftChild() != null){
                printNode(root.leftChild, builder);
                queue.enqueue(root.getLeftChild());
            }
        }
    }

    /**
     * Deduce the longest sequence of child nodes from the root node
     * @param tree
     * @return the longest sequence of child nodes, including the root node
     */
    public int getMaxDepth(BinaryTree<T> tree) {
        int leftBranch;
        int rightBranch;

        if (tree != null){
            leftBranch = getMaxDepth(tree.leftChild);
            rightBranch = getMaxDepth(tree.rightChild);

            if (leftBranch > rightBranch){
                return leftBranch + 1;
            } else {
                return rightBranch + 1;
            }
        }
        return 0;
    }

    /**
     * Deduce the shortest sequence of child nodes from the root node
     * @param tree
     * @return the shortest sequence of child nodes, including the root node
     */
    public int getShortestDepth(BinaryTree<T> tree){
        int leftBranch;
        int rightBranch;

        if (tree != null){
            leftBranch = getMaxDepth(tree.leftChild);
            rightBranch = getMaxDepth(tree.rightChild);

            if (leftBranch < rightBranch){
                return leftBranch + 1;
            } else {
                return rightBranch + 1;
            }
        }
        return 0;
    }

    // while not abstract binary trees, a binary search tree must handle comparable 
    // data types, in this case integers and is included here instead of the class, 
    // BinarySearchTree, which always builds BSTs

    /**
     * Determines if the given binary tree is a binary search tree 
     * (left-child <= root <= right-child).
     * Data assumed to be of type Integer.
     * @param tree
     * @param list
     * @return
     */
    public boolean isABinarySearchTree(BinaryTree<Integer> tree, LinkedList<Integer> list) {
        if (tree != null) {
            isABinarySearchTree(tree.leftChild, list);
            list.add(tree.data);
            isABinarySearchTree(tree.rightChild, list);
        }
        return checkIfBST(list);
    }

    // helper method which checks the sequence of nodes from an in-order traversal
    boolean checkIfBST(LinkedList<Integer> linkedList) {
        int size = linkedList.size();
        for (int i = 0; i < size - 1; i++){
            if (linkedList.get(i) > linkedList.get(i+1)){
                return false;
            }
        }
        return true;
    }
  }
```
