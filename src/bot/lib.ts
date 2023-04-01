import { BotCommandContext } from "./bot";

export interface SearchResult {
    label: string;
    url: string;
}

export async function search(
    value: string,
    hints: Record<string, string> | undefined,
    ctx: BotCommandContext
): Promise<SearchResult> {
    return "";
}

export async function searchMany(
    value: string,
    hints: Record<string, string> | undefined,
    ctx: BotCommandContext,
    options: {
        limit: number;
    }
): Promise<SearchResult[]> {
    return "";
}

export async function urlByQueuePosition(
    position: number,
    ctx: BotCommandContext
): Promise<string> {
    return "";
}
