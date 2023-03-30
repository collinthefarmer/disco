import {
    ApplicationCommandOptionType,
    ApplicationCommandType,
    Interaction,
} from "discord.js";
import { BotCommand, BotCommandContext } from "./bot";
import { PLAYBACK_INPUT, playReaction } from "./play";

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
            name: PLAYBACK_INPUT,
            description: "Token for track to be played.",
            type: ApplicationCommandOptionType.String,
            autocomplete: true,
            required: false,
        },
    ],
    reaction: playReaction,
};
