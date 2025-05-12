# Attention Mechanism

## Idea

Attention mechanism merges information from some context to input embeddings.

More formally, let $\{(k_i, v_i)\} \subset \mathcal{K}\times\mathcal{V}$ be a set of points (keys and values), and $q$ is the query embedding. Attention is a two-step mapping:
$$
\begin{gathered}
    w_i = \operatorname{Similarity}(k_i, q) \\
    h = \operatorname{Aggregate}(\{w_i\}, \{v_i\})
\end{gathered}
$$


## Types of Attention

### Scaled Dot-Product Attention

The vanilla attention in *Attention is all you need* is composed with a (somehow) **cosine similarity** and **softmax aggregation**:
$$
\begin{gathered}
    w_i = \frac{\langle q, k_i\rangle}{\sqrt{d_k}} \\
    h = \langle\operatorname{Softmax}(\boldsymbol{w}), \boldsymbol{v}\rangle
\end{gathered}
$$
where $\langle \cdot,\cdot\rangle$ is the inner product operator, and $d_k$ is for $k_i \in \mathbb{R}^{d_k}$.

The scale factor $\sqrt{d_k}$ is normalization. Say each component of $k_i$ and $q$ follow the Gaussian distribution with zero mean and unit std, so 
$$\langle q, k_i\rangle \sim \mathcal{N}(0, d_k)$$
Scaling it with $1/\sqrt{d_k}$ brings back to the Gaussian distribution with unit std. To ensure the $k_i$ and $q$ are really in unit std, the layer norm is applied just before the attention performed. 

See [StackExchange](https://ai.stackexchange.com/questions/41861/why-use-a-square-root-in-the-scaled-dot-product), [GPT2 paper](https://cdn.openai.com/better-language-models/language_models_are_unsupervised_multitask_learners.pdf) and [Learning Deep Transformer Models for Machine Translation](https://arxiv.org/pdf/1906.01787) for discussion.

### Additive Attention

The only difference to the (vanilla) attention is the similarity is replaced by a sum wrapped by a tanh:
$$ w_i = \tanh (q + k_i) $$
or using a neural network. A neural network is more expensive in time and space matrix multiplication (the inner product in dot-product attention). That's one reason we prefer dot-product attention for LLM.

### Masked Attention

In the transformer decoder, an mask is added into the input embeddings to make sure the future tokens does not affect historical tokens (GPTs). More formally,
$$ \operatorname{Masked-Attention}(Q, K, V) = V \cdot \operatorname{softmax}\left(\frac{1}{\sqrt{d_k}}\langle Q,K \rangle + M\right) $$
where $M$ is a strictly lower triangle (for $V$ the concatenation of column vectors) where each element below the diagonal is $-\infty$.

### Multi-head Attention

The dimension $d_k$ can be quite large, and a straight idea is to decouple such space:
$$ 
\begin{gathered}
Q \mapsto (Q_1, Q_2, \cdots, Q_m)  \\
K \mapsto (K_1, K_2, \cdots, K_m)  \\
V \mapsto (V_1, V_2, \cdots, V_m)
\end{gathered}
$$
Each of the $(Q_i, K_i, V_i)$ forms a head, and each head of attention is the normal attention introduced above. The output of each head are concatenated (as direct sum) for the downstream structure.

### Attention without Softmax

Softmax incurs exponential operator, which is one of the main obstacle of efficiency. 

See [Linear Transformers are Secretly Fast Weight Programmers](https://arxiv.org/pdf/2102.11174)

## Analysis on Attention

As it is mentioned at the top, attention is a method for merging context information. A common constraint is that the dimension of output is $O(1)$ (which is $d_v$ here), which means the growing context would not affect the output dimension. One may argue that, well if I memorize long long sentences as the context, the information I've got must be significantly greater than a context made form shorter sentences. That's true, but not a problem for self attention, as the output number of embeddings are kept same to inputs. 

Attention, in its form, is a function $\mathcal{K} \rightarrow \mathcal{V}$, the distance between $q, k_i$ implies the distance between $\operatorname{Attn}(q, K, V)$ and $v_i$. A direct and simple solution is to sample the function in the linear transformations $\operatorname{Hom}(\mathcal{K}, \mathcal{V})$. Unfortunately, linear transformations does not catch the context we want, as $f(q) = f(q; K, V)$ for $f \in \operatorname{Hom}(\mathcal{K}, \mathcal{V})$. 

Let's see what attention does. In attention encoder, there are four spaces $\mathcal{Z}, \mathcal{Q}, \mathcal{K}, \mathcal{V}$, and an input $Z \in \mathcal{Z}^n$. The queries, keys and queries are from inputs with linear transformations:
$$ 
\begin{aligned}
W_Q : \mathcal{Z} \rightarrow Q, W_K : \mathcal{Z} \rightarrow \mathcal{K}, W_V : \mathcal{Z} \rightarrow \mathcal{V} \\
Q = W_Q Z, K = W_K Z, V = W_V Z 
\end{aligned}
$$

A linear transformation from $\mathcal{Z} \rightarrow \mathcal{V}$ makes sense, as the linear transformation preserves linear combination:
$$ W_V (\langle \boldsymbol{w}, \boldsymbol{x} \rangle) = \langle \boldsymbol{w}, W_V \boldsymbol{x} \rangle $$
Then that seems an optimization for attention by performing aggregation first, as in [DeepSeek-v2](https://arxiv.org/pdf/2405.04434) says such matrix can be absorbed into a following feed-forward network (which is a matrix multiplication). Therefore performing self-attention in the value space $\mathcal{V}$ is equivalent to that in input space $\mathcal{Z}$. And by a similar analysis, 
$$ \langle W_Q Z, W_K Z \rangle = \langle Z, W_Q^\top W_K Z \rangle $$ 
Therefore these only exits a single matrix $W := W_Q^\top W_K$ for attention as:
$$ \operatorname{Self-Attention}(X) = X \cdot \operatorname{Softmax}(X^\top W X)$$

The softmax operator is somewhere regarded as a kernel function to $q, k$. 

## Bibliography

1. **Concepts about Transformer, multi-head attention.** Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan N. Gomez, Lukasz Kaiser, Illia Polosukhin:
Attention is All you Need. NIPS 2017.

2. **Analysis on pre-norm layers, and adding more paths to bottom layers called DLCL (Dynamic Linear Combination of Layers).** Qiang Wang, Bei Li, Tong Xiao, Jingbo Zhu, Changliang Li, Derek F. Wong, Lidia S. Chao: Learning Deep Transformer Models for Machine Translation. ACL 2019.

3. **Replace softmax with kernel function to make transformer linearly accumulative.** Imanol Schlag, Kazuki Irie, Jürgen Schmidhuber: Linear Transformers Are Secretly Fast Weight Programmers. ICML 2021.