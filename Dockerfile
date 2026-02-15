# --- Stage 1: 依存関係のインストール (Deps) ---
FROM node:24-alpine AS deps
# libc6-compatは一部のネイティブ依存関係に必要（必要に応じて有効化）
RUN apk add --no-cache libc6-compat
WORKDIR /app

# パッケージ定義をコピーしてインストール
COPY package.json package-lock.json* ./
RUN npm ci

# --- Stage 2: ビルド (Builder) ---
FROM node:24-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Next.jsのテレメトリを無効化（任意）
ENV NEXT_TELEMETRY_DISABLED=1

# ビルド実行
RUN npm run build

# --- Stage 3: 本番実行環境 (Runner) ---
FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# セキュリティのため非ルートユーザーを作成
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 静的ファイルとスタンドアロンビルドアーティファクトのみをコピー
COPY --from=builder /app/public ./public

# 権限設定とアーティファクトのコピー
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000

# server.js経由で起動
CMD ["node", "server.js"]