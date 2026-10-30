# Matryoshka Tic-Tac-Toe — 5×5 Rules

_Working title. A Gobblet-style nested-piece tic-tac-toe._

---

## Quick Reference

| Item              | Default                                             |
| ----------------- | --------------------------------------------------- |
| Board             | 5×5 (25 squares)                                    |
| Pieces per player | 12 nested pieces, ranks 1–12, one of each           |
| Win condition     | 4 of your visible pieces in a row                   |
| Turn action       | Place a new piece **or** move an existing top piece |
| Gobbling          | Strictly larger pieces only                         |
| Cover own pieces  | Allowed                                             |
| Move / reveal     | Allowed (top pieces only)                           |

**Note:** 4-in-a-row is the default here — _not_ 5-in-a-row. See §7 for why.

---

## 1. Overview

Matryoshka Tic-Tac-Toe is a two-player game played on a 5×5 grid. Each player
controls a set of nesting-doll pieces of increasing size. Larger pieces can
**gobble** (cover) smaller pieces, and pieces can be **moved** to reveal what
lies underneath. Only the **top visible piece** in each square counts toward
ownership. The first player to line up the required number of visible pieces
wins.

The 5×5 board is the "large" variant: more squares, more ranks, and deeper
stacks. Reserves run out fairly quickly relative to board size, so the late
game is dominated by **moving and revealing** rather than placing. Board
readability and stack management matter more here than on smaller boards.

---

## 2. Components

- **Board:** 5×5 grid (25 squares).
- **Pieces:** Each player has a set of nested pieces ranked **1 (smallest)**
  to **12 (largest)**, with **one piece of each rank** by default.
- Pieces must be visually distinguishable by rank (size, color, or both) and
  by owner (color or marking).

**Default distribution per player:**

| Rank  | 1   | 2   | 3   | 4   | 5   | 6   | 7   | 8   | 9   | 10  | 11  | 12  |
| ----- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Count | 1   | 1   | 1   | 1   | 1   | 1   | 1   | 1   | 1   | 1   | 1   | 1   |

Total: 24 pieces across both players.

**Board-vs-piece math:** 24 pieces vs 25 squares means the board can never be
fully occupied by single pieces, and **reserves will reliably run out** in
longer games. See §6 and §9.

---

## 3. Setup

1. Place the empty 5×5 board between the players.
2. Each player takes their 12 pieces and keeps them in their **reserve**
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

**Example:** A rank-8 piece may be placed on an empty square, or on top of a
rank 1–7 piece. It may not be placed on a rank 8, 9, 10, 11, or 12 piece.

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

**Reserves running out:** With 12 pieces per player and 25 squares, reserves
will empty well before the board fills. Once a player has no pieces in
reserve, their only legal action is to **move**. This is a normal part of the
5×5 game, not a loss condition. The endgame is therefore a moving/revealing
game — plan for it.

---

## 7. Winning

After your move (place or move), check the board:

- If **four of your visible pieces** form a straight line — horizontal,
  vertical, or diagonal — **you win immediately.**
- Only **top visible pieces** count. Covered pieces do not count for either
  player.

Wins are checked **after every move**, including moves that reveal pieces.

### Why 4-in-a-row and not 5

On a 5×5 board, the two candidate win lengths are:

| Win length     | Winning lines | Feel                                                                                            |
| -------------- | ------------: | ----------------------------------------------------------------------------------------------- |
| **4 in a row** |        **28** | Tense, tactical, plenty of threats. **Default.**                                                |
| 5 in a row     |            12 | Very restrictive; covering one square blocks many lines; tends to stall into a defensive grind. |
| 3 in a row     |            44 | Very fast and chaotic; wins are cheap and constantly gobbled. Party variant only.               |

Five-in-a-row gives only 12 lines on 25 squares, which combined with
gobbling makes the game extremely defensive. Four-in-a-row keeps the board
lively while still rewarding long-term building. Use 5-in-a-row only if your
group likes grindy, positional play.

---

## 8. Draws

Because pieces can be moved and revealed, the board can never become
permanently "full," so draws must be declared by rule:

- **Threefold repetition:** If the same position (board state, both reserves,
  and player to move) occurs three times, the game is a draw.
- **Optional move limit:** If 80 consecutive moves pass with no win, the game
  is a draw. (Adjustable; 5×5 needs a longer limit than 3×3 or 4×4.)

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
- **No stack limit by default.** With 12 ranks, stacks can get deep; see §10
  for a stack cap variant — strongly recommended for physical play.
- **Multiple simultaneous lines:** If your move creates more than one line of
  four, you still just win. No bonus.

---

## 10. Optional Variants

| Variant                                         | Change                                                                                                                            |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| **Balanced distribution (recommended for 5×5)** | **16 pieces/player:** 2× ranks 1–4, 1× ranks 5–12. Keeps low ranks useful for tempo and softens the "hoard the top doll" endgame. |
| **Heavy balanced**                              | **18 pieces/player:** 2× ranks 1–5, 1× ranks 6–12. Even more tempo play.                                                          |
| **Long win**                                    | Win with **5 in a row** (12 lines). Positional, defensive, grindy.                                                                |
| **Fast win**                                    | Win with **3 in a row** (44 lines). Chaotic party mode.                                                                           |
| **Fewer sizes**                                 | 8–9 pieces/player. Sharper, less top-heavy.                                                                                       |
| **More sizes**                                  | 13–15 pieces/player. Maximum chaos; top ranks dominate.                                                                           |
| **No-reveal-win**                               | A move that would reveal an opponent's line is illegal.                                                                           |
| **No moving**                                   | Placement only (pure gobbling, no reveals).                                                                                       |
| **Stack cap**                                   | Maximum stack height of 3–4. Limits burying and keeps the board readable.                                                         |

### Recommended preset combos

| Preset                 | Win | Pieces/player     | Notes                            |
| ---------------------- | --- | ----------------- | -------------------------------- |
| **Default**            | 4   | 12 ranks, 1 each  | As written above.                |
| **Balanced strategic** | 4   | 16 (2× ranks 1–4) | **Best overall 5×5 experience.** |
| **Positional**         | 5   | 12 ranks, 1 each  | For patient, defensive players.  |
| **Party**              | 3   | 12 ranks, 1 each  | Fast, loud, chaotic.             |
| **Beginner**           | 4   | 8 ranks, 1 each   | Fewer ranks to track.            |

---

## 11. Board & Piece Sizing Notes

- With **12 ranks on 5×5**, the top **3–4 ranks are near-permanent**: rank 12
  can never be covered, 11 only by 12, 10 only by 11–12, 9 only by 10–12.
  Expect heavy hoarding. This is the single biggest balance issue on this
  board size — which is why the **balanced distribution** variant is listed
  as recommended rather than optional.
- **Duplicated low ranks** are more important here than on 3×3 or 4×4: they
  give players cheap tempo moves and more re-gobble opportunities, which is
  what keeps a large board from freezing up.
- **Stack depth** is the practical limiting factor in physical play. Twelve
  ranks means a theoretical stack of 12; in practice cap it (§10) so players
  can read the board and so buried pieces stay findable.
- If the board feels too empty in the early game, that's normal — 24 pieces
  on 25 squares spends its first several turns as a placement game, then
  shifts hard into movement.
- For digital implementations, consider showing **stack depth** and
  **buried-piece previews** (e.g., a stack indicator) since 5×5 will produce
  more buried information than smaller boards.

---

## 12. Example Turn

_Position:_ Square D4 holds a rank-6 piece (Player 2). Player 1 has a rank-7
piece in reserve, and Player 1 has a rank-10 piece on the board at B2.

1. Player 1 **places** the rank-7 piece on D4, gobbling Player 2's rank-6
   piece. D4 now shows Player 1's rank-7 piece.
2. Player 2 responds by **moving** a rank-9 piece from E5 onto D4, gobbling
   Player 1's rank-7 piece. D4 now shows Player 2's rank-9 piece, and E5
   becomes empty (or reveals whatever was under the rank-9 piece — possibly
   a Player 1 piece that now reappears and extends a line).
3. On a later turn, Player 1 **moves** the rank-10 piece from B2 onto D4,
   gobbling Player 2's rank-9 piece. If that completes four in a row, Player 1
   wins.

Note how step 2's _reveal_ at E5 can flip the board — this is the signature
5×5 dynamic.

---

_End of 5×5 rules. See also: [Rule 3x3](rules-3x3.md), [Rule 4x4](rules-4x4.md)._
