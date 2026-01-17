# AWS SAP 試験練習アプリ

AWS Solutions Architect Professional (SAP) の模擬問題をAI（Claude Sonnet 4.5）が生成し、学習できるWebアプリケーションです。

## アーキテクチャ

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Vue.js SPA    │────▶│   API Gateway   │────▶│     Lambda      │
│   (Amplify)     │     │   (HTTP API)    │     │   (Node.js)     │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
        │                                                │
        │                                    ┌───────────┴───────────┐
        ▼                                    ▼                       ▼
┌─────────────────┐                 ┌─────────────────┐    ┌─────────────────┐
│    Cognito      │                 │    DynamoDB     │    │    Bedrock      │
│  (認証/認可)     │                 │  (回答履歴)      │    │ (問題生成)       │
└─────────────────┘                 └─────────────────┘    └─────────────────┘
```

## 技術スタック

### フロントエンド
- Vue.js 3 (Composition API)
- TypeScript
- Tailwind CSS
- Pinia (状態管理)
- Vue Router
- AWS Amplify Libraries

### バックエンド
- AWS Lambda (Node.js / TypeScript)
- Amazon API Gateway (HTTP API)
- Amazon Cognito
- Amazon DynamoDB
- Amazon Bedrock (Claude Sonnet 4.5)

## セットアップ

### 前提条件

- Node.js 20+
- AWS CLI (設定済み)
- AWS SAM CLI

### 1. バックエンドデプロイ

```bash
# バックエンドの依存関係インストール
cd backend
npm install
npm run build

# SAMでデプロイ
cd ../infrastructure
sam build
sam deploy --guided
```

デプロイ完了後、出力される以下の値をメモしてください：
- `ApiEndpoint`
- `UserPoolId`
- `UserPoolClientId`

### 2. Bedrockモデルアクセスの有効化

AWS コンソールで以下を実行：
1. Bedrock コンソールを開く（東京リージョン）
2. Model access で「Claude Sonnet 4.5」を有効化

### 3. フロントエンドセットアップ

```bash
cd frontend

# 依存関係インストール
npm install

# 環境変数設定
cp .env.example .env
# .env を編集してデプロイ時に取得した値を設定

# 開発サーバー起動
npm run dev
```

### 4. Amplify Hosting へデプロイ

```bash
# Amplify CLI でホスティング設定
amplify init
amplify add hosting
amplify publish
```

または AWS コンソールから Amplify Hosting を設定し、Git リポジトリを接続してください。

## プロジェクト構成

```
aws-exam/
├── frontend/              # Vue.js フロントエンド
│   ├── src/
│   │   ├── components/    # 再利用可能コンポーネント
│   │   ├── views/         # ページコンポーネント
│   │   ├── stores/        # Pinia ストア
│   │   ├── services/      # API クライアント
│   │   └── types/         # TypeScript 型定義
│   └── ...
├── backend/               # Lambda 関数
│   └── src/
│       ├── handlers/      # Lambda ハンドラー
│       ├── utils/         # ユーティリティ
│       └── types/         # 共通型定義
└── infrastructure/        # SAM テンプレート
    └── template.yaml
```

## API エンドポイント

| メソッド | パス | 説明 |
|----------|------|------|
| GET | `/categories` | カテゴリ一覧取得 |
| POST | `/questions/generate` | 問題生成（Bedrock） |
| POST | `/answers` | 回答保存 |
| GET | `/answers` | 回答履歴取得 |
| GET | `/answers/stats` | 統計情報取得 |

## SAP試験カテゴリ

| ドメイン | カテゴリ | 配点 |
|----------|----------|------|
| 1 | 複雑な組織に対応するソリューションの設計 | 26% |
| 2 | 新しいソリューションのための設計 | 29% |
| 3 | 既存のソリューションの継続的な改善 | 25% |
| 4 | ワークロードの移行とモダナイゼーションの加速 | 20% |

## ライセンス

MIT
