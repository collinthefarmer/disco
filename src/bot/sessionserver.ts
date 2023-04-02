import {BotCommandContext} from "./bot";

export async function getSessionId(ctx: BotCommandContext): Promise<string> {

}

export async function queue(sessionId: string, uri: string): Promise<void>