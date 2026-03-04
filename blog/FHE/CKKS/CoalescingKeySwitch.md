# Coalescing Key Switching

:::meta
title : Optimizing HE operations via Level-aware Key-switching Framework
authors : Intak Hwang, Jinyeong Seo, Yongsoo Song
publication : CCS WAHC 23
reference : WAHC:HSS23
url : https://dl.acm.org/doi/10.1145/3605759.3625263, https://eprint.iacr.org/2023/1328
tags : CKKS, Key-switch, CRT
quickview : $1_{D_i} + 1_{D_j} = 1_{D_i \cup D_j}$
:::

The Chinese Remainder Theorem (CRT) in RNS system forms a decompose-and-innerproduct paradiagm for key-switching, as in [[SAC:CHKKS18]](CKKS-RNS.md), [[CT-RSA:HK20]](BetterBootstrapping.md), and [[EC:BMTH21]](NonSparseKeys.md). Formally speaking, the CRT reconstruction is to compute
$$
\sum_{i=0}^{\ell} [a]_{q_i} \cdot [s]_{q_i} \cdot [\hat{q}_i^{-1}]_{q_i} \cdot \hat{q}_i = \ip{\underbrace{\{[a]_{q_i}}_{\mathsf{Decomp}}\} , \underbrace{\{\hat{q}_i \cdot [\hat{q}_i^{-1}]_{q_i} \cdot [s]_{q_i} \}_i}_{\mathsf{Gadgets}} }
$$
Now assume we have the powers part, which may be quite a few number of gadgets. To reduce the expension of decomposition, we would like fewer gadgets. Hwang et al. pointed out that directly summing the gadgets is what we need. We expand the representation under the RNS basis, and have
$$
[\hat{q}_i^{-1}]_{q_i} \cdot \hat{q}_i \cdot [s]_{q_i} \pmod{q_j} = \begin{cases}
    [\hat{q}_j^{-1}]_{q_j} \cdot \hat{q}_j \cdot [s]_{q_j} &  i = j \\
    0 & i \neq j
\end{cases}
$$
therefore, 
$$
\sum_{i \in \mathcal{I}} [\hat{q}_i^{-1}]_{q_i} \cdot \hat{q}_i \cdot [s]_{q_i} \pmod{q_j} = \begin{cases}
    \sum_{i \in \mathcal{I}} [\hat{q}_i^{-1}]_{q_i} \cdot \hat{q}_i \cdot [s]_{q_i} \pmod{q_j} &  j \in \mathcal{I} \\
    0 & j \notin \mathcal{I}
\end{cases}
$$
We can extract the common part of primes whose indices are not in $\mathcal{I}$. Let $D = \prod_{i \in \mathcal{I}} q_i, Q = \prod_{i=0}^{L} q_i$, we have
$$
\sum_{i \in \mathcal{I}} [\hat{q}_i^{-1}]_{q_i} \cdot \hat{q}_i \cdot [s]_{q_i}
= \sum_{i \in \mathcal{I}} [(Q/q_i)^{-1}]_{q_i} \cdot (Q/q_i) \cdot [s]_{q_i} 
= (Q/D) \cdot \sum_{i \in \mathcal{I}}[(Q/D)^{-1}]_{q_i}\cdot[(D/q_i)^{-1}]_{q_i} \cdot (D/q_i) \cdot [s]_{q_i} 
$$
The factor $Q/D$ explains zero results when modulo $q_j$ for $j \notin \mathcal{I}$. It is then equal to $[(Q/D)^{-1}]_{D} \cdot (Q/D) \cdot [s]_D + k D$ for some small $k$. One can verify that by modulo $q_i$, these two parts are equal.

:::remark remark
In the original paper, the key switching follows the paradigm of [[CT-RSA:HK20]](BetterBootstrapping.md). Here we follow [[EC:BMTH21]](NonSparseKeys.md).
:::




