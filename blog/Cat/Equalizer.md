# Equalizer

:::meta
quickview : $\text{eq} \stackrel{e}{\rightarrow} X \stackrel{f}{\underset{g}{\rightrightarrows}} Y$
tags : limit
:::

An equalizer for a pair or morphisms $f, g: X \rightarrow Y$ is a morphism $e: \text{eq} \rightarrow x$ such that $f e = g e$ is a limit, i.e.
$$
    \text{eq} \stackrel{e}{\rightarrow} X \stackrel{f}{\underset{g}{\rightrightarrows}} Y
$$
and for all $h: Z \rightarrow X$ s.t. $f h = g h$, $h$ factors through $e$.

In type theory, the equalizer
$$
P \rightarrow A \stackrel{f}{\underset{g}{\rightrightarrows}} B
$$
is defined as $P \cong \sum_{a : A} f(a) = g(a)$.


:::remark idea
An equalizer finds the maximum agreed parts of two views.
:::