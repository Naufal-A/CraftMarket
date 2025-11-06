# CraftMarket
## 🛠 Tech Stack

- 🛣️ [Next.js](https://nextjs.org) as frameworks
- ⚛️ [React 19](https://react.dev/)
- 🎨 [TailwindCSS](https://tailwindcss.com/) with custom theme
- 🎯 [TypeScript](https://www.w3schools.com/Js/) for type safety

## 🚀 Getting Started

### Prerequisites
- Node.js 
- npm or pnpm
- Git
- VS Code (recommended)

### First Time Setup

1. **Clone Repository**

   ```powershell
   git clone https://github.com/Naufal-A/CraftMarket.git
   cd PROJECT-PPW-K3
   ```

2. **Setup Node.js**

   ```powershell
   # Install and use correct Node.js version
   nvm install lts/*
   nvm use lts/*
   ```

3. **Install Dependencies**

   ```powershell
   # Install project dependencies
   npm install

   # Setup Git hooks
   npm run prepare
   ```

4. **VS Code Setup** 
    Install recommended extensions:
   - ESLint
   - Prettier
   - Tailwind CSS IntelliSense
   - GitLens

## 🚀 Deployment

### Production Build

```bash
npm run dev
```

## 🔄 Git Workflow

### Commit Convention

```
type(scope): subject
feat(auth): add user authentication
fix(api): handle network errors
docs(readme): update deployment steps
```

### Branch Strategy

- `main`: Production-ready code
- `develop`: Development branch
- `feature/*`: New features
- `fix/*`: Bug fixes


