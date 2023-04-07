import {
    BotChatInteractionContext,
    BotCommand,
    BotInteractionContext,
    isChat,
} from "../commands";

import { ApplicationCommandType } from "discord-api-types/v10";

export const skip: BotCommand = {
    name: "skip",
    description: "Skip to the next track in the session queue.",
    type: ApplicationCommandType.ChatInput,
    dmPermission: false,
    reaction: async (ctx: BotInteractionContext) => {
        if (isChat(ctx)) return await skipChatAction(ctx);
    },
};

async function skipChatAction(ctx: BotChatInteractionContext) {
    return Promise.resolve(undefined);
}
