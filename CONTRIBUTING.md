## environment

I use **[nvm](https://github.com/nvm-sh/nvm)** to manage my node versions.

```bash
brew install nvm
```

## development setup

- create a fork of the repo, clone it, and install the dependencies

```bash
cd task-pool-executor
nvm install
npm install
```

- setup git hooks

```bash
npx husky install
```

- build it in watch mode

```bash
npm run build -- --watch
```
