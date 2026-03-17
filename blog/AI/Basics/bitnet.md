# BitNet

Quantization is an effective way to scale down LLM size, and as an acme, all parameters set to (nearly) one bit can significantly reduce LLM scale. That's BitNet family, created by [GeneralAI](https://aka.ms/GeneralAI).

## Preliminaries

**Absmax Quantization**: Let $x$ be a list of numbers for quantization, then the absmax quantization is
$$x \mapsto \operatorname{Clip}\left(x \times \frac{Q_b}{\gamma}, -Q_b + \varepsilon, Q_b - \varepsilon\right)$$ 
where $\gamma = \|x\|_{\infty}$ and $\operatorname{Clip}(x, a, b) = \max(a, \min(b, x))$.


## Bibliography

1. Hongyu Wang, Shuming Ma, Li Dong, Shaohan Huang, Huaijie Wang, Lingxiao Ma, Fan Yang, Ruiping Wang, Yi Wu, Furu Wei: BitNet: Scaling 1-bit Transformers for Large Language Models. CoRR abs/2310.11453 (2023)

2. Jinheng Wang, Hansong Zhou, Ting Song, Shijie Cao, Yan Xia, Ting Cao, Jianyu Wei, Shuming Ma, Hongyu Wang, Furu Wei: Bitnet.cpp: Efficient Edge Inference for Ternary LLMs. CoRR abs/2502.11880 (2025)

2. 
