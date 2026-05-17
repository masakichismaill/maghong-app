# 麻雀待ち練習アプリ

麻雀のテンパイ・待ち牌判断力を練習するWebアプリ。

## 技術スタック

- **バックエンド**: FastAPI + Python
- **フロントエンド**: React + Vite
- **デプロイ**: Render

## ローカル開発

### バックエンド

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### フロントエンド

```bash
cd frontend
npm install
npm run dev
```

フロントエンド: http://localhost:5173  
バックエンドAPI: http://localhost:8000

## API

- `GET /api/quiz?level={1|2|3}` — クイズ問題生成
- `POST /api/judge` — 待ち牌判定（13枚 → 待ち牌リスト）
- `GET /api/health` — ヘルスチェック

## Renderデプロイ

1. GitHubにpush
2. Renderで `render.yaml` を使ってBlueprint作成
3. 環境変数 `VITE_API_URL` にバックエンドURLを設定

## 牌の内部表現

| 種類 | 範囲 |
|------|------|
| 萬子 | 0–8 |
| 筒子 | 9–17 |
| 索子 | 18–26 |
| 字牌（東南西北白發中） | 27–33 |
