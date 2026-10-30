# Matryoshka Tic-Tac-Toe — 4×4 Rules

Read alongside [`rules-common.md`](rules-common.md), which defines turn
structure, placement, movement, winning checks, draws, and universal variants.
**This file covers only what's specific to the 4×4 board.**

---

## Quick reference

| Item              | Default                                                     |
| ----------------- | ----------------------------------------------------------- |
| Board             | 4×4 (16 squares)                                            |
| Pieces per player | 9, ranks 1–9, one of each                                   |
| Win condition     | 4 in a row _(3-in-a-row fast variant recommended — see §4)_ |
| Move limit        | 60 moves                                                    |

---

## §1. Board overview

The 4×4 is the medium variant. More squares and more ranks than 3×3, so
reserves matter more and movement/revealing becomes a core skill rather than
a rare option. With 9 pieces on 16 squares, reserves will empty in longer
games — the endgame shifts to movement.

Play follows `rules-common.md` §2–§7. Only the numbers below are
board-specific.

---

## §2. Components

- **Board:** 4×4 grid (16 squares).
- **Pieces:** Each player has ranks **1–9**, one of each (**9 pieces per
  player**).
- Total: 18 pieces across both players.

Distribution per player:

| Rank  | 1   | 2   | 3   | 4   | 5   | 6   | 7   | 8   | 9   |
| ----- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Count | 1   | 1   | 1   | 1   | 1   | 1   | 1   | 1   | 1   |

---

## §3. Setup

1. Place the empty 4×4 board between the players.
2. Each player takes their 9 pieces as their reserve.
3. Decide who goes first. Swap after each game.

---

## §4. Win condition

**The required number of your visible top pieces in a straight line** —
horizontal, vertical, or diagonal — you win immediately.

Two official win lengths:

| Win length     | Winning lines | Feel                                                                                 |
| -------------- | ------------: | ------------------------------------------------------------------------------------ |
| **4 in a row** |        **10** | Default. Positional; covering one square blocks multiple lines. Can feel defensive.  |
| **3 in a row** |        **24** | **Recommended.** Faster, more tactical; gobbling and reveals stay lively throughout. |

**Why the tension:** 4-in-a-row on a 4×4 has only 10 lines, so covering a
single square blocks several at once. That makes the game grindy. 3-in-a-row
has 24 lines — enough that the board never freezes up. If your group likes
longer, more defensive games, keep 4; otherwise flip to 3. Both are official;
pick one as your house rule.

Wins are checked after every move, including revealing moves (see
`rules-common.md` §5).

---

## §5. Draw rules

- Threefold repetition applies (`rules-common.md` §6).
- **Move limit:** 60 consecutive moves with no win → draw. Adjustable.

---

## §6. Board-specific variants

| Variant                   | Change                                                                                                           |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Balanced distribution** | **12 pieces/player: 2× ranks 1–3, 1× ranks 4–9.** Cheap tempo moves; softens top-rank hoarding. **Recommended.** |
| **Fewer sizes**           | 6–7 pieces/player. Sharper, less top-heavy.                                                                      |
| **More sizes**            | 10–12 pieces/player. Chaotic; top ranks dominate.                                                                |

Universal variants (no-reveal-win, no moving, stack cap) are in
`rules-common.md` §8.

### Recommended presets

| Preset         | Win    | Pieces/player     | Notes                            |
| -------------- | ------ | ----------------- | -------------------------------- |
| **Fast/party** | 3      | 9 ranks, 1 each   | **Best overall 4×4 experience.** |
| **Strategic**  | 4      | 9 ranks, 1 each   | Positional, defensive.           |
| **Balanced**   | 3 or 4 | 12 (2× ranks 1–3) | Softens top-rank hoarding.       |
| **Beginner**   | 3      | 6 ranks, 1 each   | Fewer ranks to track.            |

---

## §7. Board-specific notes

- With 9 ranks on 4×4, the **top 2–3 ranks are near-permanent**: rank 9 can
  never be covered, 8 only by 9, 7 only by 8–9. Expect hoarding — this is the
  main reason the **balanced distribution** variant exists.
- **Reserves will run out** in longer games. Once a player has no pieces in
  reserve, their only action is to move. Plan for this — it's normal.
- Duplicating low ranks gives more cheap tempo moves and more re-gobble
  chances, which keeps the midgame lively.
- If games feel too long, prefer the **3-in-a-row** win condition over
  reducing piece count — fewer pieces makes the top ranks even more dominant.

---

## §8. Example turn

_Position:_ C3 holds a rank-4 piece (Player 1). Player 2 has a rank-5 in
reserve, and Player 1 has a rank-6 piece on the board at A1.

1. Player 2 **places** rank-5 on C3, gobbling Player 1's rank-4. C3 now shows
   Player 2's rank-5.
2. Later, Player 1 **moves** rank-6 from A1 onto C3, gobbling Player 2's
   rank-5. C3 now shows Player 1's rank-6, and A1 becomes empty (or reveals
   whatever was under the rank-6).
3. If Player 1's rank-6 completes a line of the required length, Player 1
   wins.

---

_See also: [`README.md`](README.md) · [`rules-common.md`](rules-common.md) · [`rules-3x3.md`](rules-3x3.md) · [`rules-5x5.md`](rules-5x5.md)._
