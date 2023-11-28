# Next.js and Discord.js template with tRPC and Prisma running on the Express server

Discord.js + Next.js + Express Template 🌐 Seamlessly connect with Prisma and tRPC on an Express server. Send events to your bot, and receive real-time responses. Elevate your project with this powerful integration template!

## Getting Started

-   Clone the repository or click "Use this template" to create your repository.
-   Run `npm install` to install all of the dependencies.
-   Rename `.env.example` to `.env` and fill out the variables.
-   Setup your database provider in the `prisma/schema.prisma` file. (MongoDB default)
-   Generate the Prisma client: `npx prisma generate` (or pull the schema from an existing database: `npx prisma db pull`)
-   Start the app by running `npm run dev`

## ESLint

By default, there is installed ESLint with many rules for both app and bot files.
If you want to keep only NextJS rules follow these steps:

-   Empty `.eslintrc.json` file.
-   Paste the default configuration in there.

```json
{
    "extends": "next/core-web-vitals"
}
```

-   Run:

```bash
npm remove @typescript-eslint/eslint-plugin @typescript-eslint/parser
```

## Prisma

By default, prisma is configured to connect with a MongoDB server.
It can be changed in `prisma/schema.prisma` file.
After the change, the default model needs to be updated as well.
If you decide to use MongoDB - Prisma requires it to be configured as replica set. You can get it for free [here](https://www.mongodb.com/cloud/atlas/register) or make it on your own following [this](https://gist.github.com/imomaikel/3a87be24e64ae8626cf2c528b9a600bd) tutorial

## Defaults

There is a simple app ready to be used and check if everything works.
That includes:

-   Send a Discord message through the Next.js app using tRPC
-   Create an entry in the database (tRPC & zod)
-   Fetch entries in the database (tRPC)

![Preview](preview.gif)

## Security

You decide which routes should require auth. To configure that, head over to `src/trpc/trpc.ts`
By default, it is hardcoded to allow all requests.

## Discord.js

By default, there is a simple test command to check if everything works:

`!ping` with bot response: `Pong!`

The events logic is also ready out of the box (generic functions with autocomplete)

## Zod

There is zod installed to verify tRPC inputs.

## File structure

-   `prisma/schema.prisma` used to define database models.
-   `src/app/_components` used not to clutter the src directory (`_<name>` is skipped in the app router)
-   `src/app/page.tsx` the main Next.js page
-   `src/bot/events` to listen for Discord.js client events (ready state, new message, interactions, ...)
-   `src/bot/utils/events.ts` typescript functions to get autocomplete
-   `src/bot/utils/env.ts` load `.env` variables with autocomplete
-   `src/bot/api.ts` functions that are called using tRPC

## Nodemon

By default, the server is restarting when it detects any change in:

-   `src/server.ts` - root file that starts the bot and app
-   `src/bot/**/*` - discord bot that needs to be restarted to see a change
-   `src/trpc/*` - any changes in routes

To change that behavior, edit the `nodemon.json` file.

## Build

All build scripts are ready out of the box.
Use `npm run build` to build the whole app.
After that, run `npm run start` to start the production version.

## Troubleshooting

If you encounter error like `Error: Cannot find module ...` make sure that you don't use a custom alias import (example: `@/bot`), instead use a relative path (example: `../bot`). It can only occur when importing tRPC or calling Discord bot functions. Importing `tsx` components will work as it should.

## Deploy on Vercel

Vercel does not allow uploading of a custom server on their platform.
