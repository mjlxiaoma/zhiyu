import { tool } from "@langchain/core/tools";
import { TavilySearch } from "@langchain/tavily";

import { z } from "zod";

const tavilySearchTool = new TavilySearch({
  maxResults: 5,
  topic: "general",
});

const serverTimeTool = tool(
  async () => ({
    isoTimestamp: new Date().toISOString(),
  }),
  {
    name: "get_server_time",
    description: "Return the server's current ISO timestamp.",
    schema: z.object({}),
  },
);

export const tools = [tavilySearchTool, serverTimeTool];


