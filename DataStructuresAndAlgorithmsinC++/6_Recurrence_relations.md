---
title: Recurrence relations and recursion
nav_order: 6
parent: Data Structures and Algorithms in C++
---

# Recurrence relations and recursion

In general, recursive functions continually call themselves until a base case is met. Once a base case is met, then the current function eventually returns, and all prior functions return.

The base case for `fun1()` is n = 0:

```cpp
void fun1(int n)
{
 if(n > 0)
 {
  printf("%d ", n);
  fun1(n - 1);
 }
}
```

One `if` statement and one `printf()` call, when `n > 0`. In addition there are `T(n - 1)` multiple calls of `fun1()` made when `n > 0`. When `n = 0`, only one run of the `if` statement is needed.

One can express a recurrence relation (an equation which relates consecutive terms, in this case, of a recursive function calls) to deduce the number of calls (time complexity `T(n)` for `int n`) expected.

```math
T(n) =  1    n = 0
  T(n - 1) + 2 n > 0
```

For all `n > 0`, if

```math
T(n) = T(n - 1) + 2
```

then it follows that

```math
T(n - 1) = T(n - 2) + 2
T(n - 2) = T(n - 3) + 2
...
```

Thus,

```math
T(n) = [T(n - 2) + 2] + 2
  = T(n - 2) + 2
```

We generalise for constant `k` such that

```math
T(n) = T(n - k) + k
```

When `n - k = 0`, this means `T(n) = T(0) + n = 1 + n`. That is, `T(n) = 1 + n` is effectively scaled to `T(n) = n`, a degree (or order) of one.
