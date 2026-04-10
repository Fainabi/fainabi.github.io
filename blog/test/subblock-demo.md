:::meta
title : Subblock Feature Demo
quickview : Demonstrating the new three-column code subblock feature for better structural explanation.
:::

# Subblock Feature Demo

This is the new `:::subblock` component. It allows you to explain your code segment by segment with natural language and context tracking.

:::subblock python : Fibonacci Sequence
def fib(n):
    if n <= 1:
        return n
[!! Base case: return n for 0 or 1 | n ]
    
    a, b = 0, 1
[!! Initialize first two numbers | a, b ]
    
    for _ in range(2, n + 1):
        # We perform the swapping of numbers
        a, b = b, a + b
[!! Iterate to calculate the sum | a, b, n ]
        
    return b
[!! Return the nth Fibonacci number | b ]
:::

## Why use this?
- **Column 1:** Clean code view (with internal comments!).
- **Column 2:** Structural description.
- **Column 3:** Variable tracking.
