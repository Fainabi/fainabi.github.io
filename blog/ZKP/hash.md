# Hash Functions

A hash function $h$ accepts a series of characters and output a fixed-length bit sequence, such that the different inputs yield different outputs with a very high probability, and the preimage of the hash function is hard to recover.

Formally, a hash function $h : \{0,1\}^* \rightarrow \{0, 1\}^\ell$ has three properties:
- $\forall x, \forall y, x \neq y \rightarrow \Pr\{h(x) \neq h(y)\} \leq \text{negl}$
- $\forall x$ and PPT algorithm $A$, $\Pr\{A(h(x)) = x\} \leq \text{negl}$
- $\forall x$ and PPT algorithm $A$, $\Pr\{h(A(h(x))) = h(x)\} \leq \text{negl}$.