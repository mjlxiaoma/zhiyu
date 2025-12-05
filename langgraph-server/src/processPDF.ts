import { HumanMessage } from "@langchain/core/messages";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfParse = require("pdf-parse");

import type { AgentState, PdfContent } from "./callModel";

export const processPDF = async (
    state: AgentState,
): Promise<Partial<AgentState>> => {
    const lastMessage = state.messages[state.messages.length - 1];

    if (!lastMessage || !Array.isArray(lastMessage.content)) {
        return {};
    }

    const pdfItems = lastMessage.content.filter(
        (item: any) =>
            item?.type === "file" && item?.mimeType === "application/pdf",
    );

    if (pdfItems.length === 0) {
        return {};
    }

    const pdfContents: PdfContent[] = [];

    for (const pdfContent of pdfItems) {
        const base64Data = (pdfContent as any).data;
        const fileName = (pdfContent as any).metadata?.filename ?? "unknown.pdf";

        const buffer = Buffer.from(base64Data, "base64");
        try {
            const pdfData = await pdfParse(buffer);
            const text = pdfData.text;
            console.log(`File: ${fileName}`);
            console.log("PDF Text Content:");
            console.log(text);

            pdfContents.push({
                filename: fileName,
                text: text,
            });
        } catch (error) {
            console.error("Error parsing PDF:", error);
            pdfContents.push({
                filename: fileName,
                text: `[Error parsing PDF: ${error}]`,
            });
        }
    }

    const newContent = lastMessage.content
        .map((item: any) => {
            if (item?.type === "file" && item?.mimeType === "application/pdf") {
                const fileName = item.metadata?.filename ?? "unknown.pdf";
                const pdfContent = pdfContents.find(p => p.filename === fileName);
                return {
                    type: "text",
                    text: `[PDF文件: ${fileName}]\n${pdfContent?.text ?? "[无法解析PDF内容]"}`,
                };
            }
            // 过滤掉其他不支持的 file 类型
            if (item?.type === "file") {
                return null;
            }
            return item;
        })
        .filter((item: any) => item !== null);

    const updatedMessage = new HumanMessage({
        content: newContent,
    });

    const updatedMessages = [
        ...state.messages.slice(0, -1),
        updatedMessage,
    ];

    return {
        messages: updatedMessages,
        pdfContents: pdfContents,
    };
};
