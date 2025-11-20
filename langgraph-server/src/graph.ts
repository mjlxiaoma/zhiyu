import "dotenv/config";
import { MessagesAnnotation, StateGraph } from "@langchain/langgraph";
import { ChatDeepSeek } from "@langchain/deepseek";

type AgentState = typeof MessagesAnnotation.State;

const model = new ChatDeepSeek({
  model: process.env.DEEPSEEK_MODEL ?? "deepseek-chat",
  temperature: 0,
});

const replyWithLLM = async (state: AgentState): Promise<Partial<AgentState>> => {
  const response = await model.invoke(state.messages);
  return { messages: [response] };
};

const workflow = new StateGraph(MessagesAnnotation)
  .addNode("agent", replyWithLLM)
  .addEdge("__start__", "agent")
  .addEdge("agent", "__end__");

export const graph = workflow.compile();
