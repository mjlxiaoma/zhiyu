## LangGraph Agent Server

This project exposes a minimal LangGraph.js agent that forwards every
conversation turn to a DeepSeek chat model and can branch into a tool node for
Tavily search or simple server-time lookups. The LangGraph CLI is responsible for
running the HTTP server, hot reloading, and providing a LangGraph-native dev
experience.

### Prerequisites

1. Node.js 20.16+ (the CLI enforces this requirement).
2. A valid `DEEPSEEK_API_KEY`.
3. A valid `TAVILY_API_KEY` for the search tool.

### Setup

```bash
cp .env.example .env        # fill with your DeepSeek API key
npm install
```

Optional environment variables:

- `DEEPSEEK_MODEL`: overrides the default `deepseek-chat`.

At runtime you can also pass `configurable` overrides (model / temperature) via
the LangGraph CLI when invoking the graph.

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

- `src/graph.ts` defines:
  - `ConfigurationSchema` to control model + temperature at runtime.
  - `callModel` node that binds the DeepSeek model to exposed tools.
  - `ToolNode` that currently runs Tavily search plus a server-time helper.
  - `routeModelOutput` to loop between `callModel` and `tools`.
- `langgraph.json` lets the CLI know which graph to expose and which env file to
  load.
