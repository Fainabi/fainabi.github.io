# Normalization

During training a DL model, the input of each layer vary and may yield a very different distribution after epochs. It is called **interval covariant shift**. Covariant shift means the distribution of input changes between training and inference phases. We recommend to see [medium](https://becominghuman.ai/all-about-normalization-6ea79e70894b) for an intuitive view.

## Types of Normalization

### Batch Normalization

For a batch $x_1, \cdots, x_N$ with mean $\mu$ and variance $\sigma^2$ (feature-wise), the batch normalization is performed over the batch:
$$ \hat{x}_i = \frac{x_i - \mu}{\sqrt{\sigma^2 + \epsilon}} $$
then the output of batch normalization is
$$ y_i = \gamma \hat{x}_i + \beta $$
with learnable $\gamma, \beta$.

Batch normalization usually requires a relative large batch size and could not apply to inference pretty well (as they are not too batched).

### Layer Normalization

Layer normalization normalizes **each** sample along their features, that means for each point $x_i \in \mathbb{R}^n$, calculate $\mu_i = \sum_j x_{i j} / n, \sigma_i^2 = \sum_j (x_{i j} - \mu_j)^2 / n$, and then normalization is performed feature-wise:
$$ \hat{x}_i = \frac{x_i - \mu_i}{\sqrt{\sigma_i^2 + \epsilon}} $$
and then apply a shifting:
$$ y_i = \gamma \hat{x}_i + \beta $$

Layer normalization can stabilize learning much. One reason is that the input is now mapped to the unit hyper-sphere ($S^n$) first, making every entry point follow an identical distribution (thus satisfying i.i.d assumption). That's kind like BitNet to make the distribution over hypercube, isn't it?

### Group/Instance Normalization

Based on layer normalization, but now separate a number of groups, and normalize each group individually. That mean a direct decouple of variables, which makes huge sense for CNNs as the channels naturally invoke some meaning of group partition. When each channel represents a group, it becomes instance normalization. See [4] for some visualization.

### Weight Normalization

Unlike normalizing the inputs, weight normalization normalizes the parameters during training. It is also called (as a kind of) reparameterization. For a weight matrix $\boldsymbol{w}$, the reparametrization is
$$ \boldsymbol{w} = \frac{g}{\|\boldsymbol{v}\|} \boldsymbol{v} $$
for the learnable $\boldsymbol{v}$ and $g$. The gradients are
$$ \nabla_g L = \frac{\nabla_\boldsymbol{w} L \cdot \boldsymbol{v}}{\|\boldsymbol{v}\|}, \quad
    \nabla_\boldsymbol{v} L = \frac{g}{\|\boldsymbol{v}\|} \nabla_\boldsymbol{w} L - \frac{g \nabla_g L}{\|\boldsymbol{v}\|^2} \boldsymbol{v} $$
Furthermore,
\[
\begin{align}
    \nabla_\boldsymbol{v} L &= \frac{g}{\|\boldsymbol{v}\|} \nabla_\boldsymbol{w} L - \frac{g \nabla_g L}{\|\boldsymbol{v}\|^2} \boldsymbol{v} \\
    &= \frac{g}{\|\boldsymbol{v}\|} \left(I - \frac{\boldsymbol{w} \boldsymbol{w}^\dagger}{\|\boldsymbol{w}\|^2}\right) \nabla_\boldsymbol{w} L
\end{align}
\]
which means the gradient $\nabla_\boldsymbol{v} L$ is orthogonal to $\boldsymbol{w}$, therefore $\boldsymbol{v}$. That's pretty nice to make te shape of distribution of $\boldsymbol{v}$ become a sphere.

An interesting conclusion mentioned in [5] is weight normalization is equivalent to batch normalization on the pre-activations.

### Weight Standardization

Weight standardization is a fused technique of batch normalization, layer normalization and weight normalization, where the weight is parameterized as 
$$ \hat{W} = \frac{W - \bar{W}}{\sqrt{\bar{W^2} - \bar{W}^2}} $$
which removes parameter $g$ (as the weight is standardized). Such setting is to standardize both the parameter distribution and input distribution. The merit, as [4] points out, is the smoothness of loss landscape and avoiding elimination singularities. 


## Bibliography

1. Sergey Ioffe, Christian Szegedy: Batch Normalization: Accelerating Deep Network Training by Reducing Internal Covariate Shift. ICML 2015: 448-456

2. Lei Jimmy Ba, Jamie Ryan Kiros, Geoffrey E. Hinton: Layer Normalization. CoRR abs/1607.06450 (2016)

3. Dmitry Ulyanov, Andrea Vedaldi, Victor S. Lempitsky: Instance Normalization: The Missing Ingredient for Fast Stylization. CoRR abs/1607.08022 (2016)

4. Siyuan Qiao, Huiyu Wang, Chenxi Liu, Wei Shen, Alan Yuille: Micro-Batch Training with Batch-Channel Normalization and Weight Standardization, CoRR abs/1903.10520

5. Tim Salimans, Diederik P. Kingma: Weight Normalization: A Simple Reparameterization to Accelerate Training of Deep Neural Networks. NIPS 2016: 901