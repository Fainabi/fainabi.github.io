# Initialization

## Types of initialization

**Constant Initialization**. Assign all parameter to a same value. It introduces symmetry during training, which may harm performance.

**Random Initialization**. Sample parameters from some distributions (e.g. Gaussian and uniform).

**Xavier Initialization**. Sample parameters from some distributions to make the variables in NN set in norm 1.
Say $y = W x$, and $E\begin{bmatrix}W\end{bmatrix} = 0$ for $W \in \mathbb{R}^{n \times m}$, then analyze the variance of linear transformation and ReLU:
$$ 
D\begin{bmatrix}y_i\end{bmatrix} = D\begin{bmatrix}\sum_j W_{i j} x_j\end{bmatrix} = n D\begin{bmatrix} W_{i j} x_j\end{bmatrix} = n D\begin{bmatrix}W_{i j}\end{bmatrix} E\begin{bmatrix}x_j^2\end{bmatrix}
$$
where $D(\cdot)$ is the variance. Therefore $W_{i j} \sim N(0, \frac{1}{n})$ can make the variance of output random variables to be 1. 

When consider back propagation, the distribution is $N(0, \frac{1}{m})$ similarly. Therefore a harmonic mean can be taken as $N(0, \frac{2}{n + m})$.

**Kaiming Initialization**. Keiming initialization considers activating function. For ReLU activation, by setting $W$ follows symmetric distribution and bias to zero, then $x$ are symmetric and
$$ E\begin{bmatrix}\operatorname{ReLU}^2(x)\end{bmatrix} = \int_{0}^{\infty} p(x) x^2 \mathrm{d}x = \int_{-\infty}^{\infty} p(x) x^2 \mathrm{d}x = 
\frac{1}{2}D \begin{bmatrix}x\end{bmatrix} $$
Then the initialization distribution should change from $N(0, \frac{1}{n})$ to $N(0, \frac{2}{n})$.

## Bibliography

1. Kaiming He, Xiangyu Zhang, Shaoqing Ren, Jian Sun: Delving Deep into Rectifiers: Surpassing Human-Level Performance on ImageNet Classification. ICCV 2015: 1026-1034