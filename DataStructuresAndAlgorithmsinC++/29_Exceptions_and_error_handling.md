---
title: Exceptions and error-handling
nav_order: 29
parent: ADTs and Algorithms in C++
---

# Exceptions and error-handling

Exceptions (blocks of code that are executed when a run-time error occurs) are offered in a similar way to Java. The block of code where a run-time error can
occur is housed within a `try` block. If an error condition is met then an exception is thrown with the `throw` keyword and the code that does the clean-up is defined within the `catch` block. Each block can be nested accordingly and the usual scoping rules apply.

Unlike Java, C++ does not use the `finally` block. This is essentially due to the difference in approach regarding how resources are freed in Java and C++. From the Bjarne's book:

```quote
Because C++ supports an alternative that is almost always better: The "resource acquisition is initialization" technique (TC++PL3 section 14.4). The basic idea is to represent a resource by a local object, so that the local object's destructor will release the resource. That way, the programmer cannot forget to release the resource.
```

For more detailed info, look up deterministic destructors and _Resource acquisition is initialization (RAII)_.

## General approach

```cpp
#include <iostream>

// const modifier is not a requirement
const char errorMessage[] = "Calculation invalid";
const int errorCode = 404;

int main(){
    try {
        // do stuff....

        if (somethingWentWrong){
            throw errorMessage;
        }

        if (somethingElseWentWrong){
            throw errorCode;
        }

        // continue on ...

    } catch (const char message[]){
        std::cout << errorMessage << std::endl;
    } catch (const int code){
        std::cout << errorCode << std::endl;
    }

    return 0;
}

```

Note here that the `catch` block responds based on the type of exception thrown. Like Java, these types are not limited to primitive C++ types but also classes.
