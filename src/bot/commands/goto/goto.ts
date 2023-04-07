import {
    ApplicationCommandOptionData,
    ApplicationCommandOptionType,
    ApplicationCommandType,
} from "discord.js";

import {
    BotAutocompleteInteractionContext,
    BotChatInteractionContext,
    BotCommand,
    BotInteractionContext,
    isAutocomplete,
    isChat,
} from "../commands";

export const gotoPosition: ApplicationCommandOptionData = {
    name: "position",
    description: "Position of track in the session queue to go to.",
    type: ApplicationCommandOptionType.Integer,
    required: true,
};

export const gotoShouldSkip: ApplicationCommandOptionData = {
    name: "shouldSkip",
    description: "Skip unplayed tracks before this position?",
    type: ApplicationCommandOptionType.Boolean,
    required: false,
};
export const goto: BotCommand = {
    name: "goto",
    description:
        "Move to a position later in the queue, (by default) skipping any tracks between the two points.",
    type: ApplicationCommandType.ChatInput,
    dmPermission: false,
    options: [gotoPosition, gotoShouldSkip],
    reaction: async (ctx: BotInteractionContext) => {
        if (isChat(ctx)) return await gotoChatAction(ctx);
        if (isAutocomplete(ctx)) return await gotoAutocompleteAction(ctx);
    },
};

async function gotoChatAction(ctx: BotChatInteractionContext): Promise<void> {
    return Promise.resolve(undefined);
}

async function gotoAutocompleteAction(
    ctx: BotAutocompleteInteractionContext
): Promise<void> {
    return Promise.resolve(undefined);
}
