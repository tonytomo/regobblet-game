# Matryoshka Tic-Tac-Toe — 5×5 Rules

Read alongside [`rules-common.md`](rules-common.md), which defines turn
structure, placement, movement, winning checks, draws, and universal variants.
**This file covers only what's specific to the 5×5 board.**

---

## Quick reference

| Item              | Default                       |
| ----------------- | ----------------------------- |
| Board             | 5×5 (25 squares)              |
| Pieces per player | 12, ranks 1–12, one of each   |
| Win condition     | 4 in a row _(not 5 — see §4)_ |
| Move limit        | 80 moves                      |

---

## §1. Board overview

The 5×5 is the large variant: more squares, more ranks, deeper stacks.
Reserves run out fairly quickly relative to board size, so the late game is
dominated by **moving and revealing** rather than placing. Board readability
and stack management matter more here than on smaller boards.

Play follows `rules-common.md` §2–§7. Only the numbers below are
board-specific.

---

## §2. Components

- **Board:** 5×5 grid (25 squares).
- **Pieces:** Each player has ranks **1–12**, one of each (**12 pieces per
  player**).
- Total: 24 pieces across both players.

Distribution per player:

| Rank  | 1   | 2   | 3   | 4   | 5   | 6   | 7   | 8   | 9   | 10  | 11  | 12  |
| ----- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Count | 1   | 1   | 1   | 1   | 1   | 1   | 1   | 1   | 1   | 1   | 1   | 1   |

**Board-vs-piece math:** 24 pieces vs 25 squares means the board can never
be fully occupied by single pieces, and **reserves will reliably run out** in
longer games.

---

## §3. Setup

1. Place the empty 5×5 board between the players.
2. Each player takes their 12 pieces as their reserve.
3. Decide who goes first. Swap after each game.

---

## §4. Win condition

**Four of your visible top pieces in a straight line** (row, column, or
diagonal) — you win immediately.

**Why 4-in-a-row and not 5:**

| Win length     | Winning lines | Feel                                                                        |
| -------------- | ------------: | --------------------------------------------------------------------------- |
| **4 in a row** |        **28** | **Default.** Tense, tactical, plenty of threats.                            |
| 5 in a row     |            12 | Very restrictive. Covering one square blocks many lines. Grindy, defensive. |
| 3 in a row     |            44 | Very fast, chaotic. Party variant only.                                     |

Five-in-a-row gives only 12 lines on 25 squares, which combined with
gobbling makes the game extremely defensive. Four-in-a-row keeps the board
lively while still rewarding long-term building.

Wins are checked after every move, including revealing moves (see
`rules-common.md` §5).

---

## §5. Draw rules

- Threefold repetition applies (`rules-common.md` §6).
- **Move limit:** 80 consecutive moves with no win → draw. Adjustable.

---

## §6. Board-specific variants

| Variant                   | Change                                                                                                                                    |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| **Balanced distribution** | **16 pieces/player: 2× ranks 1–4, 1× ranks 5–12.** **Strongly recommended.** Softens top-rank hoarding; keeps low ranks useful for tempo. |
| **Heavy balanced**        | **18 pieces/player: 2× ranks 1–5, 1× ranks 6–12.** Even more tempo play.                                                                  |
| **Long win**              | Win with **5 in a row** (12 lines). Positional, defensive, grindy.                                                                        |
| **Fast win**              | Win with **3 in a row** (44 lines). Chaotic party mode.                                                                                   |
| **Fewer sizes**           | 8–9 pieces/player. Sharper, less top-heavy.                                                                                               |
| **More sizes**            | 13–15 pieces/player. Maximum chaos; top ranks dominate.                                                                                   |

Universal variants (no-reveal-win, no moving, stack cap) are in
`rules-common.md` §8.

### Recommended presets

| Preset                 | Win | Pieces/player     | Notes                            |
| ---------------------- | --- | ----------------- | -------------------------------- |
| **Default**            | 4   | 12 ranks, 1 each  | As written above.                |
| **Balanced strategic** | 4   | 16 (2× ranks 1–4) | **Best overall 5×5 experience.** |
| **Positional**         | 5   | 12 ranks, 1 each  | For patient, defensive players.  |
| **Party**              | 3   | 12 ranks, 1 each  | Fast, loud, chaotic.             |
| **Beginner**           | 4   | 8 ranks, 1 each   | Fewer ranks to track.            |

---

## §7. Board-specific notes

- With **12 ranks on 5×5**, the top **3–4 ranks are near-permanent**: rank 12
  can never be covered, 11 only by 12, 10 only by 11–12, 9 only by 10–12.
  Heavy hoarding is the single biggest balance issue on this board — which is
  why the **balanced distribution** is listed as strongly recommended rather
  than merely optional.
- **Duplicated low ranks matter most here.** They give cheap tempo moves and
  more re-gobble chances, which is what keeps a large board from freezing up.
- **Stack depth** is the practical limiting factor in physical play. Twelve
  ranks means a theoretical stack of 12; in practice cap it (`rules-common.md`
  §8) so players can read the board and buried pieces stay findable.
- The first several turns are a placement game; the endgame is a
  movement/reveal game. Plan the transition.
- For digital implementations, consider showing **stack depth** and
  **buried-piece previews** — 5×5 produces more buried information than
  smaller boards.

---

## §8. Example turn

_Position:_ D4 holds a rank-6 piece (Player 2). Player 1 has a rank-7 in
reserve, and Player 1 has a rank-10 piece on the board at B2.

1. Player 1 **places** rank-7 on D4, gobbling Player 2's rank-6. D4 now shows
   Player 1's rank-7.
2. Player 2 **moves** a rank-9 piece from E5 onto D4, gobbling Player 1's
   rank-7. D4 now shows Player 2's rank-9, and E5 becomes empty (or reveals
   whatever was under the rank-9 — possibly a Player 1 piece that now
   reappears and extends a line).
3. Later, Player 1 **moves** the rank-10 from B2 onto D4, gobbling Player 2's
   rank-9. If that completes four in a row, Player 1 wins.

Note how step 2's _reveal_ at E5 can flip the board — this is the signature
5×5 dynamic.

---

_See also: [`README.md`](README.md) · [`rules-common.md`](rules-common.md) · [`rules-3x3.md`](rules-3x3.md) · [`rules-4x4.md`](rules-4x4.md)._
