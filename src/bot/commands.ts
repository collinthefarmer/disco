import {
    ApplicationCommandOptionType,
    ApplicationCommandType,
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    Interaction,
} from "discord.js";
import { BotCommand, BotCommandContext } from "./bot";
import {
    buildPlaybackPretext,
    composePlaybackUri,
    PlaybackType,
    pretextLabel,
} from "./playback";

export const test: BotCommand = {
    name: "test",
    description: "test description",
    type: ApplicationCommandType.ChatInput,
    dmPermission: false,
    options: [
        {
            name: "test_autocomplete",
            type: ApplicationCommandOptionType.String,
            description: "test option",
            autocomplete: true,
        },
    ],
    reaction: async (ctx: BotInteractionContext) => {
        if (isChat(ctx)) await ctx.interaction.reply("test received!");
        else if (isAutocomplete(ctx))
            await ctx.interaction.respond([
                {
                    name: "autocomplete received!",
                    value: ctx.interaction.options.getString(
                        "test_autocomplete",
                        true
                    ),
                },
            ]);
    },
};

export const PLAY_INPUT = "play_input";
export const play: BotCommand = {
    name: "play",
    description:
        "Start playing a track, add a new track to the queue, or resume paused playback.",
    type: ApplicationCommandType.ChatInput,
    dmPermission: false,
    options: [
        {
            name: PLAY_INPUT,
            description: "Token for track to be played.",
            type: ApplicationCommandOptionType.String,
            autocomplete: true,
            required: false,
        },
    ],
    reaction: async (ctx: BotInteractionContext) => {
        if (!(isChat(ctx) || isAutocomplete(ctx))) return;

        const pretext = await buildPlaybackPretext(ctx);

        if (isChat(ctx)) {
            const uri = await composePlaybackUri(ctx, pretext);
            const contextSession = await getSessionId(ctx);

            await queue(contextSession, uri);
            await ctx.interaction.reply(pretextLabel(pretext));
            return;
        }

        if (pretext.type === PlaybackType.url) {
            const options = (
                await search(ctx.spotifyClient, pretext, { limit: 3 })
            ).map((o) => ({
                name: "",
                value: o.url,
            }));

            await ctx.interaction.respond(options);
            return;
        }
    },
};

export const GOTO_POSITION = "goto_position";
export const GOTO_SKIP = "goto_skip";
export const goto: BotCommand = {
    name: "goto",
    description:
        "Move to a position later in the queue, (by default) skipping any tracks between the two points.",
    type: ApplicationCommandType.ChatInput,
    dmPermission: false,
    options: [
        {
            name: GOTO_POSITION,
            description: "Position of track to go to.",
            type: ApplicationCommandOptionType.Integer,
            required: true,
        },
        {
            name: GOTO_SKIP,
            description: "Skip unplayed tracks before this position?",
            type: ApplicationCommandOptionType.Boolean,
            required: false,
        },
    ],
    reaction: async (ctx: BotInteractionContext) => {
        if (isChat(ctx)) {
            // todo
        } else if (isAutocomplete(ctx)) {
            // todo
        }
    },
};

// export const skip: BotCommand = {} todo
// export const stop: BotCommand = {} todo
// export const pause: BotCommand = {} todo

/**
 * if playback can't be done synchronously and from a centralized source
 * ie., from a voice bot streaming audio directly to a channel
 * we need some way of letting people sync their track progress to \
 * \ where the rest of the group is at.
 *      though, this raises the question of how to manage that sync.
 *
 */
//
// ie., from a voice bot streaming audio
// we need some way of letting people sync their track progress to
// where the rest of the group is at
// export const sync: BotCommand = {} todo

export type BotInteractionContext = BotCommandContext<Interaction>;
export type BotChatInteractionContext =
    BotCommandContext<ChatInputCommandInteraction>;
export type BotAutocompleteInteractionContext =
    BotCommandContext<AutocompleteInteraction>;

function isChat(ctx: BotInteractionContext): ctx is BotChatInteractionContext {
    return ctx.interaction.isChatInputCommand();
}

function isAutocomplete(
    ctx: BotInteractionContext
): ctx is BotAutocompleteInteractionContext {
    return ctx.interaction.isAutocomplete();
}
