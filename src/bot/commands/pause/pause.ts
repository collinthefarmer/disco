import {
    BotChatInteractionContext,
    BotCommand,
    BotInteractionContext,
    isChat,
} from "../commands";
import { ApplicationCommandType } from "discord-api-types/v10";

export const pause: BotCommand = {
    name: "pause",
    description: "Pause playback. Playback can be resumed using /play",
    type: ApplicationCommandType.ChatInput,
    reaction: async (ctx: BotInteractionContext) => {
        if (isChat(ctx)) return await pauseChatAction(ctx);
    },
};

async function pauseChatAction(ctx: BotChatInteractionContext) {
    return Promise.resolve(undefined);
}
