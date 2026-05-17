import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from mahjong.judge import can_win, get_waiting_tiles


def test_can_win_basic():
    # 123m 456m 789m 111p 22p
    hand = [0,1,2, 3,4,5, 6,7,8, 9,9,9, 10,10]
    assert can_win(hand)


def test_can_win_all_koutsu():
    # 111m 222m 333m 444m 55m
    hand = [0,0,0, 1,1,1, 2,2,2, 3,3,3, 4,4]
    assert can_win(hand)


def test_can_win_false():
    # 13枚 + 余分で崩れた形
    hand = [0,1,2,3,4,5,6,7,8,9,10,11,12,13]
    assert not can_win(hand)


def test_not_14_tiles():
    assert not can_win([0]*13)
    assert not can_win([0]*15)


def test_waiting_tiles_ryanmen():
    # 23m + ブロック: 123m 456m 789m 11p → 待ち: 1m(0) or 4m(3)
    # Build: 1m2m3m + 4m5m6m + 7m8m9m + 1p1p + 2m3m (tenpai on 1m or 4m)
    hand_13 = sorted([0,1,2, 3,4,5, 6,7,8, 9,9, 1,2])
    waiting = get_waiting_tiles(hand_13)
    assert 0 in waiting  # 1m
    assert 3 in waiting  # 4m


def test_waiting_tiles_tanki():
    # 123m 456m 789m 123p + single 1s → tanki wait on 1s (18)
    hand_13 = sorted([0,1,2, 3,4,5, 6,7,8, 9,10,11, 18])
    waiting = get_waiting_tiles(hand_13)
    assert 18 in waiting
    assert len(waiting) == 1


def test_jihai_koutsu():
    # 111m 222m 333m 444m 東東東東 → not valid (5 mentsu)
    # valid: 111m 222m 333m 東東東 + 44m
    hand = [0,0,0, 1,1,1, 2,2,2, 27,27,27, 3,3]
    assert can_win(hand)


if __name__ == "__main__":
    tests = [
        test_can_win_basic,
        test_can_win_all_koutsu,
        test_can_win_false,
        test_not_14_tiles,
        test_waiting_tiles_ryanmen,
        test_waiting_tiles_tanki,
        test_jihai_koutsu,
    ]
    for t in tests:
        try:
            t()
            print(f"PASS: {t.__name__}")
        except AssertionError as e:
            print(f"FAIL: {t.__name__} — {e}")
