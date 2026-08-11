# Kinfolk — Family Tree Management

A genealogy management app for tracking ancestry, family relationships, and historical records across generations.

Built with **Next.js**, **TypeScript**, **Prisma**, and **SQLite**.

## Features

- Account auth (register / login / logout)
- People profiles with biography and life details
- Parent and spouse relationships
- Historical records (birth, marriage, migration, and more)
- Searchable people archive
- Family tree view focused on a selected person

## Setup

```bash
npm install
npm run db:setup
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo login

- Email: `demo@kinfolk.app`
- Password: `demo1234`

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start development server |
| `npm run db:setup` | Create database schema and seed demo data |
| `npm run db:seed` | Re-seed demo data |
| `npm run build` | Production build |
