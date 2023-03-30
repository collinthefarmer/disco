import { BotCommandContext } from "./bot";

export async function search(
    value: string,
    hints: Record<string, string> | undefined,
    ctx: BotCommandContext
) {
    return "";
}

export async function urlByQueuePosition(
    position: number,
    ctx: BotCommandContext
): Promise<string> {
    return ""
}