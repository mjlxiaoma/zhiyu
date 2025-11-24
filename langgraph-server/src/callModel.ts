import { SystemMessage } from "@langchain/core/messages";
import { MessagesAnnotation } from "@langchain/langgraph";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { PDFParse } = require("pdf-parse");

import type { NodeRuntimeConfig } from "./config";
import { resolveConfiguration } from "./config";
import { createConfiguredModel } from "./model";
import { SYSTEM_PROMPT } from "./prompt";

export type AgentState = typeof MessagesAnnotation.State;

export const callModel = async (
    state: AgentState,
    config?: NodeRuntimeConfig,
): Promise<Partial<AgentState>> => {
    const lastMessage = state.messages[state.messages.length - 1];
    if (lastMessage && Array.isArray(lastMessage.content)) {
        const pdfContent = lastMessage.content.find(
            (item: any) =>
                item?.type === "file" && item?.mimeType === "application/pdf",
        ) as any;

        if (pdfContent) {
            const base64Data = pdfContent.data;
            const fileName = pdfContent.metadata?.filename ?? "";

            const buffer = Buffer.from(base64Data, "base64");
            try {
                const instance = new PDFParse(new Uint8Array(buffer));
                const text = await instance.getText();
                console.log(`File: ${fileName}`);
                console.log("PDF Text Content:");
                console.log(text);
            } catch (error) {
                console.error("Error parsing PDF:", error);
            }

            return {};
        }
    }

    const graphConfig = resolveConfiguration(config);
    const model = createConfiguredModel(graphConfig);

    const hasSystemMessage = state.messages.some(
        (message) => message.getType?.() === "system",
    );
    const promptMessages = hasSystemMessage
        ? state.messages
        : [new SystemMessage(SYSTEM_PROMPT), ...state.messages];

    const response = await model.invoke(promptMessages);
    return { messages: [response] };
};
