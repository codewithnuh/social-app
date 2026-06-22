#!/bin/bash

set -e

PROJECT_NAME=${1:-social-app}

echo "🚀 Creating project monorepo: $PROJECT_NAME"

mkdir -p "$PROJECT_NAME"
cd "$PROJECT_NAME"

# 1. Root Configuration
echo "📦 Creating root package.json..."
cat > package.json <<EOF
{
  "name": "$PROJECT_NAME-monorepo",
  "private": true,
  "version": "1.0.0",
  "engines": {
    "node": ">=18"
  },
  "scripts": {
    "dev": "concurrently \"pnpm --filter backend dev\" \"pnpm --filter frontend dev\""
  }
}
EOF

echo "⚙️ Creating pnpm workspace config..."
cat > pnpm-workspace.yaml <<EOF
packages:
  - "apps/*"
  - "packages/*"
EOF

# Create directory structures
mkdir -p apps
mkdir -p packages/shared/src

# 2. Setup Shared Package for Types and Schemas
echo "🧩 Setting up shared internal package..."
cat > packages/shared/package.json <<EOF
{
  "name": "@$PROJECT_NAME/shared",
  "version": "1.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts"
}
EOF

cat > packages/shared/src/index.ts <<EOF
// Export shared validation schemas and TypeScript types here
import { z } from 'zod';

export const UserUserRegisterSchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6)
});

export type UserRegisterInput = z.infer<typeof UserUserRegisterSchema>;
EOF


# 3. Setup React Frontend
echo "⚛️ Creating React frontend via Vite..."
pnpm create vite apps/frontend --template react-ts

echo "📥 Installing frontend dependencies..."
cd apps/frontend
pnpm add axios react-router-dom @tanstack/react-query react-hook-form zod @hookform/resolvers
pnpm add @mui/material @mui/icons-material @emotion/react @emotion/styled
# Link the shared package locally
pnpm add "@$PROJECT_NAME/shared" --workspace
cd ../..


# 4. Setup Express Backend
echo "🟢 Creating backend..."
mkdir -p apps/backend
cd apps/backend

cat > package.json <<EOF
{
  "name": "backend",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
    "build": "tsc"
  }
}
EOF

echo "📥 Installing backend dependencies..."
pnpm add express mongoose bcryptjs jsonwebtoken cors dotenv express-validator zod
pnpm add -D typescript ts-node-dev prettier @types/node @types/express @types/cors @types/jsonwebtoken @types/bcryptjs
# Link the shared package locally
pnpm add "@$PROJECT_NAME/shared" --workspace

cat > tsconfig.json <<EOF
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "dist"
  },
  "include": ["src"]
}
EOF

mkdir -p src/{config,controllers,middleware,models,routes,services,utils,types}
cat > src/index.ts <<EOF
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: "Backend operational" });
});

app.listen(5000, () => console.log('Server running on port 5000'));
EOF

cd ../..


# 5. Global Config Files
echo "📝 Creating global configurations..."
cat > .gitignore <<EOF
node_modules
dist
.env
.DS_Store
EOF

cat > .prettierrc <<EOF
{
  "semi": true,
  "singleQuote": true
}
EOF

# Finalizing
echo "📥 Adding concurrently to workspace tools..."
pnpm add -wD concurrently

echo "⚡ Running initial pnpm install to link workspaces..."
pnpm install

echo ""
echo "✨ Monorepo setup complete! No processes have been started. ✨"
echo ""
echo "$PROJECT_NAME"
echo "├── apps"
echo "│   ├── backend"
echo "│   └── frontend"
echo "├── packages"
echo "│   └── shared"
echo "├── package.json"
echo "├── pnpm-workspace.yaml"
echo "├── .gitignore"
echo "└── .prettierrc"
echo ""
echo "To manual launch later:"
echo "  cd $PROJECT_NAME"
echo "  pnpm dev"
echo ""