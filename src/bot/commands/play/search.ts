import {Client as SpotifyClient} from "spotify.ts";

export enum SearchResultType {
    album,
    artist,
    audiobook,
    file,
    playlist,
    podcast,
    show,
    track,
    unknown
}

export interface SearchResult<T extends Record<string, unknown> = Record<string, unknown>> {
    type: SearchResultType;
    item: T;
    url: string;
}

export interface SearchOptions {
    limit?: number
}

export function search(client: SpotifyClient, pretext: PlaybackPretext, options?: SearchOptions): Promise<SearchResult[]> {

}