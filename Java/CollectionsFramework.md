---
title: Java Collections
nav_order: 3
---

# Java Collections

What follows is a brief overview of major data structures and methods from the Java Collections framework (part of the Java utils package).

The Collection interface is an extension of Iterable, an interface that allows for the foreach loop. Sub-interfaces of Collection include Deque, List, Queue, and Set. These sub-interfaces are implemented by, as relevant, the Collections class (contrast to the Collection interface) along with the Deque, List, Queue, and Set classes. Furthermore, these classes have other other subclasses, including ArrayList, LinkedList, Vector, HashSet and HashMap to name a few.

The Vector class can be viewed as a synchronised (prevents other threads from changing the state of the List when it resides in the heap) implementation of ArrayList and has many of the same methods, including ```addElement()```, ```indexOf()```, ```firstElement()``` and ```removeElement()```. It was introduced in Java 1.2 and is seldom used in modern applications. Some authors demonstrate how the Vector instance is not completely thread-safe despite being synchronised. Whenever thread safety is not a concern, use ArrayList instead. See [here](./ThreadInterferenceAndSynchronisation.md) for synchronisation and ArrayList.

## Foreach, Iterator and ListIterator

Both the foreach loop and Iterator interfaces allow one to traverse a collection and retrieve the contents of a collection. (Foreach is demonstrated in <a routerLink="/java/javaLambdas">Lambdas and streams</a>.) Additionally, the Iterator interface or its extension, the ListIterator interface, provide extra features. The Iterator interface allows for elements to be removed. The ListIterator interface extends Iterator and allows for bidirectional traversal as well as modification of the elements. All collections have an ```iterator()``` and ```listIterator()``` methods which returns an iterator/listIterator and is initially placed at the start of a collection.

```java
public IteratorDemo {
    ArrayList<Integer> integers = new ArrayList<>();

    // use add() to add elements to "integers"

    Iterator<Integer> iterator = integers.iterator();

    ListIterator<Integer> listIterator = integers.listIterator();

    // for iterator and listIterator, check if there is another element with hasNext()
    // use next() to return the current element and immediately 
    // advance the pointer one place

    Integer currentInt;

    while (iterator.hasNext()){
        currentInt = iterator.next();
        // do something with currentInt
    }

    // for listIterator only, check if there was a previous element with hasPrevious()
    // use previous() to return the current element and immediately 
    // bring back the pointer one place

    while (listIterator.hasPrevious()){
        currentInt = iterator.previous();
        // do something with currentInt
    }
}
```

## Comparable and Comparator interfaces

Comparable and Comparator are interfaces which allow one to sort collections or lists. Overall, if sorting of objects needs to be based on one default (natural) order then use Comparable. If sorting needs to be based on multiple attributes of different objects or when the domain object source code cannot be altered, then use Comparator.

### Comparable

Comparable declares the ```compareTo()``` method, which can compare Strings. The command ```string1.compareTo(string2)``` can identify which string should precede which. If strings should be listed alphabetically, left-to-right, then a negative return means string1 is 'behind' string2 and should go before string2. A positive return means string1 is 'ahead' of string2 and should go after string2. The extent to which a string is ahead or behind is relayed in the return value.

```java
String s1="hello";
String s2="hello";
String s3="meklo";  
String s5="flag";  

// both return 0
System.out.println(s1.compareTo(s2)); 
System.out.println(s2.compareTo(s1)); 

// returns -5 because "h" is 5 times lower than "m"
System.out.println(s1.compareTo(s3));  

// returns 2 because "h" is 2 times greater than "f"
System.out.println(s1.compareTo(s5));
```

The next code snippet demonstrates a String, seatNumber. The ```compareTo()``` method returns a positive value if ```this.seatNumber > seat.getSeatNumber()```, a negative value if ```this.seatNumber < seat.getSeatNumber()``` and zero if they are equal.

```java
@Override
public int compareTo(Seat seat) {
    // seatNumber is of String type and so this return uses String's
    // compareToIgnoreCase
    return this.seatNumber.compareToIgnoreCase(seat.getSeatNumber());
}
```

In short, the Comparable interface defines the ```compareTo()``` method which is evaluated to sort elements. The ```Collections.sort()``` method would then evaluate ```compareTo()``` to sort elements in ascending order. As defined, above, the order would be s1, s3 and s5. By default,

+ Strings are sorted alphabetically
+ Integers are sorted in ascending order
+ Dates are sorted chronologically

A custom Comparable ```compareTo()``` can be realised by implementing the Comparable interface, for the class (objects) that need sorting, and overriding ```compareTo()```. 

### Comparator

The order can also be changed by building a Comparator instance. The Comparator interface defines one method: ```compare()``` (Comparator is a functional interface) and can provide a more custom sort method. Take care not to associate Comparators with ```compareTo()```! The method ```compareTo()``` belongs to the Comparable interface, not the Comparator interface.

```java
static final Comparator<Seat> PRICE_ORDER;

static {
    PRICE_ORDER = new Comparator<Seat>() {
        @Override
        public int compare(Seat seat1, Seat seat2) {
            if (seat1.getPrice() < seat2.getPrice()) {
                return -1;
            } else if (seat1.getPrice() > seat2.getPrice()) {
                return 1;
            } else {
                return 0;
            }
        }
    };
}

// then compare(seat1, seat2) is equivalent to
// seat1.getPrice().compareTo(seat2.getPrice())`;
```

According to the overridden method, the command ```Collections.sort(priceSeats, Theatre.PRICE_ORDER);``` then sorts the the list of Seats, priceSeats, by first by the order they were added (FIFO, lowest to highest index number) and then by price, from lowest price to highest. Elements are only swapped if they have different prices.

More comparators can be applied with different sort criteria.

Instead of building a Comparator instance, one could write a class which implements Comparator and then override ```compare()```. Instantiating the class would then have the same effect. Call ```Collections.sort(list, new CustomComparator());``` to apply the custom comparator.

## The List interface

Lists can be copied by reference (a shallow copy) by initialising a new List as ```List<ClassID> newList = new ArrayList<>(sourceList)```, in preference to ```Collections.copy(dest, source)```.  Elements can be reversed and shuffled using ```reverse()``` and ```shuffle()```. Reversing a list requires the implementation of the Comparable interface. The ```min()``` and ```max()``` methods return the smallest and largest numerical based element. One can also swap elements with ```swap()```.

## The Map interface

This interface has a key and value pairings and replaces dictionaries. Maps can be implement with the HashMap generic class with ```Map<Integer, String> someMap = new HashMap<>();```, for example. Keys are unique so all references, with ```put()```, to the same key will overwrite the stored value. Keys are also immutable. The method ```put()``` returns the previous value if the key-value pair already exists and null if not.

One can also use ```containsKey()``` to determine if a value already exists without overwriting it through ```put()```. With regard to thread management, one can use ```putIfAbsent()```, preventing two or more threads from writing to the map repeatedly.

Removing elements from maps can be carried out with ```remove()```. This method returns true is the key-value pair were found (and subsequently deleted) and false otherwise.

One can replace an already mapped value (a value with a key present) with ```replace()```. The method returns the original value if the key was found (and the original value updated) and null of the key was not found. One can also check the value also exists (in addition to the key) by using passing three parameters as: ```someMap.replace(key, originalValue, newValue);``` before replacing the originalValue. This provides more strict control over how key-values are replaced.

The sub-classes and some of their characteristics are summarised below:


+ HashMap: implemented as an array of linked lists, this tends to be used for quick lookup and insertion. Ordering of keys (not values) is arbitrary.
+ TreeMap: implemented by a 
[Red-black Tree](https://jfspps.github.io/Data-Structures-and-Algorithms/24_Search_trees.html), this naturally orders keys (alphabetically or numerically) and consequently must implement the Comparable interface's compareTo() method.
+ LinkedHashMap: essentially provides lookup and insertion of the speed O(1) of HashMap and the ordering of TreeMap. The ordering is the same as the insertion order.

More examples of LinkedHashMap and TreeMap are given at the end of this section.

## The Set interface

Sets are unordered collections of unique elements. Sets are generic class based and have size() and isEmpty() methods. Generally, sets should store immutable objects or at the very least remain unique, otherwise the behaviour would be undefined and unpredictable. HashSets use hashes (using ```hashCode()```) like Maps to provide fast access (O(1)) to each element. The element itself is also stored in an underlying HashMap, as the key with a dummy value added to the backing HashMap. Since HashMap keys are all unique, then the overarching Set elements are unique. Sets also have mathematical union and intersection type methods.

Like Lists, shallow copies can be applied with ```Set<ClassID> newSet = new HashSet<>(sourceSet)```. Elements are added with add() and a union of two sets is achieved with addAll(). The methods removeAll() and containsAll() are useful with mathematical Set logic. The method addAll() can be applied to the union of Sets, removeAll() applies to the difference of two sets and containsAll() (a non-destructive method) can be used to test if one Set is a Subset of another.

### Overriding hashCode() and equals()

When storing custom objects as keys in a HashMap or elements of a Set, it is highly recommended to override the ```equals()``` and ```hashCode()``` methods. To the compiler, objects will have subtle differences which enable objects to be stored in the set. If at least one property of the object is different then the object will be classed as unique. Their references (hashCode) will be different, and the default ```equals()``` method will apply a simple 'referential equality' which is 'object1 == object2'. This is not always apparent regarding the business logic however.

Objects which are equal according to ```equals()``` have the same hashCode and reside in the same bucket (think of an array of linked lists). Each hashCode indicates which bucket the submitted object will reside in. The return of ```hashCode()``` does not depend on ```equals()```, however, ```equals()``` does depend on ```hashCode()```. The method ```equals()``` checks the hashed codes and assumes they are assigned correctly. If ```hashCode()``` was not overridden or set correctly then ```equals()``` may use the wrong hashed code and end up looking in the wrong bucket. The method ```equals()``` is unaware of this and so it never finds the required object. The submitted object can then be placed into the Set or HashMap, duplicating at least one of the other elements already present.

This has subsequent problems, when the Set is iterated over, attempting to find or remove an object. The wrong object would be recalled or deleted.

When overriding the methods, one can choose object properties which direct the compiler to establish if objects are the same or not. Take care not to overload the methods, as this just provides a different method signature which could still be called. Overriding means that the current class will use newly-defined method over the parent class method.

```java
@Override
  public boolean equals(Object obj) {
    // referential equality
    if(this == obj) {
        return true;
    }

    // someProperty is of type String; retrieve it
    
    // apply Java Lang's String equals() method
    return this.someProperty.equals(someProperty);
}

@Override
public int hashCode() {
  // build a unique hashCode by adding, for example, 64 to the hashCode
  // someStringTypeProperty is of type String so here we apply String's
  // hashCode() method
    return this.someStringTypeProperty.hashCode() + 64;
}
```

The @Override annotation directs the compiler to check the signature is correct.

### instanceof and equals()

Some thought is required though when overriding ```equals()``` for a class and its subclass. When ```obj instanceof objClass``` is used in the ```equals()``` method, it returns true. Similarly, it works for subclasses, so the following, ```subClassObj instanceof objClass```, is also true. However, ```obj instanceof objSubClass``` is false. When ```instanceof``` is used as part of equals, define the overridden ```equals()``` method in the parent class only and allow the subclass to use the parent class' ```equals()``` method. In other words, do not override ```equals()``` in the subclass. To ensure this behaviour, mark the overridden ```equals()``` and ```hashCode()``` methods in the parent class as 'final'.

## LinkedHashMap and TreeMap

HashMaps and HashSets are chaotic and the sorted forms are LinkedHashMap and LinkedHashSet. They are ordered in the same order they were entered, that is, FIFO. The methods for Maps and Sets are very similar.

Below is a more comprehensive example which summarises many of the concepts covered thus far.


```java
public class StockItem implements Comparable<StockItem> {
  private final String name;
  private double price;
  private int quantityStock = 0;

  public StockItem(String name, double price) {
      this.name = name;
      this.price = price;
      this.quantityStock = 0;
  }

  public StockItem(String name, double price, int quantityStock) {
      this.name = name;
      this.price = price;
      this.quantityStock = quantityStock;
  }

  // ...assume getters for all three properties included...

  public void setPrice(double price) {
      if(price > 0.0) {
          this.price = price;
      }
  }

  public void adjustStock(int quantity) {
      int newQuantity = this.quantityStock + quantity;
      if(newQuantity >=0) {
          this.quantityStock = newQuantity;
      }
  }

  @Override
  public boolean equals(Object obj) {
      if(obj == this) {
          return true;
      }

      if((obj == null) ||
       (obj.getClass() != this.getClass())) {
          return false;
      }

      String objName = ((StockItem) obj).getName();
      return this.name.equals(objName);
  }

  @Override
  public int hashCode() {
      return this.name.hashCode() + 31;
  }

  @Override
  public int compareTo(StockItem o) {
      if(this == o) {
          return 0;
      }

      if(o != null) {
        // use String's compareTo()
          return this.name.compareTo(o.getName());
      }

      throw new NullPointerException();
  }

  @Override
  public String toString() {
      return this.name + " : price " + this.price;
  }
}
```

Each stock item is stored in a list, StockList. Note how the HashMap is replaced with a LinkedHashMap, which preserves the order of the items that were added.

```java
public class StockList {
  private final Map<String, StockItem> list;

  public StockList() {
    // use a LinkedHashMap to preserve the order to which the items were added
      this.list = new LinkedHashMap<>();
  }

  public int addStock(StockItem item) {
      if(item != null) {
          // retrieve the item from the list, 
          // otherwise return item to alreadyInStock
          StockItem alreadyInStock = list.getOrDefault(item.getName(), item);
          // if item was found in the list, then update item's quantity
          if(alreadyInStock != item) {
              item.adjustStock(alreadyInStock.quantityInStock());
          }

          // note this overwrites the current list entry
          list.put(item.getName(), item);
          return item.quantityInStock();
      }
      return 0;
  }

  public int sellStock(String item, int quantity) {
      // can only sell stock that exists; default to null if nothing exists
      StockItem inStock = list.getOrDefault(item, null);

      if((inStock != null) &&
       (inStock.quantityInStock() >= quantity) && (quantity >0)) {
          inStock.adjustStock(-quantity);
          return quantity;
      }
      return 0;
  }

  public StockItem get(String key) {
      return list.get(key);
  }

  public Map<String, StockItem> Items() {
      // an immutable collection is returned (a wrapper around List, Set and Map)
      // attempts to change the entries will throw an exception
      return Collections.unmodifiableMap(list);
  }

  @Override
  public String toString() {
      String s = "\\nStock List\\n";
      double totalCost = 0.0;
      for (Map.Entry<String, StockItem> item : list.entrySet()) {
          StockItem stockItem = item.getValue();

          double itemValue = stockItem.getPrice() * stockItem.quantityInStock();

          s = s + stockItem + ". There are " + stockItem.quantityInStock()
           + " in stock. Value of items: ";
          s = s + itemValue + "\\n";
          totalCost += itemValue;
      }

      return s + "Total stock value " + totalCost;
  }
}
```

StockItems can be added to a Basket. Note here that the Basket's list is built around a TreeMap. This causes the list to be sorted alphabetically, as defined in StockItem's ```compareTo()``` method, which ultimately uses String's ```compareTo()```. Each time a StockItem is added to the TreeMap, the item name is compared using ```compareTo()``` each time. It checks where the next added StockItem should go. This will naturally result in a performance hit. 

```java
public class Basket {
  private final String name;
  private final Map<StockItem, Integer> list;

  public Basket(String name) {
      this.name = name;
      // this will print out the basket items in alphabetical order
      // while invoking StockItem's compareTo() method
      this.list = new TreeMap<>();
  }

  public int addToBasket(StockItem item, int quantity) {
      if ((item != null) && (quantity > 0)) {
          int inBasket = list.getOrDefault(item, 0);
          list.put(item, inBasket + quantity);
          return inBasket;
      }
      return 0;
  }

  public Map<StockItem, Integer> Items() {
      return Collections.unmodifiableMap(list);
  }

  @Override
  public String toString() {
      String s = "\\nShopping basket " + name + " contains " + list.size() + " items\\n";
      double totalCost = 0.0;
      for (Map.Entry<StockItem, Integer> item : list.entrySet()) {
          s = s + item.getKey() + ". " + item.getValue() + " purchased\\n";
          totalCost += item.getKey().getPrice() * item.getValue();
      }
      return s + "Total cost " + totalCost;
  }
}
```

Time to go shopping...

```java
private static StockList stockList = new StockList();

public static void main(String[] args) {
  // stock the shop
  StockItem temp = new StockItem("bread", 0.86, 100);
  stockList.addStock(temp);

  temp = new StockItem("cake", 1.10, 7);
  stockList.addStock(temp);

  // this would demonstrate how the order of stock items is preserved...
  System.out.println(stockList);

  // add items to the basket
  Basket shoppingBasket = new Basket("Shopping Basket");
  sellItem(shoppingBasket, "cake", 1);

  // print out the changes
  System.out.println(shoppingBasket);
  System.out.println(stockList);
}

public static int sellItem(Basket basket, String item, int quantity) {
  //retrieve the item from stock list
  StockItem stockItem = stockList.get(item);
  if(stockItem == null) {
      System.out.println("We don't sell " + item);
      return 0;
  }
  if(stockList.sellStock(item, quantity) != 0) {
      basket.addToBasket(stockItem, quantity);
      return quantity;
  }
  return 0;
}
```
