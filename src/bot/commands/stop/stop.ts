import {
    BotChatInteractionContext,
    BotCommand,
    BotInteractionContext,
    isChat,
} from "../commands";
import { ApplicationCommandType } from "discord-api-types/v10";

export const stop: BotCommand = {
    name: "stop",
    description:
        "Stop playback and end the session. (WARNING: any un-played tracks will be removed!)",
    type: ApplicationCommandType.ChatInput,
    dmPermission: false,
    reaction: async (ctx: BotInteractionContext) => {
        if (isChat(ctx)) return await stopChatAction(ctx);
    },
};

async function stopChatAction(ctx: BotChatInteractionContext) {
    return Promise.resolve(undefined);
}
