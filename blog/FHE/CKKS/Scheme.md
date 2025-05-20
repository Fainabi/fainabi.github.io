# CKKS

CKKS is an acronym of the authors (Cheon-Kim-Kim-Song) representing the work about $\underline{\text{h}}$omomorphic $\underline{\text{e}}$ncryptions for $\underline{\text{a}}$rithmetic of $\underline{\text{a}}$pproximate $\underline{\text{n}}$umbers (aka HEAAN). The key concept of CKKS scheme is to take noise in FHE as a part of message. Each message is therefore representing a (somehow) fixed-point number w.r.t an encoding factor $\Delta$. In this file, the cyclotomic ring is \(R = \Z[X]/(X^N + 1)\) for $N$ is a power of two and $M = 2N$.

## Encoding/Decoding

The most important part of CKKS is its encoding method, to pack a bunch of complex numbers into a single message. As CKKS original paper points out, the encoding process is
\[
\begin{CD}
    \C^{N/2} @>\pi^{-1}>> \H @>\round{\cdot}_{\sigma(\mathcal{R})}>> \sigma(\mathcal{R}) @>\sigma^{-1}>> \mathcal{R} \\
    @. @. @. @.\\
    \bm{z} @>>> \pi^{-1}(\bm{z}) @>>> \round{\pi^{-1}(\bm{z})} @>>> \sigma^{-1}\of{\round{\pi^{-1}(\bm{z})}}
\end{CD}
\]

The elements in $\C^{N/2}$ are said in slots, as each number take a position in the vector. In order to perform element-wise addition and multiplication, CKKS relies on the CRT decoding, which is represented by the canonical embedding map 
\[
\begin{align}
\sigma: \mathcal{R} &\longrightarrow \C^N \\
            m(X) &\mapsto (m(\zeta^i))_{i \in \Z_N^\ast}
\end{align}
\]
where $\zeta = e^{\frac{-2 \pi i}{N}}$. Noticing that for a polynomial $\sigma(\zeta^{-i}) = \overline{\sigma(\zeta^i)}$, therefore $\sigma(R)$ is a symmetric space (in the meaning of conjugation). Such space is defined as:
$$ 
\H := \{ \bm{z} = (z_j)_{j \in \Z_M^\ast} \in \C^N : z_j = \overline{z_{-j}}, \forall j \in \Z_M^\ast \}
$$

Such embedding can be represented as a matrix:
\[
\CRT = (\zeta^{i j})_{i\in\Z_M^*, j = 0,\cdots,N-1} = \begin{pmatrix}
    1 & \zeta & \zeta^2 & \cdots & \zeta^{N-1} \\
    1 & \zeta^3 & \zeta^6 & \cdots & \zeta^{3 (N-1)} \\
    \vdots & \vdots & \vdots  & & \vdots \\
    1 & \zeta^{2 N - 1} & \zeta^{2 (2 N - 1)} & \cdots & \zeta^{(2 N-1)(N-1)} \\
\end{pmatrix}
\]
such that 
$$ \CRT(\vec{m}) = \sigma(m(X)) $$

## Encryption/Decryption

CKKS is a family of lattice ciphertext, following the standard Regev encryption (RLWE) as
$$ (a, b = - a s + m + e) \in \mathcal{R}^2_Q. $$
Decryption is $b + a s$, where $e$ the error is absorbed by the message.



## Bibliography

1. Jung Hee Cheon, Andrey Kim, Miran Kim, Yong Soo Song: Homomorphic Encryption for Arithmetic of Approximate Numbers. ASIACRYPT (1) 2017: 409-437. EPRINT: 2016/421

2. Jung Hee Cheon, Kyoohyung Han, Andrey Kim, Miran Kim, Yongsoo Song: Bootstrapping for Approximate Homomorphic Encryption. EUROCRYPT (1) 2018: 360-384. EPRINT: 2018/153