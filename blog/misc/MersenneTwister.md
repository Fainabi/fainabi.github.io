# Mersenne Twister

A Mersenne twister is a twisted generalized feedback shift register (twisted GFSR, TGFSR).

## Mersenne Prime

The primes like $2^p - 1$ for some prime $p$. 

## MT19937

The Mersenne twister on the Mersenne prime $2^{19937}-1$. For the instantiation in 32-bit word length ($w = 32$), it is then MT19937-32.

The series $\{x_i\}_i$ is the state of MT19937, which updates itself and outputs the state for the generation of random bytes.

Let $r$ be a 32-bit mask, and $A$ be the twist transformation. The degree of recurrence is $n$ and $1 \leq m \leq n$ is the middle word offset. The recurrence of the series is like:
$$
x_{k+n} = x_{k+m} \oplus \of{\of{(x_k \And r) | (x_{k+1} \And \sim\!r)} \cdot A}
$$
The twist transformation $A$ is 
$$
A = \begin{pmatrix}
    0 & I_{31} \\
    a_{31} & (a_{30}, \cdots, a_0)
\end{pmatrix}
$$
The matrix multiplication between $x$ and $A$ is
$$
x \cdot A = \begin{cases}
    x \gg 1 & x_0 = 0 \\
    (x \gg 1) \And a & x_0 = 1
\end{cases}
$$
which can also be regarded as a polynomial multiplication $(-)\cdot Y$ in the ring $\F_2[Y]/(Y^{32}-(a_{31} + \cdots a_0 Y^{31}))$. Note that the coefficients of the polynomial have reversed order of indices to that in the bit sequence.

Followed by the LFSR is a tempering transform applied on $x$ as the output. 
```py
def temper(y):
    y ^= (y >> 11)       
    y ^= (y << 7) & 0x9d2c5680
    y ^= (y << 15) & 0xefc60000
    y ^= (y >> 18)
    return y
```

For initialization, it needs to generate $n$ words as
$$
x_i = f \times (x_{i-1} \oplus (x_{i-1} \gg (w - 2))) + i
$$
by setting $x_0$ as the seed value. $f$ here is $1812433253$ in mt19937.

