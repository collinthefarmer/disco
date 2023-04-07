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
import { fetchOrCreateSession } from "../session";

export const playInput: ApplicationCommandOptionData = {
    name: "playInput",
    description: "Token for track to be played",
    type: ApplicationCommandOptionType.String,
    autocomplete: true,
    required: false,
};
export const play: BotCommand = {
    name: "play",
    description:
        "Start playing a track, add a new track to the queue, or resume paused playback.",
    type: ApplicationCommandType.ChatInput,
    dmPermission: false,
    options: [playInput],
    reaction: async (ctx: BotInteractionContext) => {
        if (isChat(ctx)) return playChatAction(ctx);
        if (isAutocomplete(ctx)) return playAutocompleteAction(ctx);
    },
};

async function playChatAction(ctx: BotChatInteractionContext) {
    const contextSession = await fetchOrCreateSession(ctx);

    const uri = await composePlaybackUri(ctx, pretext);

    await queue(contextSession, uri);
    await ctx.interaction.reply(pretextLabel(pretext));
    return;
}

async function playAutocompleteAction(ctx: BotAutocompleteInteractionContext) {
    const options = (
        await search(ctx.spotifyClient, pretext, { limit: 3 })
    ).map((o) => ({
        name: "",
        value: o.url,
    }));

    await ctx.interaction.respond(options);
    return;
}
