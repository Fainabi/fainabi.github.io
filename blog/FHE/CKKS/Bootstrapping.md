# CKKS Bootstrapping

:::meta
title : Bootstrapping for Approximate Homomorphic Encryption
authors : Jung Hee Cheon, Kyoohyung Han, Andrey Kim, Miran Kim, and Yongsoo Song
publication : EUROCRYPT 2018
reference : EC:CHKKS18
url : https://link.springer.com/chapter/10.1007/978-3-319-78381-9_14, https://eprint.iacr.org/2018/153
tags : FHE, CKKS, Bootstrapping
:::

:::flashcards
$\mathcal{R}$ : $\Z[X]/(X^N+1)$
$\RLWE_{Q}(m)$ : RLWE ciphertexts in $\mathcal{R}_Q^2$ encrypting $m$
$\sigma$ : canonical embedding
$\zeta$ : $\exp(\sqrt{-1}\pi/N)$
$\zeta_i$ : $\zeta^{5^i}$
:::

Bootstrapping is a technique to refresh the noises in FHE ciphertexts. In CKKS [[AC:CKKS17]](Scheme.md), the ciphertext requires bootstrapping when its level reaches 0 (the bottom). The aim for CKKS bootstrapping is to remove the modulus part $q_0 I$, as
$$ (a, b) = (a, - a s + m + e + q_0 I) \in \mathcal{R}^2 $$ 
A bootstrapping consists of five steps in general: ModRaise, Partial Sum, Coefficients to Slots (CtS), Eval Mod, and Slots to Coefficients (StC).

Briefly, the bootstrapping procedure is
$$
\RLWE_{q_0}(m) \stackrel{\ModRaise}{\rightarrow} \RLWE_{Q_L}(m + q_0 I) \stackrel{\CtS}{\rightarrow} \RLWE_{Q'}(\iDFT\of{m + q_0 I}) \stackrel{\EvalMod}{\rightarrow} \RLWE_{Q''}(\iDFT(m)) \stackrel{\StC}{\rightarrow} \RLWE_{Q'''}(m)
$$
If the message $m$ is in some subring $\Z[Y]/(Y^{N'}+1) \subseteq \Z[X]/(X^N+1)$ where $Y=X^{N/N'}$, a partial sum step is required between ModRaise and CtS:
$$
\RLWE_{q_0}(m(Y)) \stackrel{\ModRaise}{\rightarrow} \RLWE_{Q_L}(m(Y) + q_0 I(X)) \stackrel{\mathsf{PartialSum}}{\rightarrow} \RLWE_{Q_L}(m(Y) + q_0 I'(Y)) \stackrel{\CtS}{\rightarrow} \RLWE_{Q'}(\iDFT\of{m + q_0 I'})
$$
`iDFT` here refers to the inverse DFT opertaion in the subring, rather than the orginal ring.

## ModRaise

Raise the modulus from $\mathcal{R}_{q_0}$ to $\mathcal{R}_{Q_L}$. For RNS CKKS, it needs basis convertion [[SAC:CHKKS18]](CKKS-RNS.md).

## Partial Sum

The target of partial sum is to keep the coefficients embedded from the subring $\Z[Y]/(Y^{N'}+1)$, and zerorize all other coefficients. For exmple, let $N=16, N'=4$, then the partail sum step accepts a ciphertext encrypting
$$
m_0 + m_1 X + m_2 X^2 + m_3 X^3 + m_4 X^4 + m_5 X^5 + \cdots + m_{15}X^{15}
$$
and output a new ciphertext whose message is
$$
m_0 + m_4 X^4 + m_8X^8 + m_{12}X^{12}
$$
Note that $Y=X^4$ therefore all the coefficient indices that not divided by 4 are removed.


## Coeffcients-to-Slots

The CtS step semantically moves the coefficients of polynomial in $\mathcal R$ to the slots in $\C^{N/2}$, using homomorphic inverse discrete fourier transformation (iDFT).

\[
\begin{CD}
    \mathcal{R} @>\sigma>> \C^{N/2} \\
    @. @. \\
    m(X) @>>> \sigma(m) \\
    @V{\iDFT}VV @V{\sigma^{-1}}VV \\
    \iDFT(m) @>>> m
\end{CD}
\]

Let $\zeta_i = \zeta^{5^i}$, where $\zeta = \exp(\sqrt{-1}\pi/N)$. Also note that $n = N/2$. The DFT matrix is
$$
\DFT = 
\left(\kern{-3em}\phantom{\begin{matrix}\zeta_0^{N/2-1} \\ \zeta_1^{N/2-1} \\ \vdots \\ \zeta_{n-1}^{N/2-1}\end{matrix}}\right.
\underbrace{
\begin{matrix}
    1 & \zeta_0 & \cdots & \zeta_0^{N/2-1} \\
    1 & \zeta_1 & \cdots & \zeta_1^{N/2-1} \\
    \vdots & \vdots & \ddots & \vdots \\
    1 & \zeta_{n-1} & \cdots & \zeta_{n-1}^{N/2-1} \\
\end{matrix}
}_{U} 
\left.\kern{-3em}\phantom{\begin{matrix}\zeta_0^{N/2-1} \\ \zeta_1^{N/2-1} \\ \vdots \\ \zeta_{n-1}^{N/2-1}\end{matrix}}\right|
\underbrace{
\begin{matrix}
    \zeta_0^{N/2} & \zeta_0^{N/2+1} & \cdots & \zeta_0^{N-1} \\
    \zeta_1^{N/2} & \zeta_1^{N/2+1} & \cdots & \zeta_1^{N-1} \\
    \vdots & \vdots & \ddots & \vdots \\
    \zeta_{n-1}^{N/2} & \zeta_{n-1}^{N/2+1} & \cdots & \zeta_{n-1}^{N-1} \\
\end{matrix}
}_{\sqrt{-1}\cdot U}
\left.\kern{-3em}\phantom{\begin{matrix}\zeta_0^{N/2-1} \\ \zeta_1^{N/2-1} \\ \vdots \\ \zeta_{n-1}^{N/2-1}\end{matrix}}\right)
\in \C^{n\times N}
$$
which is separated into two matrices $(U || \sqrt{-1}\cdot U)$ as $X^{N/2} = \sqrt{-1}$. Such $U$ is also called the _special DFT matrix_ [[EC:CCS19]](ImprovedBootstrapping.md), satisfying $U^{-1} = \frac{1}{n}\bar{U}^T$. We use $i =\sqrt{-1}$ if there's no indices for $i$.
The inverse DFT transformation from $\C^{n}$ to $\mathcal{R}$ is then
$$
\iDFT(z \in \C^{n}) = \frac{1}{n} \cdot \bar{U}^T \cdot z 
$$
In the original bootstrapping paper, the form is $\iDFT(z) = \frac{1}{N}\cdot\of{{\DFT}^\dag\cdot z + \DFT^T\cdot \bar{z}} = \frac{1}{N}((\bar{U}^T; -i\bar{U}^T) \cdot z + (U^T; iU^T)\cdot \bar{z})$, for $(\cdot)^\dag$ the conjugative transpose. As a quick check, let $m_{\text{real}} + i m_{\text{imag}} = \iDFT(z)$, then

$$
U\cdot m_{\text{real}} + i U \cdot m_{\text{imag}} = U\cdot \iDFT(z) = \frac{1}{n}\cdot {U\bar{U}^T z} = z \label{eq:dft-m}
$$

:::remark remark
In EC:CHKKS18, the symbol $U$ represents $\DFT$. We use $U$ for an $n$-by-$n$ matrix for indicating a view of cyclotomic rings as ring extension of the ring of Gaussian integers $\C[Z]/(Z^{N/2}-i) \cong \Z[X]/(X^N+1)$.
:::

Under such settings, the CtS procedure is the homomorphic linear transformation where the matrix is $\frac{1}{n} \bar{U}^T$, followed by the extraction of real and imaginary parts.
$$
z_{\text{real}} = \frac{1}{2}(z + \bar{z}), 
z_{\text{imag}} = \frac{1}{2}(z - \bar{z}),
$$
by homomorphic conjugation and other operations.


## EvalMod

Polynomial approximation of modulo $q_0$, which is approximated by trigonometric function:
$$
[m]_q = \frac{q}{2\pi} \cdot \sin\of{\frac{2\pi}{q} \cdot m} + O(\epsilon^3 \cdot q)
$$
The period inside the sine function is therefore $q$. The Taylor polynomial for approximating the sine function is $S_d(t) = \frac{q}{2\pi} \sum_{j=0}^{d-1} \frac{(-1)^j}{(2j + 1)!} \of{\frac{2\pi t}{q}}^{2j+1}$

:::plot
title : Taylor Approximation of sin(2πt)
xmin : -4
xmax : 4
ymin : -2
ymax : 2
steps : 300
sub : 2 * PI * x
T64(t) : x - 0.16666666666666666*x**3 + 0.008333333333333333*x**5 - 0.0001984126984126984*x**7 + 2.7557319223985893e-06*x**9 - 2.505210838544172e-08*x**11 + 1.6059043836821613e-10*x**13 - 7.647163731819816e-13*x**15 + 2.8114572543455206e-15*x**17 - 8.22063524662433e-18*x**19 + 1.9572941063391263e-20*x**21 - 3.868170170630684e-23*x**23 + 6.446950284384474e-26*x**25 - 9.183689863795546e-29*x**27 + 1.1309962886447716e-31*x**29 - 1.216125041553518e-34*x**31 + 1.151633562077195e-37*x**33 - 9.67759295863189e-41*x**35 + 7.265460179153071e-44*x**37 - 4.902469756513544e-47*x**39 + 2.9893108271424046e-50*x**41 - 1.6552108677421951e-53*x**43 + 8.359650847182804e-57*x**45 - 3.866628513960594e-60*x**47 + 1.643974708316579e-63*x**49 - 6.446959640457172e-67*x**51 + 2.3392451525606576e-70*x**53 - 7.876246304918039e-74*x**55 + 2.4674957095607893e-77*x**57 - 7.2106829618959365e-81*x**59 + 1.9701319568021682e-84*x**61 - 5.043860616493007e-88*x**63
T32(t) : x - 0.16666666666666666*x**3 + 0.008333333333333333*x**5 - 0.0001984126984126984*x**7 + 2.7557319223985893e-06*x**9 - 2.505210838544172e-08*x**11 + 1.6059043836821613e-10*x**13 - 7.647163731819816e-13*x**15 + 2.8114572543455206e-15*x**17 - 8.22063524662433e-18*x**19 + 1.9572941063391263e-20*x**21 - 3.868170170630684e-23*x**23 + 6.446950284384474e-26*x**25 - 9.183689863795546e-29*x**27 + 1.1309962886447716e-31*x**29 - 1.216125041553518e-34*x**31
T16(t) : x - 0.16666666666666666*x**3 + 0.008333333333333333*x**5 - 0.0001984126984126984*x**7 + 2.7557319223985893e-06*x**9 - 2.505210838544172e-08*x**11 + 1.6059043836821613e-10*x**13 - 7.647163731819816e-13*x**15
:::

That is not a good approximation as the terms grow exponentially. Now since we are handling the sine (and cosine) series, by Euler's formula, the double angle identity can be applied:
$\cos(2 t) + i \sin(2 t) = \exp(2 i t) = \exp(i t)^2 = (\cos(t) + i \sin(t))^2$. In order to approximate $\sin(t)$, we therefore could approximate $\sin(t / 2^r)$ first.

Let $P_0(t) = \sum_{k=0}^{d_0}\frac{1}{k!}\of{2\pi it/(2^r \cdot q)}^k$, then by double-angle identity, compute $P_{j+1}(t) = P_j^2(t)$ for $j = 0, 1, \cdots, r$.

:::plot
title : Approximation with double angle
xmin : -4
xmax : 4
ymin : -2
ymax : 2
steps : 300
P(d0=6,r=5), deg=55 : 6.283185307179586*x - 41.341702240399755*x**3 + 81.60524927607504*x**5 - 76.70585968162348*x**7 + 42.05869261081533*x**9 - 15.094638424346101*x**11 + 3.819947414569988*x**13 - 0.7181188529137744*x**15 + 0.10422773065844447*x**17 - 0.012031180780861798*x**19 + 0.0011308405767511275*x**21 - 8.822238796630906e-05*x**23 + 5.804071359398938e-06*x**25 - 3.2633736651914106e-07*x**27 + 1.5861095806936065e-08*x**29 - 6.729846286644125e-10*x**31 + 2.5142322817583898e-11*x**33 - 8.333045074575442e-13*x**35 + 2.4665644041285293e-14*x**37 - 6.559122383544617e-16*x**39 + 1.5753127111412262e-17*x**41 - 3.433412549841217e-19*x**43 + 6.820120332534625e-21*x**45 - 1.239531197509398e-22*x**47 + 2.0685212766500478e-24*x**49 - 3.179804446587791e-26*x**51 + 4.516038801090031e-28*x**53 - 5.941576683242228e-30*x**55
P(d0=6,r=3), deg=47 : 6.283185307179586*x - 41.341702240399755*x**3 + 81.60524927607504*x**5 - 76.70556714342791*x**7 + 42.054111343557146*x**9 - 15.082669422191174*x**11 + 3.807426745988758*x**13 - 0.7110950299892556*x**15 + 0.10177398564586751*x**17 - 0.011446618662654092*x**19 + 0.001029956801596027*x**21 - 7.506265338669424e-05*x**23 + 4.465774346479831e-06*x**25 - 2.1773969735474034e-07*x**27 + 8.702344027818007e-09*x**29 - 2.840655828675089e-10*x**31 + 7.513143380199823e-12*x**33 - 1.5886492113122145e-13*x**35 + 2.630311103244179e-15*x**37 - 3.303120986412977e-17*x**39 + 2.9923022579590116e-19*x**41 - 1.7972322149880182e-21*x**43 + 6.090780738352173e-24*x**45 - 7.794812808779939e-27*x**47
P(d0=6,r=1), deg=11 : 6.283185307179586*x - 41.341702240399755*x**3 + 81.60524927607504*x**5 - 75.50733069441978*x**7 + 34.501272376673846*x**9 - 6.810278193840058*x**11
:::

The degree of polynomial is similar to Taylor polynomials, but the evaluation number reduces via double-angle evaluations.

## Slots-to-Coefficients

Homomorphic evaluating DFT matrix so the data in slots are moved to the coefficients. The real and imaginary parts are packed together first, like:
$$
\ct = \ct_{\real} + X^{N/2} \cdot \ct_{\imag}
$$
then performing homomorphic linear transformation by the matrix of $\DFT$ as Equation $\eqref{eq:dft-m}$ indicates.


## Appendix

:::snippet python : Generate Taylor polynomial for sin(x)
from math import factorial

def taylor_sin(degree):
    """Print the Taylor polynomial of sin(x) up to given degree."""
    terms = []
    for n in range(degree + 1):
        if n % 2 == 0:
            continue
        sign = (-1) ** ((n - 1) // 2)
        coeff = sign / factorial(n)
        if coeff == 1:
            term = f"x" if n == 1 else f"x**{n}"
        elif coeff == -1:
            term = f"-x" if n == 1 else f"-x**{n}"
        else:
            term = f"{coeff}*x**{n}"
        terms.append(term)
    expr = " + ".join(terms).replace("+ -", "- ")
    print(f"T{degree}(x) : {expr}")

for d in [16, 32, 64]:
    taylor_sin(d)
:::

:::snippet python : Double-angle P(t) series for EvalMod
import numpy as np
from math import factorial

def evalmod_poly(d0, r):
    """
    Compute the EvalMod polynomial via double-angle identity.

    P0(t) = sum_{k=0}^{d0} (2*pi*i*t)^k / k!   (Taylor of exp)
    P_{j+1}(t) = P_j(t)^2,  for j = 0..r-1

    After r squarings, Im(P_r(t)) ≈ sin(2*pi*t).

    Returns (real_coeffs, imag_coeffs) as numpy arrays,
    where index i is the coefficient of t^i.
    """
    # Build P0 coefficients: coeff of t^k is (2*pi*i)^k / k!
    # Split into real & imaginary from the start.
    # (2*pi*i)^k / k! has a cycle of length 4:
    #   k%4==0: +alpha^k / k!   (real)
    #   k%4==1: +alpha^k / k! i (imag)
    #   k%4==2: -alpha^k / k!   (real)
    #   k%4==3: -alpha^k / k! i (imag)
    alpha = 2 * np.pi / (2**r)
    re = np.zeros(d0 + 1)
    im = np.zeros(d0 + 1)
    for k in range(d0 + 1):
        mag = alpha**k / factorial(k)
        if k % 4 == 0:
            re[k] = mag
        elif k % 4 == 1:
            im[k] = mag
        elif k % 4 == 2:
            re[k] = -mag
        else:
            im[k] = -mag

    # Repeated squaring: (a + bi)^2 = (a^2 - b^2) + 2ab*i
    for _ in range(r):
        new_re = np.convolve(re, re) - np.convolve(im, im)
        new_im = 2 * np.convolve(re, im)
        re, im = new_re, new_im

    return re, im

def format_poly(coeffs, label):
    """Format coefficients as a plot-block expression string."""
    terms = []
    for k, c in enumerate(coeffs):
        if abs(c) < 1e-30:
            continue
        if k == 0:
            terms.append(f"{c}")
        elif k == 1:
            terms.append(f"{c}*x")
        else:
            terms.append(f"{c}*x**{k}")
    expr = " + ".join(terms).replace("+ -", "- ")
    print(f"{label} : {expr}")

# Example: d0=6, r=3  =>  degree-6 Taylor, 3 squarings
for d0, r in [(6, 1), (6, 3), (6, 5)]:
    _, im_coeffs = evalmod_poly(d0, r)
    format_poly(im_coeffs, f"P(d0={d0},r={r})")
:::

:::interests
Noise analysis
:::


