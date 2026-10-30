# Matryoshka Tic-Tac-Toe — 4×4 Rules

_Working title. A Gobblet-style nested-piece tic-tac-toe._

---

## Quick Reference

| Item              | Default                                             |
| ----------------- | --------------------------------------------------- |
| Board             | 4×4 (16 squares)                                    |
| Pieces per player | 9 nested pieces, ranks 1–9, one of each             |
| Win condition     | 4 of your visible pieces in a row                   |
| Turn action       | Place a new piece **or** move an existing top piece |
| Gobbling          | Strictly larger pieces only                         |
| Cover own pieces  | Allowed                                             |
| Move / reveal     | Allowed (top pieces only)                           |

**Faster alternative:** win with **3 in a row** instead of 4 (see §7 and §10).

---

## 1. Overview

Matryoshka Tic-Tac-Toe is a two-player game played on a 4×4 grid. Each player
controls a set of nesting-doll pieces of increasing size. Larger pieces can
**gobble** (cover) smaller pieces, and pieces can be **moved** to reveal what
lies underneath. Only the **top visible piece** in each square counts toward
ownership. The first player to line up the required number of visible pieces
wins.

The 4×4 board is the "medium" variant: more squares and more ranks than 3×3,
so reserves matter more and moving/revealing becomes a core skill rather than
a rare option.

---

## 2. Components

- **Board:** 4×4 grid (16 squares).
- **Pieces:** Each player has a set of nested pieces ranked **1 (smallest)**
  to **9 (largest)**, with **one piece of each rank** by default.
- Pieces must be visually distinguishable by rank (size, color, or both) and
  by owner (color or marking).

**Default distribution per player:**

| Rank  | 1   | 2   | 3   | 4   | 5   | 6   | 7   | 8   | 9   |
| ----- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Count | 1   | 1   | 1   | 1   | 1   | 1   | 1   | 1   | 1   |

Total: 18 pieces across both players.

---

## 3. Setup

1. Place the empty 4×4 board between the players.
2. Each player takes their 9 pieces and keeps them in their **reserve**
   (off-board).
3. Decide who goes first. (First player has a mild advantage; swap after
   each game.)

---

## 4. Turn Structure

On your turn, choose **exactly one** action:

- **A. Place** a new piece from your reserve onto the board, **or**
- **B. Move** one of your pieces already on the board.

You may not pass.

---

## 5. Placing a Piece

Choose any piece from your reserve and place it on:

- an **empty square**, or
- a square whose **top piece is strictly smaller** than the piece you are
  placing (yours or your opponent's).

You **cannot** place a piece on top of a same-size or larger piece.

**Example:** A rank-6 piece may be placed on an empty square, or on top of a
rank 1–5 piece. It may not be placed on a rank 6, 7, 8, or 9 piece.

---

## 6. Moving a Piece

Choose one of **your** pieces that is currently the **top piece** of its
square. Pick it up and place it following the same rules as placing:

- onto an **empty square**, or
- on top of a **strictly smaller** top piece.

When you pick up a piece, whatever was underneath it (if anything) becomes
the new top piece of that square and is visible again.

**Restrictions:**

- Only **top pieces** may be moved. Buried pieces are stuck until uncovered.
- You may move a piece onto a square that already holds your own piece,
  provided your moving piece is strictly larger.
- A move must change the board state (no picking up and putting back on the
  same square).

**Note on reserves:** With 9 pieces per player and 16 squares, reserves will
run out in longer games. Once a player has no pieces in reserve, their only
legal action is to **move**. This is a normal part of the 4×4 game, not a
loss condition.

---

## 7. Winning

After your move (place or move), check the board:

- If **four of your visible pieces** form a straight line — horizontal,
  vertical, or diagonal — **you win immediately.**
- Only **top visible pieces** count. Covered pieces do not count for either
  player.

Wins are checked **after every move**, including moves that reveal pieces.

**Line count note:** With 4-in-a-row on a 4×4 board there are exactly
**10 winning lines** (4 rows, 4 columns, 2 main diagonals). That makes 4-in-a-
row quite restrictive — covering a single square blocks multiple lines. If the
game feels too defensive or grindy, switch to the **3-in-a-row** win condition
(§10), which has **24 winning lines** and plays much faster and more
tactically. Both are official; pick one as your house rule.

---

## 8. Draws

Because pieces can be moved and revealed, the board can never become
permanently "full," so draws must be declared by rule:

- **Threefold repetition:** If the same position (board state, both reserves,
  and player to move) occurs three times, the game is a draw.
- **Optional move limit:** If 60 consecutive moves pass with no win, the game
  is a draw. (Adjustable; 4×4 needs a slightly longer limit than 3×3.)

Without a repetition or move-limit rule, games can loop indefinitely.

---

## 9. Special Cases & Clarifications

- **Covering your own piece is legal.** Often inefficient, but can be useful
  defensively (e.g., to block an opponent's medium piece from gobbling a
  square).
- **Uncovering an opponent's win is legal but loses.** If your move reveals
  four of your opponent's pieces in a row, your opponent wins immediately.
  (Optional variant: forbid moves that reveal an opponent win — see §10.)
- **No passing.** If you have pieces in reserve or movable top pieces, you
  must act.
- **All ranks are public information.** Both players' reserves are open.
- **No stack limit by default.** With 9 ranks, stacks can get deep; see §10
  for a stack cap variant.

---

## 10. Optional Variants

| Variant                   | Change                                                                                                                                 |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **Fast win**              | Win with **3 in a row** instead of 4. Much faster, more chaotic (24 lines). Recommended for shorter sessions.                          |
| **Balanced distribution** | Use **12 pieces/player**: 2× ranks 1–3, 1× ranks 4–9. Keeps small pieces useful for tempo and softens the "save the top doll" endgame. |
| **Fewer sizes**           | 6–7 pieces/player. Sharper, less top-heavy.                                                                                            |
| **More sizes**            | 10–12 pieces/player. Chaotic; top ranks dominate.                                                                                      |
| **No-reveal-win**         | A move that would reveal an opponent's line is illegal.                                                                                |
| **No moving**             | Placement only (pure gobbling, no reveals).                                                                                            |
| **Stack cap**             | Maximum stack height of 3 or 4. Limits burying and keeps the board readable.                                                           |

### Recommended preset combos

- **Default:** 4-in-a-row, 9 ranks, 1 copy each.
- **Fast/party:** 3-in-a-row, 9 ranks, 1 copy each.
- **Balanced strategic:** 4-in-a-row, 12 pieces (duplicated low ranks).
- **Beginner:** 3-in-a-row, 6 ranks, 1 copy each.

---

## 11. Board & Piece Sizing Notes

- With 9 ranks on a 4×4 board, the **top 2–3 ranks are near-permanent**:
  rank 9 can never be covered, rank 8 only by 9, rank 7 only by 8–9. Expect
  players to hoard them. This is the main reason the **balanced
  distribution** variant exists.
- Duplicating low ranks gives players more "cheap" tempo moves and more
  chances to re-gobble, which keeps the midgame lively.
- If games feel too long, prefer the **3-in-a-row** win condition over
  reducing piece count — fewer pieces makes the top ranks even more
  dominant.

---

## 12. Example Turn

_Position:_ Square C3 holds a rank-4 piece (Player 1). Player 2 has a rank-5
piece in reserve, and Player 1 has a rank-6 piece on the board at A1.

1. Player 2 **places** the rank-5 piece on C3, gobbling Player 1's rank-4
   piece. C3 now shows Player 2's rank-5 piece.
2. On a later turn, Player 1 **moves** the rank-6 piece from A1 onto C3,
   gobbling Player 2's rank-5 piece. C3 now shows Player 1's rank-6 piece,
   and A1 becomes empty (or reveals whatever was under the rank-6 piece).
3. If Player 1's rank-6 piece completes a line of four, Player 1 wins.

---

_End of 4×4 rules. See also: [Rule 3x3](rules-3x3.md), [Rule 5x5](rules-5x5.md)._
