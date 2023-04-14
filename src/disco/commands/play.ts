import { BotCommand } from "./command";
import {
    ApplicationCommandOptionChoiceData,
    ApplicationCommandOptionData,
    ApplicationCommandOptionType,
    AutocompleteInteraction,
    ChatInputCommandInteraction,
} from "discord.js";
import { Track } from "spotify.ts";
import { SearchResult, SearchResultOption, spotifySearch } from "../lib/search";

// todo: move these to a better solution (strings file?)
namespace Strings {
    export const play = `play`;
    export const playDescription = `Start playing a track, add a track to the queue, or resume paused playback.`;
    export const playInput = `play_input`;
    export const playInputDescription = `Enter a URL from a supported source or search with autocomplete.`;
}

export class Play extends BotCommand {
    name = Strings.play;
    description = Strings.playDescription;

    options: ApplicationCommandOptionData[] = [
        {
            name: Strings.playInput,
            description: Strings.playInputDescription,
            type: ApplicationCommandOptionType.String,
            autocomplete: true,
        },
    ];

    onChat(i: ChatInputCommandInteraction): Promise<void> {
        return Promise.resolve(undefined);
    }

    async onAutocomplete(i: AutocompleteInteraction): Promise<void> {
        const query = i.options.getString(Strings.playInput);
        if (!query) return;

        const results = [...(await spotifySearch(query, this.env.spotify))]; // todo: cache these, and put more into this array if we search other places

        const choices = this.formatResults(results);
        await i.respond(choices);
    }

    private formatResults(
        results: SearchResultOption[]
    ): ApplicationCommandOptionChoiceData[] {

        return results.map((r, i) => ({
            name: r.label,
            value: results[i].url,
        }));
    }
}

//
// function spotifyTrackResult(t: Track): SearchResult {
//     return {
//         track: t.name,
//         artists: t.artists.map((a) => a.name),
//         url: t.href,
//     };
// }
//
// namespace Formatting {
//     export function trunc(s: string, to: number, suffix: string): string {
//         if (to <= 0) return "";
//         if (to >= s.length) return s;
//         return s.slice(0, to - suffix.length) + suffix;
//     }
//
//     export function listTrunc(
//         ss: string[],
//         to: number,
//         suff = "..."
//     ): string[] {
//         let len = 0;
//         let i = 0;
//         let next = ss[i];
//         const truncated = [];
//         while (len < to && i < ss.length) {
//             if (len + next.length < to) {
//                 truncated.push(next);
//                 len += next.length;
//             }
//
//             next = ss[i++];
//             if (
//                 next &&
//                 len + next.length > to &&
//                 len + next.length + suff.length <= to
//             ) {
//                 truncated.push(suff);
//                 return truncated;
//             }
//         }
//
//         return truncated;
//     }
//
//     function formatColumn(
//         values: string[] | string[][],
//         width: number,
//         truncationSuffix: string
//     ): string[] {
//         let truncated;
//         if (Array.isArray(values[0])) {
//             truncated = values.map((v) =>
//                 listTrunc(v as string[], width, truncationSuffix).join(", ")
//             );
//         } else {
//             truncated = values.map((v) =>
//                 trunc(v as string, width, truncationSuffix)
//             );
//         }
//
//         return truncated.map((t) => t.padEnd(width, " "));
//     }
//
//     function formatColumns(
//         values: string[][],
//         widths: number[],
//         truncationSuffix: string
//     ): string[][] {
//         if (values.length < widths.length)
//             throw new Error("Widths not defined for all columns!");
//         return values.map((vcol, i) =>
//             formatColumn(vcol, widths[i], truncationSuffix)
//         );
//     }
// }
