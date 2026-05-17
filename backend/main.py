import os
import random
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from mahjong.judge import get_waiting_tiles, can_win
from mahjong.quiz import generate_quiz
from mahjong.tiles import is_jihai, ALL_TILES, SANMA_TILES, SANMA_REMOVED

app = FastAPI(title="Mahjong Practice API")

origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class JudgeRequest(BaseModel):
    hand: list[int]


def _get_valid_tiles(mode: str) -> list[int]:
    return SANMA_TILES if mode == "sanma" else ALL_TILES


def _pick_smart_non_winning(
    waiting_tiles: list[int], non_waiting: list[int], hand: list[int]
) -> int | None:
    """非正解の問題牌を選ぶ。適切な候補がない場合は None を返す。

    優先順位:
      1. 手牌の数牌から ±1 隣接牌（同スーツ内のみ）
      2. 手牌の数牌から ±2 隣接牌（同スーツ内のみ）
      3. None → 呼び出し元が正解牌を使う（is_winning=True にフォールバック）

    字牌は非正解デコイとして一切使用しない。
    """
    non_waiting_set = set(non_waiting)

    # 1. 数牌: ±1 隣接牌（同スーツ内のみ）
    near: set[int] = set()
    for ht in hand:
        if is_jihai(ht):
            continue
        suit_start = (ht // 9) * 9
        suit_end = suit_start + 8
        for t in (ht - 1, ht + 1):
            if suit_start <= t <= suit_end and t in non_waiting_set:
                near.add(t)

    if near:
        return random.choice(list(near))

    # 2. 数牌: ±2 隣接牌（同スーツ内のみ）に緩和
    relaxed: set[int] = set()
    for ht in hand:
        if is_jihai(ht):
            continue
        suit_start = (ht // 9) * 9
        suit_end = suit_start + 8
        for t in (ht - 2, ht + 2):
            if suit_start <= t <= suit_end and t in non_waiting_set:
                relaxed.add(t)

    if relaxed:
        return random.choice(list(relaxed))

    # 3. 制約を満たす非正解牌なし
    return None


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/quiz")
def quiz(level: int = 1, mode: str = "standard"):
    if level not in (1, 2, 3):
        raise HTTPException(status_code=400, detail="level must be 1, 2, or 3")
    if mode not in ("standard", "sanma"):
        raise HTTPException(status_code=400, detail="mode must be 'standard' or 'sanma'")

    valid_tiles = _get_valid_tiles(mode)
    result = generate_quiz(level, valid_tiles)
    hand_13 = result["hand"]
    waiting_tiles = result["waiting_tiles"]

    # Pick a question tile: sometimes a winning tile, sometimes not
    is_winning = random.random() < 0.5
    if is_winning and waiting_tiles:
        question_tile = random.choice(waiting_tiles)
    else:
        non_waiting = [t for t in valid_tiles if t not in waiting_tiles]
        candidate = _pick_smart_non_winning(waiting_tiles, non_waiting, hand_13) if non_waiting else None
        if candidate is not None:
            question_tile = candidate
            is_winning = False
        else:
            # 制約を満たす非正解牌がない場合は正解牌を使用
            question_tile = random.choice(waiting_tiles)
            is_winning = True

    return {
        "hand": hand_13,
        "question_tile": question_tile,
        "is_winning": is_winning,
        "waiting_tiles": waiting_tiles,
    }


@app.post("/api/judge")
def judge(req: JudgeRequest, mode: str = "standard"):
    if mode not in ("standard", "sanma"):
        raise HTTPException(status_code=400, detail="mode must be 'standard' or 'sanma'")
    if len(req.hand) != 13:
        raise HTTPException(status_code=400, detail="hand must have exactly 13 tiles")
    if any(t < 0 or t > 33 for t in req.hand):
        raise HTTPException(status_code=400, detail="tile index out of range (0-33)")
    if mode == "sanma" and any(t in SANMA_REMOVED for t in req.hand):
        raise HTTPException(status_code=400, detail="hand contains tiles not valid in sanma mode")

    valid_tiles = _get_valid_tiles(mode)
    waiting = get_waiting_tiles(req.hand, valid_tiles)
    return {"waiting_tiles": waiting}
