import {
    ApplicationCommandOptionType,
    ApplicationCommandType,
    Interaction,
} from "discord.js";
import { BotCommand, BotCommandContext } from "./bot";
import {
    GOTO_POSITION,
    GOTO_SKIP,
    gotoReaction,
    PLAY_INPUT,
    playReaction,
} from "./play";

export const test: BotCommand = {
    name: "test",
    description: "test description",
    type: ApplicationCommandType.ChatInput,
    dmPermission: false,
    options: [
        {
            name: "testautocomplete",
            type: ApplicationCommandOptionType.String,
            description: "test option",
            autocomplete: true,
        },
    ],
    reaction: async (ctx: BotCommandContext<Interaction>) => {
        if (ctx.interaction.isChatInputCommand()) {
            await ctx.interaction.reply("test received!");
        } else if (ctx.interaction.isAutocomplete())
            await ctx.interaction.respond([
                {
                    name: "autocomplete received!",
                    value: "autocomplete value",
                },
            ]);
    },
};

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
    reaction: playReaction,
};

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
    reaction: gotoReaction,
};
