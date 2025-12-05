import "dotenv/config";
import { StateGraph, END } from "@langchain/langgraph";

import { ConfigurationSchema } from "./config";
import { callModel, AgentStateAnnotation, type AgentState } from "./callModel";
import { processPDF } from "./processPDF";
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

const workflow = new StateGraph(AgentStateAnnotation, ConfigurationSchema)
  .addNode("processPDF", processPDF)
  .addNode("callModel", callModel)
  .addNode("tools", toolNode)
  .addEdge("__start__", "processPDF")
  .addEdge("processPDF", "callModel")
  .addConditionalEdges("callModel", routeModelOutput)
  .addEdge("tools", "callModel");

export const graph = workflow.compile();
