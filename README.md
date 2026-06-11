# Steakz React/Vite Folder

This folder is **not** the production Steakz website.

The real Steakz MIS portal is the root Express/Pug project:

```text
../src/server.ts
../src/routes/
../src/views/
../public/
../prisma/
```

Production should run on Render from the root project:

```text
https://steakz-final.onrender.com
```

Do not deploy this React/Vite folder to replace the live site unless it is intentionally rebuilt to be identical to the root Express/Pug app.

For local development of the real app, use the root folder:

```bash
cd ..
npm install
npx prisma db push
npm run seed
npm run start:dev
```

Open:

```text
http://localhost:3000/home
```
