---
title: The Stack data structure
nav_order: 19
parent: ADTs and Algorithms in C++
---

# The Stack data structure

Based on last-in first-out LIFO mechanism, a stack can be used to reverse the sequence of elements in an array or other data structure.

Recursive functions use the (system) stack portion of memory and operate on a LIFO basis. This contrasts to a programmer's stack. Some recursive functions can be converted into iterative functions, and _vice versa_.

The stack data is composed of a collection of elements (an array or linked list) and a pointer to the top of the stack (the address of the element at the top of the stack). There are several key operations:

+ Push(x) - add one element x
+ Pop() - remove one element
+ Peek(index) - viewing the value of an element at a particular point in the stack
+ stackTop() - viewing the uppermost element value
+ isEmpty() - boolean true if the stack is empty
+ isFull() - boolean true if the stack is full

## Implementing stacks with arrays

Declare an array of given size and set the pointer to -1. An array is filled starting from the zeroth index and the pointer is adjusted to point to the non-null element. Constant insertion at the head of the array would require constant reshuffling of the elements, so it is preferable to fill an array starting from the first element.

One uses a `struct` to define a stack:

```cpp
struct stack
{
    int size;           //decided at runtime
    int top;            //index of the uppermost element
    int * stackPtr;     //points to the uppermost element, an ultimately represents the array or linked list data type
};

//inside the main() function...

struct stack st;

//size required from another method or the user
//build a new array of required size in the heap with the pointer 
st.stackPtr = new int[st.size];

//represents an empty stack (this will change soon enough), when isEmpty == true
st.top = -1;    
```

Note that the structure ADT is not tied to an array. The pointer stackPtr could just as easily point to the first node of a linked list.

### The push operation, O(1)

Achieved generally as check if isFull() is false, then top++ and then assign the value to the element.

```cpp
void push(struct stack *st, int x) 
{
    if (st->top == st->size - 1)
    {
        printf("Stack is full");
    }
    else 
    {
        st->top++;
        st->stackPtr[st->top] = x;
    }
}
```

### The pop operation, O(1)

The pop operation can be repeated if `top >= 0`.

```cpp
int pop(struct stack *st)
{
    int x = -1;
    if (st->top == -1)
    {
        printf("Stack is empty, nothing deleted");
    }
    else
    {
        x = st->stackPtr[st->top];
        st->top--;
    }
    return x;
}
```

### The peek operation, O(1)

The `array index required = top - n + 1`, where n = 1, 2, 3, ... and represents the element starting from the uppermost element. If one wanted to peek at the 3rd element from the top, then the array index required would be `top - 3 + 1`.

```cpp
//return the appropriate type as required (assume that all elements in the stack are positive integers)

int peek (struct stack st, int positionFromTop)
{
    int x = -1;
    if (st.top - positionFromTop + 1 < 0)
    {
        printf("Invalid position");
    }
    else
    {
        x = st.stackPtr[st.top - pos + 1];
    }
    return -1;
}
```

### The stackTop() operation, O(1)

In addition to using peek(), one can use a modified form to give stackTop().

```cpp
int stackTop(struct stack st) {
    if (st.top == -1){
        return -1;
    }
    return st.stackPtr[top];
}
```

### The isEmpty() operation, O(1)

```cpp
int isEmpty(struct stack st) {
    if (st.top == -1){
        return 1;
    }
    return 0;
}
```

### The isFull() operation, O(1)

```cpp
int isFull(struct stack st) {
    if (st.top == st.size - 1){
        return 1;
    }
    return 0;
}
```

### Displaying array based stacks, O(n)

```cpp
void Display(struct stack st)
{
    int i;
    for(i = st.top; i >= 0; i--)
        printf("%d ", st.stackPtr[i]);

    printf("\n");
}
```

## Implementing stacks with linked lists

Unlike arrays, linked lists are filled at the beginning while resetting the pointer `top`.

Linked lists need not have `size` properties since linked lists are effectively not fixed in size as arrays are. Therefore, the definition of linked list based stacks are somewhat different:

```cpp
struct Node 
{
    int data;
    struct Node * next;
} * top = NULL;     //recall, top is now a global variable (pointer)
```

Note that top is already declared and accessible to any function which calls `top`. This demonstrates the difference when calling methods and passing parameters.

Within this scope, a linked list based stack is empty if `top == NULL` and full if pointer `t` is `NULL` following `Node * t = new Node;`.

### Push operations on linked list based stacks, O(1)

First check that the stack (that is, the heap) is not full before proceeding.

```cpp
void push(int x)
{
    //in the stack
    struct Node *t;

    //in the heap
    t = (struct Node*) malloc(sizeof(struct Node));
    if (t == NULL)
        printf("The stack (and heap) is full\n");
    else
    {
        t->data = x;

        //reset the uppermost pointer
        t->next = top;
        top = t;
    }
}
```

### Pop operations on linked list based stacks, O(1)

```cpp
int pop()
{
    struct Node *temp;
    int x =- 1;

    if(top == NULL)
        printf("Stack is Empty\n");
    else
    {
        temp = top;
        top = top->next;
        x = temp->data;
        free(temp);        //or in C++ use delete(p)
    }
    return x;
}
```

### Peek operations on linked list based stacks, O(n)

Since linked lists are filled 'from the beginning', one can pass the position required directly.

```cpp
//again, assume that the stack ADT stores positive integers

int peek (int positionFromTop)
{
    //sync the start of the linked list with a pointer p
    Node * p = top;

    for (int i = 0; p != NULL && i < positionFromTop - 1; i++)
    {
        p = p->next;
    }

    if (p != null)
    {
        return x;
    }
    return -1;
}
```

### The stackTop() operation, O(1)

In addition to using peek(), one can use a modified form to give stackTop().

```cpp
int stackTop() {
    if (top){
        return top->data;
    }
    return -1;
}
```

### The isEmpty() operation, O(1)

```cpp
int isEmpty() {
    if (top){
        return 0;
    }
    return 1;
}
```

### The isFull() operation, O(1)

```cpp
int isFull() {
    Node * temp = new Node;

    if (!temp){
        return 0;
    }
    free{temp);
    return 1;
}
```

### Displaying linked list based stacks, O(n)

```cpp
void Display()
{
    structNode *p;    
    p = top;
    while(p != NULL)    
    {
        printf("%d ", p->data);        
        p = p->next;    
    }
    printf("\n");
}
```

## Applications of using the stack ADT

## Checking parentheses: no. of opening parentheses = no. of closing parentheses

Evaluate a string and push an opening parenthesis and then pop when closing parenthesis is found. Then check if the stack is empty at the end of the string expression.

```cpp
int containsMatchingParentheses(char * mathExp)
{
    //note that '/0' is null character
    for(int i = 0; mathExp[i] != '\0'; i++)
    {
        if (mathExp[i] == '(' || mathExp[i] == '{' || mathExp[i] == '[')
            push(mathExp[i]);
        else if(mathExp[i] == ')' || mathExp[i] == '}' || mathExp[i] == ']')
        {
            if(top == NULL)
                return 0;
            pop();
        }
    }

    //check if top pointer is at the beginning again
    if(top == NULL)
        return 1;
    else
        return 0;
}
```

The above method checks for matching `(`, `{` and `[`.

## Using the stack to manage prefix and postfix operations

_Infix operations_ are of the form: operand operator operand. _Prefix operations_ in C and C++ include `+=` and `-=`. _Postfix operations_ include `=+` and `=-`.

The evaluation of an expression which involves BODMAS operation precedence, one must scan the expression.

Compilers convert an infix expression into postfix before evaluation. Compilers use __precedence__ to convert infix expressions such that all operations are closed, that is, are all parenthesised. Then it becomes clear the sequence of operations to evaluate. Precedence is not about the order of executing operations but specifically about parenthesising parts of an expression so that the order of evaluations is clear for the compiler to evaluate. The order in which operations are performed depends on the order of the elements in the postfix expression, not precedence (examples shown later).

```cpp
a + b * c
```

Precedence leads to, in steps:

1. a + b * c
2. a + (b * c)
3. (a + (b * c))

This is not how a compiler assigns parentheses as such. One then converts the infix expression into a prefix expression, reading left-to-right, as:

1. (a + [*bc])
2. `+a *bc`

Reading from left to right, it reads _add a to the product of b and c_. The operators appear first.

To convert to a postfix expression, similarly:

1. (a + [bc*])
2. `a bc* +`

One writes a growing postfix expression by adding operands to the left and operators to the right. The rightmost operator is the most recent 'addition' to the list of operators. Postfix expressions tend to be used more frequently than prefix expressions.

Here is another example: `a + b + c*d`

The prefix would have to consider precedence as left-to-right (step 2):

1. a + b + [*cd]
2. [+ab] + [*cd]
3. `+ [+ab][*cd]`
4. `+ + ab * cd` (without parentheses)

The postfix would be:

1. a + b + [cd*]
2. [ab+] + [cd*]
3. `a b + c d * +`

Finally, one last example: `(a + b) * (c - d)`

The prefix would be:

1. [+ab] * (c - d)
2. [+ab] * [-cd]
3. `* [+ab][-cd]`
4. `* + a b - c d`

The postfix would be:

1. [ab+] * (c - d)
2. [ab+] * [cd-]
3. `a b + c d - *`

### Infix to postfix conversion, and associativity

Compilers parenthesise expressions based in associativity, which indicates the direction of reading a sub-expression, with the first appearing first. It is required when two operators have the same precedence.

For example, left-to-right associativity indicates that the leftmost sub-expression takes precedence over anything to its right. Here is a summary of the rules (conventions):

| Symbol   | Prec | Assoc |
|:--------:|:----:|:-----:|
| + -      | 1    | L- R  |
| * /      | 2    | L- R  |
|   ^      | 3    | R - L |
| unary    | 4    | R - L |
| (  )     | 5    | L - R |

The unary operators take higher precedence than binary operators.

The assignment operator `=` is associativity R-L. So `a = b = c = 100` assigns c, then b then a. This is written by the compiler as:

 `(a = (b = (c = 100)))`

The postfix form would be:

`a b c 100 = = =`

More examples: `a ^ b ^ c`. With parentheses: (a ^ (b ^ c)). Note, the power operator is not part of the C language.

As a postfix expressions, we would yield:

`a b c ^ ^`

Take a unary operator, for example `--a`. The parenthesised form would be (-(-a)). The postfix form is a--, the prefix is --a.

Dereferencing pointers with *, a unary operator. `*p` is the prefix, and `p*` is the postfix form. Logarithms and factorials are other examples of unary operators.

Stated again, unary operators take precedence over binary operators. For example, `-a + b * log n!`.

Going right-to-left, as per the table, we have the postfix form would be:

1. `-a + b * log [n!]`
2. `-a + b * [log [n!]]`
3. `[a-] + b * [log [n!]]`
4. `[a-] + [b [log [n!]]]*`
5. `[[a-][b [log [n!]]]*]+`
6. `a - b log  n! * +`

### Infix to postfix using the stack

#### Method 1

The stack is used to store operators according to their precedence. All operands, are placed in a temporary array. Expressions are read from left to right.

Essentially, operators of higher precedence are pushed to the top of the stack so that any operators beneath it are of lower precedence. If there are operators of higher or equal precedence at the top of the stack, then the operator is popped from the stack and added to the expression. If there are still operators of higher or equal precedence then the operator is popped. This is repeated until the top of the stack stores an operator of lower precedence or the stack is empty.

At the end of the expression, the operators are popped in a LIFO approach and added to the end of the expression.

The code below uses predefined pop(), push(), isOperand() and pre() methods. The method pop() returns a `char`. The method pre() returns the precedence of `+`, `-`, `*` and `/`. The expression is stored in an array of characters, `infix` and ultimately transferred to another array `postfix`.

```cpp
char * infixToPostfix(char *infix)
{
    int i = 0, j = 0;
    char *postfix;

    //may need to use long instead of int
    int len = strlen(infix);

    //len+1 would be the minimum
    postfix = (char *) malloc((len+2)*sizeof(char));
    while(infix[i]!='\0')
    {
        //operands go into the array, operators go into the stack
        if(isOperand(infix[i]))
            postfix[j++] = infix[i++];
        else
        {
            if(pre(infix[i]) > pre(top->data))
                push(infix[i++]);
            else
                {
                    postfix[j++] = pop();
                    //stay in the current position of infix, i, until all uppermost stack elements have been compared
                }
        }
    }

    //copy across remaining stack operators
    while(top != NULL)
        postfix[j++] = pop();

    //terminate with a null char
    postfix[j] = '\0';
    return postfix;
}
```

A more advanced method which can include parentheses requires a change to the precedence depending on whether the operator is in the stack (IN) or out of the stack (OUT).

| Symbol   | IN   | OUT   |
|:--------:|:----:|:-----:|
| + -      | 1    | 2     |
| * /      | 3    | 4     |
|   ^      | 7    | 5     |
| (        | 6    | 0     |
| )        | 0    | N/A   |

Note that L-R associative operators have higher precedence out of the stack compared to in the stack. The parentheses are not passed to any `postfix` array and instead cancel each other when an incoming `)` is compared to a resident `(`.

For the expression `((a + b) * c ) - d ^ e ^ f` the first two `(` are pushed to the stack and given a precedence of 0 (from 6). Operand `a` is passed to an array. Incoming operator `+` has higher precedence than resident `(`, so is pushed to the stack. Operand `b` is sent to the array and then the next two `)` nullify the resident `(`. No parentheses are passed to the array. The next operands and operators are handled as outlined previously. The result is `ab+ c* def ^^ -`.

#### Method 2

Unlike method 1, in method 2 one fills the stack with operands and operators. Operands have the highest precedence over all operators. Operands have equal precedence, so consecutive operands pop other operands out of the stack. The popping and pushing of the stack follows the same conventions.

### Evaluating postfix expressions

Following some aspects of method 2 above, first an infix expression is converted into a postfix expression. The expression is then scanned and the stack is populated with operands. When an operator is found, two operands from the top are popped from the stack and evaluated. Using `ab+ c* def ^^ -` as an example, one can see how the stack and computation is handled:

| Stack                | OP              |
|:--------------------:|:---------------:|
| a                    |                 |
| b, a                 |                 |
|                      | a + b           |
| a + b                |                 |
| c, a + b             |                 |
|                      | ((a + b)*c)     |
| ((a + b)*c)          |                 |
| d, ((a + b)*c)       |                 |
| e, d, ((a + b)*c)    |                 |
| f, e, d, ((a + b)*c) |                 |
| d, ((a + b)*c)       |  e^f            |
| e^f, d, ((a + b)*c)  |                 |
|                      | d^(e^f)         |
| d^(e^f), ((a + b)*c) |                 |

The last operation would be `((a + b)*c) - d^(e^f)`, as given by the original infix expression.

The order in which operations are performed depends on the order of the elements in the postfix expression, not precedence. Take `x = 6 + 5 + 3 * 4`. Precedence would indicate that 3*4 is computed first. However, the stack elements and even the infix expression shows that `6 + 5` is executed first. The postfix expression is generated as:

1. 3 4 *
2. 6 5 + (3 4 *)
3. (6 5 + (3 4 *)) +
4. x ((6 5 + (3 4 *)) +) =
5. Without parentheses, as the compiler sees it: `x 6 5 + 3 4 * + =`

Thus, one can see that `6 + 5`, once popped by `+`, is computed first and then added to the stack giving `[(top) 11, x]`. The next two operands are pushed, giving `[(top) 4, 3, 11, x]`. Then multiplication is performed, and so on.

When parenthesised, `x = 6 + 5 + 3 * 4` is also `x = ((6 + 5) + (3 * 4))`, which shows the sub-expression `(6 + 5)` is evaluated first.

The C code is given below. Methods pop() and push() are defined to work with a global pointer `top` to an integer stack.

```cpp
int evaluatePostfixExp(char *postfix)
{
    int i = 0;
    int x1, x2, r = 0;
    for(i = 0; postfix[i] != '\0'; i++)
    {
        if(isOperand(postfix[i]))
        {
            ///convert ASCII codes and store in an integer stack, not a char stack; ASCII for char '0' is 48.
            push(postfix[i] - '0');
        }
        else
        {
            //operator found...
            //...pop the two uppermost from stack and perform the operation based on the incoming operator
            x2 = pop();
            x1 = pop();
            switch(postfix[i])
            {
                case '+': r = x1+x2; break;
                case '-': r = x1-x2; break;
                case '*': r = x1*x2; break;
                case '/': r = x1/x2; break;
            }
            push(r);
        }
    }
    return top->data;
}
```
