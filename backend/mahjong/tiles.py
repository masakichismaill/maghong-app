"""
Tile encoding: 0-8 manzu, 9-17 pinzu, 18-26 souzu, 27-33 jihai
Jihai: 27=East 28=South 29=West 30=North 31=Haku 32=Hatsu 33=Chun
"""

TILE_NAMES = {
    **{i: f"{i+1}m" for i in range(9)},
    **{i: f"{i-8}p" for i in range(9, 18)},
    **{i: f"{i-17}s" for i in range(18, 27)},
    27: "East", 28: "South", 29: "West", 30: "North",
    31: "Haku", 32: "Hatsu", 33: "Chun",
}

TILE_LABELS = {
    **{i: str(i+1) for i in range(9)},
    **{i: str(i-8) for i in range(9, 18)},
    **{i: str(i-17) for i in range(18, 27)},
    27: "東", 28: "南", 29: "西", 30: "北",
    31: "白", 32: "發", 33: "中",
}

TILE_SUITS = {
    **{i: "man" for i in range(9)},
    **{i: "pin" for i in range(9, 18)},
    **{i: "sou" for i in range(18, 27)},
    **{i: "jihai" for i in range(27, 34)},
}

ALL_TILES = list(range(34))
NUMBER_TILES = list(range(27))  # manzu + pinzu + souzu
JIHAI_TILES = list(range(27, 34))
WIND_TILES = [27, 28, 29, 30]   # 東南西北
DRAGON_TILES = [31, 32, 33]     # 白發中

SANMA_REMOVED = list(range(1, 8))  # 萬子2〜8 (ID 1〜7)
SANMA_TILES = [t for t in ALL_TILES if t not in set(SANMA_REMOVED)]


def is_jihai(tile: int) -> bool:
    return tile >= 27


def same_suit(a: int, b: int, c: int) -> bool:
    return TILE_SUITS[a] == TILE_SUITS[b] == TILE_SUITS[c]


def tile_number(tile: int) -> int:
    """Return 1-9 for number tiles within their suit."""
    if tile < 9:
        return tile + 1
    elif tile < 18:
        return tile - 8
    elif tile < 27:
        return tile - 17
    return -1
