import { SystemMessage } from "@langchain/core/messages";
import { Annotation, MessagesAnnotation } from "@langchain/langgraph";

import type { NodeRuntimeConfig } from "./config";
import { resolveConfiguration } from "./config";
import { createConfiguredModel } from "./model";
import { SYSTEM_PROMPT } from "./prompt";

export interface PdfContent {
    filename: string;
    text: string;
}

export const AgentStateAnnotation = Annotation.Root({
    ...MessagesAnnotation.spec,
    pdfContents: Annotation<PdfContent[]>({
        default: () => [],
        reducer: (_, y) => y,
    }),
});

export type AgentState = typeof AgentStateAnnotation.State;

// 过滤消息中不支持的 file 类型内容
const sanitizeMessages = (messages: AgentState["messages"]) => {
    return messages.map((message) => {
        if (Array.isArray(message.content)) {
            const filteredContent = message.content
                .map((item: any) => {
                    // 过滤掉 file 类型
                    if (item?.type === "file") {
                        return null;
                    }
                    return item;
                })
                .filter((item: any) => item !== null);

            // 如果内容为空，返回一个空文本
            if (filteredContent.length === 0) {
                return {
                    ...message,
                    content: [{ type: "text", text: "[附件已处理]" }],
                };
            }

            return {
                ...message,
                content: filteredContent,
            };
        }
        return message;
    });
};

export const callModel = async (
    state: AgentState,
    config?: NodeRuntimeConfig,
): Promise<Partial<AgentState>> => {
    const graphConfig = resolveConfiguration(config);
    const model = createConfiguredModel(graphConfig);

    const hasSystemMessage = state.messages.some(
        (message) => message.getType?.() === "system",
    );

    // 过滤掉不支持的 file 类型
    const sanitizedMessages = sanitizeMessages(state.messages);

    const promptMessages = hasSystemMessage
        ? sanitizedMessages
        : [new SystemMessage(SYSTEM_PROMPT), ...sanitizedMessages];

    const response = await model.invoke(promptMessages);
    return { messages: [response] };
};
