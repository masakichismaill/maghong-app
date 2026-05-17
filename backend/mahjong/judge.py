from collections import Counter
from .tiles import is_jihai, ALL_TILES


def _can_decompose(counts: Counter) -> bool:
    """Recursively check if counts can be decomposed into mentsu (sets of 3)."""
    # Find the smallest tile present
    tile = next((t for t in range(34) if counts[t] > 0), None)
    if tile is None:
        return True  # All tiles consumed

    # Try koutsu (triplet)
    if counts[tile] >= 3:
        counts[tile] -= 3
        if _can_decompose(counts):
            counts[tile] += 3
            return True
        counts[tile] += 3

    # Try shuntsu (sequence) — only for non-jihai tiles
    if not is_jihai(tile) and counts[tile + 1] > 0 and counts[tile + 2] > 0:
        # Ensure all three are in the same suit
        suit_base = (tile // 9) * 9
        if tile + 2 < suit_base + 9:
            counts[tile] -= 1
            counts[tile + 1] -= 1
            counts[tile + 2] -= 1
            if _can_decompose(counts):
                counts[tile] += 1
                counts[tile + 1] += 1
                counts[tile + 2] += 1
                return True
            counts[tile] += 1
            counts[tile + 1] += 1
            counts[tile + 2] += 1

    return False


def can_win(hand: list[int]) -> bool:
    """Return True if 14-tile hand is a winning hand (4 mentsu + 1 jantai)."""
    if len(hand) != 14:
        return False

    counts = Counter(hand)

    # Try each tile as jantai (pair)
    for tile in range(34):
        if counts[tile] >= 2:
            counts[tile] -= 2
            if _can_decompose(counts):
                counts[tile] += 2
                return True
            counts[tile] += 2

    return False


def get_waiting_tiles(hand_13: list[int], valid_tiles: list[int] | None = None) -> list[int]:
    """Return list of tiles that complete the 13-tile hand."""
    if len(hand_13) != 13:
        return []
    tiles = valid_tiles if valid_tiles is not None else ALL_TILES
    return [tile for tile in tiles if can_win(hand_13 + [tile])]
