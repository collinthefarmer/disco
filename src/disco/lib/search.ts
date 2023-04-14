import { Client as SpotifyClient, Track } from "spotify.ts";
import { openSync } from "fontkit";
import { align } from "./formatting";

const font = openSync("src/assets/gg_sans_Normal.ttf");

export enum SearchResultSource {
    spotify,
    youtube,
}

export interface SearchResult {
    track: string;
    artist: string;
    source: SearchResultSource;

    url: string;
}

export interface SearchResultOption extends SearchResult {
    label: string;
}

function formatResultsAsOptions(results: SearchResult[]): SearchResultOption[] {
    const trackColW = 60;
    const trackCol = align(
        results.map((r) => Util.trunc(r.track, trackColW, "...")),
        font,
        "end",
        trackColW * font.unitsPerEm / 2
    );

    const artistsColW = 38;
    const artistsCol = align(
        results.map((r) => Util.trunc(r.artist, artistsColW, "...")),
        font,
        "start",
        artistsColW * font.unitsPerEm / 2
    );

    return results.map((r, i) => {
        const label = `🔘 ${trackCol[i]}${artistsCol[i]}`;
        console.log(label);
        return Object.assign(r, { label });
    });
}

export async function spotifySearch(
    query: string,
    client: SpotifyClient
): Promise<SearchResultOption[]> {
    const results = (
        (await client.searches.search({
            query,
            limit: 10,
            type: ["track"],
        })) as Track[]
    ).map((t) => ({
        track: t.name,
        artist: t.artists.map((a) => a.name).join("; "),
        source: SearchResultSource.spotify,

        url: t.href,
    }));

    const options = formatResultsAsOptions(results);

    // todo: cache here!

    return options;
}

namespace Util {
    export function trunc(s: string, to: number, suffix: string): string {
        if (to <= 0) return "";
        if (to >= s.length) return s;
        return s.slice(0, to - suffix.length) + suffix;
    }
}
