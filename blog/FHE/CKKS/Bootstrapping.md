# CKKS Bootstrapping

Bootstrapping is a technique to refresh the noises in FHE ciphertexts. In CKKS, the ciphertext requires bootstrapping when its level reaches 0 (the bottom). The aim for CKKS bootstrapping is to remove the modulus part $q_0 I$, as
$$ (a, b) = (a, - a s + m + e + q_0 I) \in \mathcal{R}^2 $$ 
A bootstrapping consists of three steps in general: Coefficients to Slots, Eval Mod, and Slots to Coefficients
