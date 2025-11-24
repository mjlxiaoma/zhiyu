import "dotenv/config";
import { MessagesAnnotation, StateGraph, END } from "@langchain/langgraph";

import { ConfigurationSchema } from "./config";
import { callModel, type AgentState } from "./callModel";
import { toolNode } from "./toolNode";

const routeModelOutput = (state: AgentState) => {
  const lastMessage = state.messages[state.messages.length - 1];
  if (
    lastMessage &&
    "tool_calls" in lastMessage &&
    Array.isArray(lastMessage.tool_calls) &&
    lastMessage.tool_calls.length > 0
  ) {
    return "tools";
  }

  return END;
};

const workflow = new StateGraph(MessagesAnnotation, ConfigurationSchema)
  .addNode("callModel", callModel)
  .addNode("tools", toolNode)
  .addEdge("__start__", "callModel")
  .addConditionalEdges("callModel", routeModelOutput)
  .addEdge("tools", "callModel");

export const graph = workflow.compile();
