:::meta
authors : Jung Hee Cheon, Kyoohyung Han, Andrey Kim, Miran Kim, and Yongsoo Song
publication : SAC 2018
reference : SAC:CHKKS18
url : https://link.springer.com/chapter/10.1007/978-3-030-10970-7_16, https://eprint.iacr.org/2018/931
tags : FHE, CKKS, RNS
title : A Full RNS Variant of Approximate Homomorphic Encryption
:::

:::flashcards
$\mathcal{R}_{q}$ : $\Z_q[X]/(X^N+1)$
$m$ : message polynomial 
$z$ : floating-point number(s) in slots
$\mathcal{B}$ : $\{p_0, \cdots, p_{\ell-1}\}$
$\mathcal{C}$ : $\{q_0, \cdots, q_{k-1}\}$
:::

# CKKS RNS

The residual number system makes a double-CRT form of CKKS scheme [[AC:CKKS17]](Scheme.md). By double, it means modulo distinct primes as CRT suggests, then apply NTT for fast polynomial multiplication. Each equivalence represents a CRT.
$$
\mathcal{R}_{\prod_{i} q_i} \stackrel{\cong}{\rightarrow} \underbrace{\bigoplus_i \mathcal{R}_{q_i} \stackrel{\cong}{\rightarrow} \bigoplus \Z_{q_i}^N}_{\text{RNS works in}}
$$


## Arithmetics in RNS 

The arithmetics in RNS contains polynomial operations: addition, multiplication, and specially, divide by some prime (in the basis). The conversion between the RNS basis also plays a role in FHE. By CRT and NTT domain, the addition and multiplication can be efficiently computed. Therefore, the main interests are about the division and conversion in RNS basis.

### Fast Basis Conversion

Let $\mathcal{B} = \{p_0, \cdots, p_{\ell-1}\}, \mathcal{C} = \{q_0, \cdots, q_{k-1}\}$, the fast basis conversion is
$$
\Conv_{\mathcal{C}\rightarrow\mathcal{B}}([a]_{\mathcal{C}}) = \of{
    \sum_{j=0}^{\ell - 1} [a^{(j)} \cdot \hat{q}_j^{-1}]_{q_j} \cdot \hat{q_j} \pmod{p_i}
}_{0 \leq i \leq k}
$$
where $\hat{q}_j = Q/q_j$ and $a^{(j)} = [a]_{q_j}$. In other words, it is an inverse (and approximate) CRT construction with modulo results for primes in $\mathcal{C}$.

By fast basis conversion, the ModUp procedure (from $\mathcal{C}$ to $\mathcal{D}=\mathcal{C}||\mathcal{B}$) is
$$
\ModUp_{\mathcal{C}\rightarrow\mathcal{D}}(\{[a]_{q_j}\}) =
    \ofc{\{[a]_{q_j}\}, \Conv_{\mathcal{C}\rightarrow\mathcal{B}}(\{[a]_{q_j}\})}
$$

The ModDown procuedure which computes div $P$, is:
$$
\ModDown_{\mathcal{D}\rightarrow\mathcal{C}}([a]_{\mathcal{B}}, [a]_{\mathcal{C}}) =
    [P^{-1}]_{\mathcal{D}} \cdot \of{[a]_{\mathcal{B}} - \Conv_{\mathcal{C}\rightarrow\mathcal{B}}([a]_{\mathcal{C}})}
$$
where $P = \prod_{i} p_i$.

## Some Discussion

CKKS RNS claims that it computes approximate resclaing by dividing by $q_\ell$ rather than $q$, as the messages are encoded as $q \cdot z_1$, $q \cdot z_2$, where $z_1, z_2$ are floating-point numbers. That forms the following two methods for computing:
$$
\text{Rescaling in CKKS17: } \frac{1}{q} \cdot m, \quad \quad
\text{Rescaling in CKKS RNS: } \frac{1}{q_\ell} \cdot m
$$
The approximate error is $|1 - q_\ell^{-1} \cdot q|\cdot|q^{-1} \cdot m|$. If $q_\ell$ is close to $q$, then the error is smaller than the precision of message.

Future works consider maintain a scaling factor when computing, so that such error is considered in the scaling factor, for more precised FHE evaluations.