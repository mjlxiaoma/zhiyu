import { ChatDeepSeek } from "@langchain/deepseek";

import type { GraphConfiguration } from "./config";
import { tools } from "./tools";

export const createConfiguredModel = (config: GraphConfiguration) =>
  new ChatDeepSeek({
    model: config.model,
    temperature: config.temperature,
  }).bindTools(tools);
