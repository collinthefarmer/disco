import {BotAutocompleteInteractionContext, BotChatInteractionContext, PLAY_INPUT} from "./commands";
import {isUrl} from "../util";
import {search, SearchOptions, SearchResult, SearchResultType} from "../lib/search";
import {BotCommandContext} from "./bot";
import {getSessionId} from "./sessionserver";

export enum PlaybackType {
    goto,
    search,
    url,
}

interface PlaybackPretextGoto {
    type: PlaybackType.goto,
    query: number;
}

type PlaybackPretextSearchHints = Record<string, string>;

interface PlaybackPretextSearch {
    type: PlaybackType.search,
    query: string,
    hints: PlaybackPretextSearchHints;
}

interface PlaybackPretextUrl {
    type: PlaybackType.url,
    query: string
}

export type PlaybackPretext = PlaybackPretextGoto | PlaybackPretextSearch | PlaybackPretextUrl;

export interface PlaybackAutocompleteOption {
    icon?: string;
    labelPrimary: string;
    labelSecondary?: string;
    value: string;
}

export async function buildPlaybackPretext(ctx: BotChatInteractionContext | BotAutocompleteInteractionContext): Promise<PlaybackPretext> {
    const seed = ctx.interaction.options.getString(PLAY_INPUT);

    if (!seed) return {type: PlaybackType.goto, query: 0};
    else if (isUrl(seed)) return {type: PlaybackType.url, query: seed};
    else return buildSearchPretext(ctx, seed);
}

export async function pretextAutocompleteOptions(ctx: BotAutocompleteInteractionContext, ptx: PlaybackPretext, options?: SearchOptions): Promise<PlaybackAutocompleteOption[]> {
    if (ptx.type !== PlaybackType.search) return [];

    const typeIcons: Record<SearchResultType, string> = {
        [SearchResultType.album]: "💿",
        [SearchResultType.artist]: "🎤",
        [SearchResultType.audiobook]: "📖",
        [SearchResultType.file]: "📑",
        [SearchResultType.playlist]: "🎼",
        [SearchResultType.podcast]: "🎙️",
        [SearchResultType.show]: "📻",
        [SearchResultType.track]: "🎶",
        [SearchResultType.unknown]: "❔"
    }

    return (await search(ctx.spotifyClient, ptx, options)).map((r) => ({
        icon: typeIcons[r.type],
        labelPrimary: "",
        labelSecondary: "",
        value: ""
    }))
}

export async function composePlaybackUri(ctx: BotCommandContext, ptx: PlaybackPretext): Promise<string> {
    if (ptx.type === PlaybackType.url) return ptx.query;
    if (ptx.type === PlaybackType.goto) {
        const sessionId = await getSessionId(ctx);
        return `disco://${sessionId}/${ptx.query}`
    }

    return (await reifySearchPretext(ptx)).url;
}

export function pretextLabel(ptx: PlaybackPretext): string {

}

function buildSearchPretext(ctx: BotChatInteractionContext | BotAutocompleteInteractionContext, query: string): PlaybackPretextSearch {

}

async function reifySearchPretext(ptx: PlaybackPretextSearch): Promise<SearchResult> {

}


// import {
//     AutocompleteInteraction,
//     ChatInputCommandInteraction,
//     Interaction,
// } from "discord.js";
// import {BotCommandContext} from "./bot";
// import {isEmptyObject} from "../util";
// import {search, searchMany, urlByQueuePosition} from "./lib";
//
//
//
//
// export interface PlaybackQuery {
//     query: "searchQuery" | "url" | "resume" | "goto";
//     value: string;
//     hints?: Record<string, string>;
// }
//
// export const PLAY_INPUT = "play_input";
//
// export async function playReaction(ctx: BotCommandContext<Interaction>) {
//     if (ctx.interaction.isChatInputCommand())
//         return inputPlay(ctx as BotCommandContext<ChatInputCommandInteraction>);
//
//     if (ctx.interaction.isAutocomplete())
//         return autocompletePlay(
//             ctx as BotCommandContext<AutocompleteInteraction>
//         );
// }
//
// /**
//  *
//  * hints should specify search hints for finding tracks to add to playback
//  * optional, but must be provided in the format:
//  *
//  *     <hint_key>:<hint_value>
//  *
//  * and separated from the (optional) actual search query by "-"
//  *
//  * e.g.,
//  * artist:abba album:arrival - dancing queen
//  *
//  * a literal "-" in a hint value can be escaped with a "\"
//  */
// function formPlaybackQuery(input: string): PlaybackQuery {
//     input = input.trim();
//
//     // this may need some tinkering, but it should output matches as (key, value)
//     const hintPattern = /([a-zA-Z]+):(.+?)(?=\w*:|$|([^\\]-))/g;
//
//     const hintMatches = input.matchAll(hintPattern);
//     const hints: Record<string, string> = {};
//
//     let valueStart = 0;
//     for (const match of hintMatches) {
//         // we don't care what the hint key is here
//         // leave validation up to function handling playback
//         const key = match[1].trim();
//         hints[key] = match[2].trim();
//
//         valueStart += match[0].length + 1;
//     }
//
//     if (!isEmptyObject(hints)) {
//         const value = input.slice(valueStart).trim();
//         return {
//             query: "searchQuery",
//             value,
//             hints,
//         };
//     }
//
//     return {query: "searchQuery", value: input};
// }
//
// async function inputPlay(ctx: BotCommandContext<ChatInputCommandInteraction>) {
//     const input = ctx.interaction.options.getString(PLAY_INPUT);
//     if (!input) return playResume(ctx);
//     if (input.startsWith("https://")) return playUrl(input, ctx);
//     return playSearchQuery(formPlaybackQuery(input), ctx);
// }
//
// async function playResume(ctx: BotCommandContext<ChatInputCommandInteraction>) {
//     //  only play if session can be resumed (i.e., exists)
//     return playGoto(0, true, ctx);
// }
//
// async function playGoto(
//     position: number,
//     skip: boolean,
//     ctx: BotCommandContext<ChatInputCommandInteraction>
// ) {
//     return playUrl(await urlByQueuePosition(position, ctx), ctx);
// }
//
// async function playSearchQuery(
//     query: PlaybackQuery,
//     ctx: BotCommandContext<ChatInputCommandInteraction>
// ) {
//     const result = await search(query.value, query.hints, ctx);
//     await ctx.interaction.reply(`adding ${result.label}`);
//
//     return playUrl(result.url, ctx);
// }
//
// async function playUrl(
//     url: string,
//     ctx: BotCommandContext<ChatInputCommandInteraction>
// ) {
//     // add the track to the appropriate session
//     // and tell the sessionserver we added a track
//     // we should do validation on the url before starting its playback
//     return Promise.resolve(undefined);
// }
//
// async function autocompletePlay(
//     ctx: BotCommandContext<AutocompleteInteraction>
// ) {
//     const partialInput = ctx.interaction.options.getString(PLAY_INPUT);
//     if (!partialInput || partialInput.startsWith("https://")) return;
//
//     const query = formPlaybackQuery(partialInput);
//     const results = await searchMany(query.value, query.hints, ctx, {
//         limit: 6,
//     });
//
//     await ctx.interaction.respond(
//         results.map((r) => ({name: r.label, value: r.url}))
//     );
// }
//
// export const GOTO_POSITION = "position";
// export const GOTO_SKIP = "skip";
//
// export async function gotoReaction(ctx: BotCommandContext<Interaction>) {
//     if (!ctx.interaction.isChatInputCommand()) return;
//
//     const position = ctx.interaction.options.getInteger("position", true);
//     const skip = ctx.interaction.options.getBoolean("skip") ?? false;
//     return playGoto(
//         position,
//         skip,
//         ctx as BotCommandContext<ChatInputCommandInteraction>
//     );
// }
