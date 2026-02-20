# Homomorphic Evaluation on AES circuits

:::meta
title : Homomorphic Evaluation of the AES Circuit
authors : Craig Gentry, Shai Halevi, and Nigel P. Smart
publication : CRYPTO 2012
reference : C:GHS12
url : https://doi.org/10.1007/978-3-642-32009-5_49, http://eprint.iacr.org/2012/099
tags : GHS-style key-switch, double CRT, AES
:::

Several general optimizations for RLWE are proposed. They are: a new type of key-switching, double CRT representation, scale management.

## New Type of Key-switching

The previous key-switching follows a decompose-and-multsum paradigm. Let $\bm{c} = (b,a) \in \mathcal{R}_q^2$ and its bit decomposition $a = \sum_i 2^i a_i$, then the key-switching process is
$$
\sum_{i} a_i \cdot \RLWE_Q(2^i s' + p_0 e_i) \in \RLWE_Q(a \cdot s' + p_0 e)
$$
Key-switching is somehow similar to bootstrapping, which evaluates some circuits on the keys (which are RLWE ciphertexts has more budgets). 
$$
a \cdot \RLWE_{p q}(s' + p_0 e) \in \RLWE_{p q}(a \cdot s' + p_0 a e)
$$
By modulus switching, the ciphertext modulus is then $q$ again.

## Double CRT
