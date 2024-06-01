# Work with database

In NestJS Boilerplate uses [PrismaORM](https://www.npmjs.com/package/prisma) and [PostgreSQL](https://www.postgresql.org/) for working with database, and all examples will for [PostgreSQL](https://www.postgresql.org/), but you can use any database.

---

## Table of Contents <!-- omit in toc -->

- [Working with database schema](#working-with-database-schema)
	- [Generate migration](#generate-migration)
- [Working with Database Schema](#working-with-database-schema-1)
	- [Generate Migration](#generate-migration-1)
	- [Run migration](#run-migration)
	- [Revert migration](#revert-migration)
	- [Drop all tables in database](#drop-all-tables-in-database)
- [Seeding](#seeding)
	- [Creating seeds](#creating-seeds)
	- [Run seed](#run-seed)
- [Performance optimization](#performance-optimization)
	- [Indexes and Foreign Keys](#indexes-and-foreign-keys)
	- [Max connections](#max-connections)

---

## Working with database schema

### Generate migration

## Working with Database Schema

### Generate Migration

1. Define your model in the Prisma schema file. For example, to create a `Post` model, add the following to your `schema.prisma` file:

   ```prisma
   // /prisma/schema.prisma

   model Post {
     id    Int    @id @default(autoincrement())
     title String
     body  String
     // Add any other fields you need here
   }

   ```

1. Then, generate the migration file by using the following command:

   ```bash
   npx prisma migrate dev --name create_post_table
   ```

   This command will create a new migration based on changes in your schema and apply it to the database in development mode.

1. To apply migrations in a production environment, use the command:

   ```bash
   npx prisma migrate deploy
   ```

   This command will apply all pending migrations to your production database.

### Run migration

```bash
npx prisma migrate dev

```

### Revert migration

Prisma does not provide a built-in method to revert migrations. If you need to undo a migration, you should create a new migration that will undo the changes made by the previous one.

### Drop all tables in database

```bash
npx prisma migrate reset
```

---

## Seeding

### Creating seeds

1. Create seed file with `npm run seed:create -- --name=Post`. Where `Post` is name of entity.
1. Go to `src/database/seeds/post/post-seed.service.ts`.
1. In `run` method extend your logic.
1. Run [npm run seed:run](#run-seed)

### Run seed

```bash
npm run seed:run
```

---

## Performance optimization

### Indexes and Foreign Keys

Don't forget to create `indexes` on the Foreign Keys (FK) columns (if needed), because by default PostgreSQL [does not automatically add indexes to FK](https://stackoverflow.com/a/970605/18140714).

### Max connections

Set the optimal number of [max connections](https://node-postgres.com/apis/pool) to database for your application in `/.env`:

```txt
DATABASE_MAX_CONNECTIONS=100
```

You can think of this parameter as how many concurrent database connections your application can handle.

---

Previous: [Installing and Running](installing-and-running.md)

Next: [Auth](auth.md)
