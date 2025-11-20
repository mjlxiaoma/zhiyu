## LangGraph Agent Server

This project exposes a minimal LangGraph.js agent that simply forwards every
conversation turn to a DeepSeek chat model. The LangGraph CLI is responsible for
running the HTTP server, hot reloading, and providing a LangGraph-native dev
experience.

### Prerequisites

1. Node.js 20.16+ (the CLI enforces this requirement).
2. A valid `DEEPSEEK_API_KEY`.

### Setup

```bash
cp .env.example .env        # fill with your DeepSeek API key
npm install
```

Optional: set `DEEPSEEK_MODEL` if you prefer a different DeepSeek chat model.
The default is `deepseek-chat`.

### Run the LangGraph server

```bash
npm run dev
```

The CLI will load `langgraph.json`, spin up the LangGraph API (default port
2024), and hot-reload whenever files in `src/` change. You can send requests to
`POST /graph/agent/invoke` with the usual LangGraph payload format, or open the
built-in playground UI when prompted in the terminal.

### Build / type-check

```bash
npm run typecheck   # validate TypeScript types without emitting files
npm run build       # emit compiled JavaScript to dist/
```

### Project structure

- `src/graph.ts` defines a `StateGraph` that accepts conversation messages and
  responds with a single DeepSeek completion.
- `langgraph.json` lets the CLI know which graph to expose and which env file to
  load.
