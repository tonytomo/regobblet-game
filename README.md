# Matryoshka Tic-Tac-Toe

_Working title — a Gobblet-style nested-piece tic-tac-toe for 2 players._

Tic-tac-toe, but every piece is a matryoshka doll. Larger pieces **gobble**
(cover) smaller ones, and pieces can be **moved** to reveal what's underneath.
Only the top visible piece counts. Line up your visible pieces to win.

---

## What is this?

Matryoshka Tic-Tac-Toe takes the familiar 3-in-a-row formula and adds two
twists:

1. **Nested pieces.** Each player has a set of pieces of increasing size
   (ranks). A larger piece can be placed on top of a smaller one, covering it.
2. **Movement and reveals.** On your turn you can either place a new piece
   from your reserve or move an existing top piece. Moving a piece off a
   square uncovers whatever was underneath — which may be yours, your
   opponent's, or nothing.

The result is a game of stacking, timing, and hidden information. It plays
like tic-tac-toe for the first few turns, then turns into a tense game of
gobbling and re-revealing.

---

## Quick start

1. Pick a board size: **3×3**, **4×4**, or **5×5**.
2. Read that board's rule file (see below).
3. Set up the board and each player's reserve.
4. Player 1 places or moves a piece. Players alternate.
5. First player to line up the required number of **visible** pieces wins.

Everything you need is in the per-board rule files. There is no separate
rulebook to learn first.

---

## Board sizes at a glance

| Board   | Win condition | Pieces/player (default) | Game feel                   | Rules                                |
| ------- | ------------- | ----------------------: | --------------------------- | ------------------------------------ |
| **3×3** | 3 in a row    |           6 (ranks 1–6) | Quick, sharp, tactical      | [`rules-3x3.md`](specs/rules-3x3.md) |
| **4×4** | 4 in a row*   |           9 (ranks 1–9) | Medium; movement matters    | [`rules-4x4.md`](specs/rules-4x4.md) |
| **5×5** | 4 in a row    |         12 (ranks 1–12) | Long; reveal-driven endgame | [`rules-5x5.md`](specs/rules-5x5.md) |

\* 4×4 also supports a faster **3-in-a-row** mode — see its rule file.

Each rule file includes its own recommended presets and optional variants
(balanced piece distributions, stack caps, alternative win lengths, and more).

---

## Core rules (shared across all boards)

These apply to every board size. Full details are in each rule file, but the
short version is:

- **Turn action:** place a reserve piece **or** move one of your top pieces.
- **Gobbling:** a piece may be placed only on an empty square or on a
  **strictly smaller** top piece. Equal or larger pieces cannot be covered.
- **Covering your own pieces:** allowed (sometimes useful, often wasteful).
- **Moving:** only **top** pieces can be moved; moving one reveals whatever
  was underneath.
- **Winning:** only **top visible** pieces count. Lines are checked after
  every move, including revealing moves.
- **Draws:** threefold repetition, or an optional move limit.
- **No passing:** if you can act, you must act.
- **Open information:** both players' reserves are visible to each other.

---

## Which board should I play?

- **New to the game?** Start with **3×3**. It teaches the core loop in 10–15
  minutes.
- **Want the best overall experience?** **4×4** with **3-in-a-row** is the
  sweet spot for most groups — enough space for movement to matter, fast
  enough to stay tense.
- **Want a longer, more strategic game?** **5×5** with **4-in-a-row** and the
  **balanced distribution** variant (16 pieces: 2× ranks 1–4).
- **Party / chaos:** 5×5 with **3-in-a-row**, or any board with the maximum
  piece count.

---

## Design notes

A few principles shaped the defaults:

- **Piece counts scale sub-linearly with board area.** 6 pieces on 9 squares,
  9 on 16, 12 on 25. This keeps reserves meaningful without letting the top
  ranks dominate.
- **Win length does not always equal board size.** 5-in-a-row on 5×5 is
  overly defensive; 4-in-a-row keeps the board lively. Each rule file explains
  its choice.
- **"One unique piece per rank" is the default, but balanced distributions
  are recommended for 4×4 and 5×5.** Duplicating low ranks gives players
  cheap tempo moves and keeps the endgame from becoming a top-doll hoard.
- **Movement and reveals are core, not optional.** They turn the game from
  pure gobbling into a deeper positional puzzle.

---

## Repository structure

```
matryoshka-tic-tac-toe/
├── README.md ← you are here
├── rules-common.md ← shared rules (turn structure, placement,
│ movement, winning, draws, variants)
├── rules-3x3.md ← 3×3 board-specific rules
├── rules-4x4.md ← 4×4 board-specific rules
└── rules-5x5.md ← 5×5 board-specific rules
```

**How to read the rules:** start with `rules-common.md` for the shared
mechanics, then read the board file for your chosen size. Board files
reference common sections by number (e.g. "see §3").

---

## Status & roadmap

- [x] 3×3 rules
- [x] 4×4 rules
- [x] 5×5 rules
- [x] Extract shared rules into `rules-common.md`
- [ ] Settle default piece distribution per board (1-per-rank vs balanced)
- [ ] Playtest and tune win conditions
- [ ] Optional: digital implementation notes (stack indicators, buried-piece
      previews, repetition detection)

---

## License / attribution

Rules are original. The nested-piece gobbling mechanic is inspired by
**Gobblet / Gobblet Gobblers** (Blue Orange Games); this variant differs in
piece distribution, movement rules, board scaling, and win conditions.

---

_Suggestions, playtest reports, and rule variants are welcome._
