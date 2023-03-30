import {
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    Interaction,
} from "discord.js";
import { BotCommandContext } from "./bot";
import { isEmptyObject } from "../util";
import { search, urlByQueuePosition } from "./lib";

export interface PlaybackQuery {
    query: "searchQuery" | "url" | "resume" | "goto";
    value: string;
    hints?: Record<string, string>;
}

export const PLAYBACK_INPUT = "play_input";

export async function playReaction(ctx: BotCommandContext<Interaction>) {
    if (ctx.interaction.isChatInputCommand())
        return inputPlay(ctx as BotCommandContext<ChatInputCommandInteraction>);

    if (ctx.interaction.isAutocomplete())
        return autocompletePlay(
            ctx as BotCommandContext<AutocompleteInteraction>
        );
}

/**
 *
 * hints should specify search hints for finding tracks to add to playback
 * optional, but must be provided in the format:
 *
 *     <hint_key>:<hint_value>
 *
 * and separated from the (optional) actual search query by "-"
 *
 * e.g.,
 * artist:abba album:arrival - dancing queen
 *
 * a literal "-" in a hint value can be escaped with a "\"
 */
function formPlaybackQuery(input: string): PlaybackQuery {
    input = input.trim();

    // this may need some tinkering, but it should output matches as (key, value)
    const hintPattern = /([a-zA-Z]+):(.+?)(?=\w*:|$|([^\\]-))/g;

    const hintMatches = input.matchAll(hintPattern);
    const hints: Record<string, string> = {};

    let valueStart = 0;
    for (const match of hintMatches) {
        // we don't care what the hint key is here
        // leave validation up to function handling playback
        const key = match[1].trim();
        hints[key] = match[2].trim();

        valueStart += match[0].length + 1;
    }

    if (!isEmptyObject(hints)) {
        const value = input.slice(valueStart).trim();
        return {
            query: "searchQuery",
            value,
            hints,
        };
    }

    return { query: "searchQuery", value: input };
}

async function inputPlay(ctx: BotCommandContext<ChatInputCommandInteraction>) {
    const input = ctx.interaction.options.getString(PLAYBACK_INPUT);
    if (!input) return playResume(ctx);
    if (input.startsWith("https://")) return playUrl(input, ctx);
    return playSearchQuery(formPlaybackQuery(input), ctx);
}

async function playResume(ctx: BotCommandContext<ChatInputCommandInteraction>) {
    return playGoto(0, ctx);
}

async function playGoto(
    position: number,
    ctx: BotCommandContext<ChatInputCommandInteraction>
) {
    return playUrl(await urlByQueuePosition(position, ctx), ctx);
}

async function playSearchQuery(
    query: PlaybackQuery,
    ctx: BotCommandContext<ChatInputCommandInteraction>
) {
    await ctx.interaction.reply(
        `searching based on query: ${JSON.stringify(query)}}`
    );
    return playUrl(await search(query.value, query.hints, ctx), ctx);
}

async function playUrl(
    url: string,
    ctx: BotCommandContext<ChatInputCommandInteraction>
) {
    // we should do validation on the url before starting its playback
    return Promise.resolve(undefined);
}

async function autocompletePlay(
    ctx: BotCommandContext<AutocompleteInteraction>
) {}

/**
 * Skip to a position in the queue
 */

export async function goto() {
    // const asNumber = parseInt(input, 10)
    // if (!isNaN(asNumber)) {
    //
    //     return {
    //         type: "queuePosition",
    //         value: asNumber
    //     }
    // }
}
