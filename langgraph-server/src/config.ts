import { z } from "zod";

const defaultModelName = process.env.DEEPSEEK_MODEL ?? "deepseek-chat";

export const ConfigurationSchema = z.object({
  model: z
    .string()
    .describe("DeepSeek chat model identifier, e.g. deepseek-chat.")
    .default(defaultModelName),
  temperature: z
    .number()
    .min(0)
    .max(2)
    .describe("Sampling temperature passed to DeepSeek.")
    .default(0),
});

export type GraphConfiguration = z.infer<typeof ConfigurationSchema>;
export type NodeRuntimeConfig = { configurable?: unknown };

export const resolveConfiguration = (
  config?: NodeRuntimeConfig,
): GraphConfiguration => {
  const raw =
    (config && typeof config === "object" ? config.configurable : undefined) ??
    {};
  return ConfigurationSchema.parse(raw);
};
