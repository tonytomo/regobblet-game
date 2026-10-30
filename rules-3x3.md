# Matryoshka Tic-Tac-Toe — 3×3 Rules

Read alongside [`rules-common.md`](rules-common.md), which defines turn
structure, placement, movement, winning checks, draws, and universal variants.
**This file covers only what's specific to the 3×3 board.**

---

## Quick reference

| Item              | Default                   |
| ----------------- | ------------------------- |
| Board             | 3×3 (9 squares)           |
| Pieces per player | 6, ranks 1–6, one of each |
| Win condition     | 3 in a row                |
| Move limit        | 50 moves                  |

---

## §1. Board overview

The 3×3 is the fast, tactical variant. Small enough that every square is
contested immediately, short enough to play in 10–15 minutes. It's the
recommended entry point — it teaches the core loop (place, gobble, move,
reveal) with the least cognitive load.

Play follows `rules-common.md` §2–§7. Only the numbers below are
board-specific.

---

## §2. Components

- **Board:** 3×3 grid (9 squares).
- **Pieces:** Each player has ranks **1–6**, one of each (**6 pieces per
  player**).
- Total: 12 pieces across both players.

Distribution per player:

| Rank  | 1   | 2   | 3   | 4   | 5   | 6   |
| ----- | --- | --- | --- | --- | --- | --- |
| Count | 1   | 1   | 1   | 1   | 1   | 1   |

---

## §3. Setup

1. Place the empty 3×3 board between the players.
2. Each player takes their 6 pieces as their reserve.
3. Decide who goes first. Swap after each game (mild first-player advantage).

---

## §4. Win condition

**Three of your visible top pieces in a straight line** (row, column, or
diagonal) — you win immediately.

3-in-a-row on a 3×3 gives **8 winning lines** (3 rows, 3 columns, 2
diagonals). That's the classic tic-tac-toe line count; the gobbling and
movement rules are what make it non-trivial.

Wins are checked after every move, including revealing moves (see
`rules-common.md` §5).

---

## §5. Draw rules

- Threefold repetition applies (`rules-common.md` §6).
- **Move limit:** 50 consecutive moves with no win → draw. Adjustable.

---

## §6. Board-specific variants

| Variant                 | Change                                                                                              |
| ----------------------- | --------------------------------------------------------------------------------------------------- |
| **Duplicate low ranks** | 8 pieces/player: **2× ranks 1–2, 1× ranks 3–6.** More cheap tempo moves; softens top-rank hoarding. |
| **Fewer sizes**         | 5 pieces/player (ranks 1–5). Sharper, faster.                                                       |
| **More sizes**          | 7–8 pieces/player. More chaotic; top ranks dominate.                                                |

Universal variants (no-reveal-win, no moving, stack cap) are in
`rules-common.md` §8.

### Recommended presets

- **Default:** 6 ranks, 1 each. Win with 3.
- **Beginner:** 5 ranks, 1 each. Win with 3.
- **Balanced:** 8 pieces (duplicate ranks 1–2). Win with 3.
- **Chaos:** 7–8 ranks. Win with 3.

---

## §7. Board-specific notes

- With only 6 ranks and 9 squares, the **top 1–2 ranks** (5, 6) are powerful
  because they can rarely be covered. This is intentional tension — plan
  when to spend them.
- If the game feels too "hoard the biggest doll," try the **duplicate low
  ranks** variant.
- Stacks rarely exceed 3–4 in practice; a stack cap is optional here.
- Games usually resolve in 15–40 moves.

---

## §8. Example turn

_Position:_ B2 holds a rank-2 piece (Player 1). Player 2 has a rank-3 in
reserve.

1. Player 2 **places** rank-3 on B2, gobbling Player 1's rank-2. B2 now shows
   Player 2's rank-3.
2. Later, Player 1 **moves** rank-4 from A1 onto B2, gobbling Player 2's
   rank-3. B2 now shows Player 1's rank-4, and A1 becomes empty (or reveals
   whatever was under the rank-4).
3. If Player 1's rank-4 completes a row, Player 1 wins.

---

_See also: [`README.md`](README.md) · [`rules-common.md`](rules-common.md) · [`rules-4x4.md`](rules-4x4.md) · [`rules-5x5.md`](rules-5x5.md)._
