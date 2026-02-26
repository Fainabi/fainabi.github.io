# Coequalizer

:::meta
quickview : $X \stackrel{f}{\underset{g}{\rightrightarrows}} Y \stackrel{p}{\rightarrow} \text{coeq}$
tags : colimit
:::


A coequalizer for a pair of morphism $f,g : X \rightarrow Y$ is a morphism $p: Y \rightarrow \text{coeq}$ such that $p f = p g$ is a colimit, i.e.
$$
    X \stackrel{f}{\underset{g}{\rightrightarrows}} Y \stackrel{p}{\rightarrow} \text{coeq}
$$
and for all $h: Y \rightarrow Z$ s.t. $h f = h g$, $h$ factors through $p$.

:::remark idea
A coequalizer finds the maximum parts that make two views agreed.
:::

Coequalizer is a quotient.

:::remark idea
A coequalizer adheres the target objects, and views them as equal (quotient).
:::