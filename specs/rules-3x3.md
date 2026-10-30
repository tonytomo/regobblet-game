# Matryoshka Tic-Tac-Toe — 3×3 Rules

_Working title. A Gobblet-style nested-piece tic-tac-toe._

---

## Quick Reference

| Item              | Default                                             |
| ----------------- | --------------------------------------------------- |
| Board             | 3×3 (9 squares)                                     |
| Pieces per player | 6 nested pieces, ranks 1–6, one of each             |
| Win condition     | 3 of your visible pieces in a row                   |
| Turn action       | Place a new piece **or** move an existing top piece |
| Gobbling          | Strictly larger pieces only                         |
| Cover own pieces  | Allowed                                             |
| Move / reveal     | Allowed (top pieces only)                           |

---

## 1. Overview

Matryoshka Tic-Tac-Toe is a two-player game played on a 3×3 grid. Each player
controls a set of nesting-doll pieces of increasing size. Larger pieces can
**gobble** (cover) smaller pieces, and pieces can be **moved** to reveal what
lies underneath. Only the **top visible piece** in each square counts toward
ownership. The first player to line up three visible pieces wins.

---

## 2. Components

- **Board:** 3×3 grid (9 squares).
- **Pieces:** Each player has a set of nested pieces ranked **1 (smallest)**
  to **6 (largest)**, with **one piece of each rank** by default.
- Pieces must be visually distinguishable by rank (size, color, or both) and
  by owner (color or marking).

**Default distribution per player:**

| Rank  | 1   | 2   | 3   | 4   | 5   | 6   |
| ----- | --- | --- | --- | --- | --- | --- |
| Count | 1   | 1   | 1   | 1   | 1   | 1   |

Total: 12 pieces across both players.

---

## 3. Setup

1. Place the empty 3×3 board between the players.
2. Each player takes their 6 pieces and keeps them in their **reserve**
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

**Example:** A rank-4 piece may be placed on an empty square, or on top of a
rank 1, 2, or 3 piece. It may not be placed on a rank 4, 5, or 6 piece.

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

---

## 7. Winning

After your move (place or move), check the board:

- If **three of your visible pieces** form a straight line — horizontal,
  vertical, or diagonal — **you win immediately.**
- Only **top visible pieces** count. Covered pieces do not count for either
  player.

Wins are checked **after every move**, including moves that reveal pieces.

---

## 8. Draws

Because pieces can be moved and revealed, the board can never become
permanently "full," so draws must be declared by rule:

- **Threefold repetition:** If the same position (board state, both reserves,
  and player to move) occurs three times, the game is a draw.
- **Optional move limit:** If 50 consecutive moves pass with no win, the game
  is a draw. (Adjustable.)

Without a repetition or move-limit rule, games can loop indefinitely.

---

## 9. Special Cases & Clarifications

- **Covering your own piece is legal.** It is often inefficient but can be
  useful defensively (e.g., to block an opponent's medium piece from
  gobbling a square).
- **Uncovering an opponent's win is legal but loses.** If your move reveals
  three of your opponent's pieces in a row, your opponent wins immediately.
  (Optional variant: forbid moves that reveal an opponent win — see §10.)
- **No passing.** If you have pieces in reserve or movable top pieces, you
  must act.
- **Reserve pieces are hidden information?** No — both players' reserves are
  open information. All piece ranks are public.

---

## 10. Optional Variants

| Variant                 | Change                                                                                          |
| ----------------------- | ----------------------------------------------------------------------------------------------- |
| **Duplicate low ranks** | 2× rank 1, 2× rank 2, 1× ranks 3–6 (8 pieces/player). Makes small pieces more useful for tempo. |
| **Fewer sizes**         | 5 pieces/player (ranks 1–5). Faster, sharper.                                                   |
| **More sizes**          | 7–8 pieces/player. More chaotic; top ranks dominate.                                            |
| **No-reveal-win**       | A move that would reveal an opponent's three-in-a-row is illegal.                               |
| **No moving**           | Placement only (pure gobbling, no reveals).                                                     |
| **Stack cap**           | Maximum stack height of 3. Limits burying.                                                      |

---

## 11. Board & Piece Sizing Notes

- On a 3×3 board with 6 ranks, the top 1–2 ranks feel very powerful because
  they can rarely be covered. This is intentional and part of the tension.
- If the game feels too "save the biggest doll," try the **duplicate low
  ranks** variant or reduce to 5 ranks.

---

## 12. Example Turn

_Position:_ Square B2 holds a rank-2 piece (Player 1). Player 2 has a rank-3
piece in reserve.

1. Player 2 **places** the rank-3 piece on B2, gobbling Player 1's rank-2
   piece. B2 now shows Player 2's rank-3 piece.
2. On a later turn, Player 1 **moves** a rank-4 piece from A1 onto B2,
   gobbling Player 2's rank-3 piece. B2 now shows Player 1's rank-4 piece.
3. If Player 1's rank-4 piece completes a row, Player 1 wins.

---

_End of 3×3 rules. See also: [Rule 4x4](rules-4x4.md), [Rule 4x4](rules-4x4.md)._
