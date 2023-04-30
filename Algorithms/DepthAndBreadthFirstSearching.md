# Depth- and Breadth-first searching

The child nodes are stored in primitive Java arrays. The breadth-first search (BFS) uses the custom [Queue ADT](../ADTsAndDesignPatterns/CustomQueue.md) and resembles a level-order traversal.

```java
public class SearchableGraph<T> {

    private final T data;
    private boolean visited;

    // this applied to a more generic graph as opposed to a binary tree
    private SearchableGraph<T>[] adjacent;

    public SearchableGraph(T data) {
        this.visited = false;
        this.data = data;
    }

    public SearchableGraph<T>[] getAdjacent() {
        return adjacent;
    }

    public void setAdjacent(SearchableGraph<T>[] adjacent) {
        this.adjacent = adjacent;
    }

    public boolean hasBeenVisited() {
        return this.visited;
    }

    public void setVisited(boolean visited) {
        this.visited = visited;
    }

    // can be reviewed as required
    public void printData(SearchableGraph<T> node) {
        System.out.println(node.data);
    }

    // traverses a tree following a depth-based approach; like BFS, DFS is O(n)
    public String depthFirstSearch(SearchableGraph<T> root, StringBuilder stringBuilder) {
        if (root == null) {
            System.out.println("Given node is null");
            return "Null graph received";
        }

        // in considering recursion, the newly found node is printed before 
        // visiting it's "child" nodes (hence pre-order)
        stringBuilder.append(root.data).append(" ");
        root.visited = true;

        for (SearchableGraph<T> tree : root.adjacent) {
            // check if visited otherwise for cyclic graphs one would 
            // end up in an infinite loop
            if (!tree.visited) {
                depthFirstSearch(tree, stringBuilder);
            }
        }

        return stringBuilder.toString();
    }

    // build a queue of neighbouring nodes using queuedNodes and 
    // visit them once all are queued; like DFS, BFS is O(n)
    public String breadthFirstSearch(SearchableGraph<T> root, StringBuilder stringBuilder) {
        if (root == null) {
            System.out.println("Given node is null");
            return "Null graph received";
        }

        Queue queuedNodes = new Queue();
        root.visited = true;
        queuedNodes.enqueue(root);    // FIFO, root handled first

        while (!queuedNodes.isEmpty()) {
            // initially, this returns root and then adds its adjacent nodes 
            // to the queue; the for loop should not repeat itself for each
            // adjacent node since the flag node.visited is true
            SearchableGraph<T> currentNode = (SearchableGraph<T>) queuedNodes.dequeue();
            stringBuilder.append(currentNode.data).append(" ");

            // check if visited otherwise for cyclic graphs one would end up in an infinite loop
            for (SearchableGraph<T> node : currentNode.getAdjacent()) {
                if (!node.visited) {
                    node.visited = true;
                    queuedNodes.enqueue(node);
                }
            }
        }

        return stringBuilder.toString();
        }
    }
```
