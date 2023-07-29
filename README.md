# Drizzle Playground

This is a quick repo just to figure out how to get Drizzle set up nicely and
also play around with it's features.

## Getting started

If you want to use the DB defined in the dockercompose file, that will match the
default credentials in the `.env` file, run the command below:

```shell
pnpm localDB:up
```

then sync and seed the new database with:

```shell
pnpm db:seed
```

Then the command below will run the script defined in `./src/index.ts`

```shell
pnpm dev
```
