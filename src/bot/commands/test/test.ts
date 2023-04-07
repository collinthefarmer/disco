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

export const testOption: ApplicationCommandOptionData = {
    name: "test_autocomplete",
    type: ApplicationCommandOptionType.String,
    description: "test option",
    autocomplete: true,
};

export const test: BotCommand = {
    name: "test",
    description: "test description",
    type: ApplicationCommandType.ChatInput,
    dmPermission: false,
    options: [testOption],
    reaction: async (ctx: BotInteractionContext) => {
        if (isChat(ctx)) return await testChatAction(ctx);
        if (isAutocomplete(ctx)) return await testAutocompleteAction(ctx);
    },
};

async function testChatAction(ctx: BotChatInteractionContext) {
    await ctx.interaction.reply("test received!");
}

async function testAutocompleteAction(ctx: BotAutocompleteInteractionContext) {
    await ctx.interaction.respond([
        {
            name: "autocomplete received!",
            value: ctx.interaction.options.getString("test_autocomplete", true),
        },
    ]);
}
