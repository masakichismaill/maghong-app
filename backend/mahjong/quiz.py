import random
from collections import Counter
from .judge import can_win, get_waiting_tiles
from .tiles import ALL_TILES

# Max copies of each tile in a full set
MAX_PER_TILE = 4

LEVEL_RANGES = {
    1: (1, 2),   # tanki, penchan, kanchan, ryanmen
    2: (3, 4),
    3: (5, 99),  # multi-wait
}


def _build_random_winning_hand(valid_tiles: list[int] | None = None) -> list[int] | None:
    """Build a random 14-tile winning hand by stacking mentsu + jantai."""
    valid_tiles = valid_tiles if valid_tiles is not None else ALL_TILES
    valid_set = set(valid_tiles)

    counts = Counter()
    hand = []

    def pick_tile(preferred: list[int] | None = None) -> int | None:
        candidates = preferred if preferred else valid_tiles
        candidates = list(candidates)
        random.shuffle(candidates)
        for t in candidates:
            if counts[t] < MAX_PER_TILE:
                return t
        return None

    # Choose jantai
    jantai_tile = pick_tile()
    if jantai_tile is None:
        return None
    counts[jantai_tile] += 2
    hand.extend([jantai_tile, jantai_tile])

    # Build 4 mentsu
    for _ in range(4):
        if random.random() < 0.5:
            # koutsu
            t = pick_tile()
            if t is None or counts[t] > MAX_PER_TILE - 3:
                # fall back to shuntsu attempt
                t = None

            if t is not None:
                counts[t] += 3
                hand.extend([t, t, t])
                continue

        # shuntsu — only try start positions where all 3 tiles are valid
        suits = [0, 9, 18]
        random.shuffle(suits)
        placed = False
        for base in suits:
            start_options = [
                s for s in range(base, base + 7)
                if s in valid_set and (s + 1) in valid_set and (s + 2) in valid_set
            ]
            random.shuffle(start_options)
            for start in start_options:
                if (counts[start] < MAX_PER_TILE and
                        counts[start + 1] < MAX_PER_TILE and
                        counts[start + 2] < MAX_PER_TILE):
                    counts[start] += 1
                    counts[start + 1] += 1
                    counts[start + 2] += 1
                    hand.extend([start, start + 1, start + 2])
                    placed = True
                    break
            if placed:
                break

        if not placed:
            # koutsu fallback
            t = pick_tile()
            if t is None:
                return None
            counts[t] += 3
            hand.extend([t, t, t])

    if len(hand) != 14 or not can_win(hand):
        return None
    return hand


def generate_quiz(level: int, valid_tiles: list[int] | None = None) -> dict:
    """Generate a quiz hand for the given level.

    Returns { hand: [int x 13], waiting_tiles: [int] }
    """
    valid_tiles = valid_tiles if valid_tiles is not None else ALL_TILES
    min_wait, max_wait = LEVEL_RANGES.get(level, (1, 2))
    max_attempts = 500

    for _ in range(max_attempts):
        full_hand = _build_random_winning_hand(valid_tiles)
        if full_hand is None:
            continue

        # Remove one tile to get a 13-tile tenpai hand
        indices = list(range(14))
        random.shuffle(indices)
        for idx in indices:
            hand_13 = full_hand[:idx] + full_hand[idx + 1:]
            waiting = get_waiting_tiles(hand_13, valid_tiles)
            if min_wait <= len(waiting) <= max_wait:
                hand_13_sorted = sorted(hand_13)
                return {"hand": hand_13_sorted, "waiting_tiles": sorted(waiting)}

    # Fallback: return whatever we last generated
    full_hand = _build_random_winning_hand(valid_tiles) or list(range(13)) + [0]
    hand_13 = sorted(full_hand[:13])
    waiting = get_waiting_tiles(hand_13, valid_tiles)
    return {"hand": hand_13, "waiting_tiles": sorted(waiting)}
