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
import { fetchOrCreateSession, fetchOrCreateSource } from "../session";
import { SessionTrack } from "../../../disco/models";

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
    const sess = await fetchOrCreateSession(ctx);
    const user = await fetchOrCreateSource(ctx);

    const track = await sess.addTrack(
        {
            duration: 100,
            size: 1000,
            sourceId: user.id,
        },
        await sess.last
    );
    await ctx.interaction.reply(
        `Playing track ${track.id} right after ${track.prev?.id}`
    );
    //
    // const uri = await composePlaybackUri(ctx, pretext);
    //
    // await queue(contextSession, uri);
    // await ctx.interaction.reply(pretextLabel(pretext));
    // return;
}

async function playAutocompleteAction(ctx: BotAutocompleteInteractionContext) {
    // const options = (
    //     await search(ctx.spotifyClient, pretext, { limit: 3 })
    // ).map((o) => ({
    //     name: "",
    //     value: o.url,
    // }));
    //
    // await ctx.interaction.respond(options);
    // return;
}
