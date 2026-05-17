# 麻雀待ち練習アプリ — CLAUDE.md

## Project Structure

```
mahjong-app/
├── backend/
│   ├── main.py           # FastAPI app、クイズエンドポイント、_pick_smart_non_winning()
│   ├── requirements.txt
│   ├── test_judge.py     # 単体テスト（pytest 不要）
│   └── mahjong/
│       ├── tiles.py      # タイルエンコーディング・定数・ユーティリティ
│       ├── judge.py      # can_win()、get_waiting_tiles()
│       └── quiz.py       # generate_quiz()、_build_random_winning_hand()
└── frontend/
    └── src/              # React + Vite フロントエンド
```

## Dev Commands

```bash
# Backend
cd backend && pip install -r requirements.txt
uvicorn main:app --reload --port 8000

# Frontend
cd frontend && npm install && npm run dev

# Tests
cd backend && python test_judge.py
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000

## Tile Encoding

| 範囲  | スーツ | 説明 |
|-------|--------|------|
| 0–8   | man    | 萬子 |
| 9–17  | pin    | 筒子 |
| 18–26 | sou    | 索子 |
| 27–33 | jihai  | 字牌 |

字牌詳細: 27=東, 28=南, 29=西, 30=北, 31=白, 32=發, 33=中

## 提示牌選定ルール（`_pick_smart_non_winning` in main.py）

ハズレ牌（非正解）を選ぶ関数。戻り値は `int | None`（候補なしの場合は `None`）。

### 優先順位（上から順に試す）

1. **数牌 ±1**: 手牌の各数牌から ±1 隣接かつ同スーツの牌
2. **数牌 ±2**: ①が空のとき ±2 に緩和（同スーツ限定）
3. **字牌**: ②が空のとき、手牌に含まれる字牌のみ
4. **None**: ③も空なら `None` を返す → 呼び出し元が正解牌を使い `is_winning=True` に変更

### 絶対に選ばない牌
- 手牌にない字牌（例: 手牌に中のみ → 東・南・西・白・北・發は対象外）
- 手牌にない牌種（萬子/筒子/索子）の数牌
- 制約なしの `non_waiting` からのランダム選択（廃止済み）

### 具体例
- 手牌に 3萬がある → 2萬・4萬は候補○（±1）、5萬は候補×
- 手牌に 1・2・3萬がある → 4萬は候補○（±1）、5萬は候補×
- 手牌に 1萬・3萬がある → 2萬・4萬は候補○（±1）、5萬は候補×

## API Endpoints

- `GET /api/quiz?level={1|2|3}` — クイズ生成
- `POST /api/judge` body `{"hand": [int x 13]}` → `{"waiting_tiles": [int]}`
- `GET /api/health` — ヘルスチェック

## Level Definitions

| Level | 待ち牌数 |
|-------|---------|
| 1     | 1–2     |
| 2     | 3–4     |
| 3     | 5+      |

## バグ記録・注意事項

### `question_tile = 0`（1萬）のfalsyチェック問題
- **症状**: 問題牌が表示されない（1萬が出題されたとき）
- **原因**: JavaScript では整数 `0` はfalsyなため、`if (question_tile)` や JSX の `{question_tile && <TileSvg ...>}` が `undefined` と同じ挙動になる
- **影響箇所**: `TileSvg.jsx`、`QuizMode.jsx`、`ResultScreen.jsx`
- **対策**:
  - `TileSvg.jsx`: `TILE_COMPONENTS[tileId] ?? Man1`（`||` は使わない）を廃止し、`typeof tileId !== 'number'` の型ガードに変更。不正な `tileId` は `null` を返して明示的に失敗させる
  - `QuizMode.jsx`: `<TileSvg tileId={quiz.question_tile} ...>` を条件なしで直接レンダリング（`{quiz.question_tile && ...}` は絶対に使わない）
- **ルール**: `question_tile` の存在チェックは必ず `typeof question_tile === 'number'` を使う
