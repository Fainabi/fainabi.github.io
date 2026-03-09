# Four-Part Harmony

Below are common chord connections in C major with figured bass and basic SATB realizations.

## 1) I - IV - V - I

:::lilypond block
mode = { \key c \major \time 4/4 }
soprano = \relative c'' { \mode e1 f1 g1 e1 }
alto    = \relative c'  { \mode g1 a1 b1 g1 }
tenor   = \relative c'  { \clef "treble_8" \mode c1 c1 d1 c1 }
bass    = \relative c   { \clef bass \mode c1 f1 g1 c1 }

<<
  \new StaffGroup <<
    \new Staff \with { instrumentName = "S" } { \soprano }
    \new Staff \with { instrumentName = "A" } { \alto }
    \new Staff \with { instrumentName = "T" } { \tenor }
    \new Staff \with { instrumentName = "B" } { \bass }
  >>
  \new FiguredBass {
    \figuremode {
      <5 3>1 <5 3>1 <5 3>1 <5 3>1
    }
  }
  \new Lyrics \lyricmode {
    \markup { I }1 \markup { IV }1 \markup { V }1 \markup { I }1
  }
>>
:::

## 2) I6 - IV - V - I

:::lilypond block
mode = { \key c \major \time 4/4 }
soprano = \relative c'' { \mode g1 a1 g1 e1 }
alto    = \relative c'  { \mode c1 c1 d1 c1 }
tenor   = \relative c'  { \clef "treble_8" \mode e1 f1 b1 g1 }
bass    = \relative c   { \clef bass \mode e1 f1 g1 c1 }

<<
  \new StaffGroup <<
    \new Staff \with { instrumentName = "S" } { \soprano }
    \new Staff \with { instrumentName = "A" } { \alto }
    \new Staff \with { instrumentName = "T" } { \tenor }
    \new Staff \with { instrumentName = "B" } { \bass }
  >>
  \new FiguredBass {
    \figuremode {
      <6>1 <5 3>1 <5 3>1 <5 3>1
    }
  }
  \new Lyrics \lyricmode {
    \markup { I6 }1 \markup { IV }1 \markup { V }1 \markup { I }1
  }
>>
:::

## 3) ii6 - V - I

:::lilypond block
mode = { \key c \major \time 4/4 }
soprano = \relative c'' { \mode a1 b1 c1 }
alto    = \relative c'  { \mode d1 d1 c1 }
tenor   = \relative c'  { \clef "treble_8" \mode f1 g1 e1 }
bass    = \relative c   { \clef bass \mode f1 g1 c1 }

<<
  \new StaffGroup <<
    \new Staff \with { instrumentName = "S" } { \soprano }
    \new Staff \with { instrumentName = "A" } { \alto }
    \new Staff \with { instrumentName = "T" } { \tenor }
    \new Staff \with { instrumentName = "B" } { \bass }
  >>
  \new FiguredBass {
    \figuremode {
      <6>1 <5 3>1 <5 3>1
    }
  }
  \new Lyrics \lyricmode {
    \markup { ii6 }1 \markup { V }1 \markup { I }1
  }
>>
:::

## 4) Cadential 6-4 to V to I

:::lilypond block
mode = { \key c \major \time 4/4 }
soprano = \relative c'' { \mode c1 b1 c1 }
alto    = \relative c'  { \mode g1 g1 g1 }
tenor   = \relative c'  { \clef "treble_8" \mode e1 d1 e1 }
bass    = \relative c   { \clef bass \mode g1 g1 c1 }

<<
  \new StaffGroup <<
    \new Staff \with { instrumentName = "S" } { \soprano }
    \new Staff \with { instrumentName = "A" } { \alto }
    \new Staff \with { instrumentName = "T" } { \tenor }
    \new Staff \with { instrumentName = "B" } { \bass }
  >>
  \new FiguredBass {
    \figuremode {
      <6 4>1 <5 3>1 <5 3>1
    }
  }
  \new Lyrics \lyricmode {
    \markup { I6/4 }1 \markup { V }1 \markup { I }1
  }
>>
:::
