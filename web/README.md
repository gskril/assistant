## Getting Started

Install the dependencies:

```bash
yarn install
```

Set the environment variables:

```bash
cp .env.example .env.local
```

Run the development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deploy

This app can be deployed to [Vercel](https://vercel.com/), but note that the serverless function may timeout on longer requests (less likely to happen with a paid account).

You can get around that by deploying to [Railway](https://railway.app?referralCode=ONtqGs) instead.

The ideal solution is probably to split up the [one big server action](src/app/actions.ts) into multiple smaller ones, but I haven't gotten around to that yet. Feel free to submit a PR if you want to help out!
