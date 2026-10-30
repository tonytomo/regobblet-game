# Matryoshka Tic-Tac-Toe — Common Rules

These rules apply to **every** board size (3×3, 4×4, 5×5). Board-specific
files (`rules-3x3.md`, etc.) define only what differs: board dimensions,
piece counts, win condition, board-specific variants, and examples.

Sections are numbered so board files can reference them directly (e.g. "see
§3"). Read this file once; each board file tells you which numbers to swap.

---

## §1. Overview & core concepts

Two players alternate placing or moving nested pieces on a grid. Each player
has a reserve of pieces of increasing size (ranks). Larger pieces can cover
("gobble") smaller pieces. Only the top visible piece in each square counts
toward ownership. Line up the required number of visible pieces to win.

**Core concepts:**

- **Rank** — a piece's size. Rank 1 is smallest; the highest rank varies by board.
- **Reserve** — your off-board pieces, available to place.
- **Stack** — the pile of pieces in a square. Only the top is visible.
- **Gobble** — cover a smaller top piece with a larger piece.
- **Reveal** — uncover a piece by moving the piece on top of it.
- **Top piece** — the visible, uppermost piece of a square. Only top pieces
  count for wins and can be moved.

---

## §2. Turn structure

On your turn, choose **exactly one** action:

- **A. Place** a new piece from your reserve, **or**
- **B. Move** one of your top pieces already on the board.

You may not pass. If you have any legal action, you must take one.

---

## §3. Placing a piece

Choose any piece from your reserve and place it on:

- an **empty square**, or
- a square whose **top piece is strictly smaller** than the piece you are
  placing (yours or your opponent's).

You cannot place on a same-size or larger piece.

**Example:** A rank-4 piece may be placed on an empty square, or on top of a
rank 1, 2, or 3 piece. It may not be placed on a rank 4, 5, or 6 piece.

---

## §4. Moving a piece

Choose one of your pieces that is currently the **top piece** of its square.
Pick it up and place it under the same rules as placing:

- onto an **empty square**, or
- on top of a **strictly smaller** top piece.

When you pick up a piece, whatever was underneath becomes the new top piece
and is visible again.

**Restrictions:**

- Only **top pieces** may be moved. Buried pieces are stuck until uncovered.
- You may move a piece onto a square holding your own piece, if your moving
  piece is strictly larger.
- A move must change the board state (no pick-up-and-put-back on the same
  square).

**Reserves may run out.** If you have no reserve pieces, your only legal
action is to **move**. This is normal, not a loss condition.

---

## §5. Winning (general rule)

After your move (place or move), check the board:

- If the required number of your visible pieces form a straight line —
  horizontal, vertical, or diagonal — **you win immediately.**
- Only **top visible pieces** count. Covered pieces count for neither player.
- Wins are checked **after every move**, including revealing moves.

The **required line length** varies by board. See each board file.

**Multiple lines:** if your move completes more than one line, you still just
win.

---

## §6. Draws

- **Threefold repetition:** if the same position (board state, both reserves,
  and player to move) occurs three times, the game is a draw.
- **Optional move limit:** each board file specifies a move limit (number of
  consecutive moves with no win that trigger a draw). Adjustable.

Without a repetition or move-limit rule, games can loop indefinitely.

---

## §7. Special cases & clarifications

- **Covering your own piece is legal.** Often inefficient, but can be useful
  defensively (e.g. to block an opponent's medium piece from gobbling a
  square).
- **Uncovering an opponent's win is legal but loses.** If your move reveals a
  line of your opponent's pieces, your opponent wins immediately. (See §8
  for a variant that forbids this.)
- **No passing.**
- **All ranks are public information.** Both players' reserves are open.
- **No stack limit by default.** See §8 for a stack-cap variant.
- **Illegal moves:** a move that violates placement/movement rules is simply
  not legal; you must choose another action.

---

## §8. Universal variants

These can be applied to **any** board. Board files list additional
board-specific variants.

| Variant                   | Change                                                  | Notes                                                                |
| ------------------------- | ------------------------------------------------------- | -------------------------------------------------------------------- |
| **No-reveal-win**         | A move that would reveal an opponent's line is illegal. | Removes the "gotcha" reveal loss; makes the game more forgiving.     |
| **No moving**             | Placement only; no reveals.                             | Pure gobbling. Major change — removes the signature reveal mechanic. |
| **Stack cap**             | Maximum stack height of N (typically 3–4).              | Limits burying; recommended for physical play on 5×5.                |
| **Balanced distribution** | Duplicate low ranks (e.g. 2× ranks 1–4).                | Board files specify exact counts. Softens top-rank hoarding.         |

---

## §9. Piece design notes

- Pieces must be distinguishable by **rank** (size, color, or both) and by
  **owner** (color or marking).
- Rank 1 is smallest; higher ranks are progressively larger.
- Physical stacking requires that pieces nest or rest stably — matryoshka-doll
  hollows work; flat discs of increasing diameter also work if stable when
  stacked.
- For physical play, pick sizes so a stack of 4–5 pieces doesn't wobble.

---

## §10. Terminology

- **Rank** — piece size (1 = smallest).
- **Reserve** — off-board pieces available to place.
- **Top piece** — the visible uppermost piece of a square.
- **Gobble** — cover a smaller top piece.
- **Reveal** — uncover a piece by moving the piece on top of it.
- **Line** — a straight run of same-owner top pieces (row, column, or diagonal).
