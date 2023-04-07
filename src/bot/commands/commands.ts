import {
    AutocompleteInteraction,
    ChatInputApplicationCommandData,
    ChatInputCommandInteraction,
    Client as DiscordClient,
    Interaction,
    REST,
} from "discord.js";

import { Client as SpotifyClient } from "spotify.ts/dist/lib/Client";
import { Sequelize } from "sequelize";

interface BaseBotCommandContext<I extends Interaction = Interaction> {
    interaction?: I;
    discordRest: REST;
    discordClient: DiscordClient<true>; // handly lil type param there
    spotifyClient: SpotifyClient;
    db: Sequelize;
}

export type BotCommandContext<I extends undefined | Interaction = undefined> =
    I extends Interaction
        ? Required<BaseBotCommandContext<I>>
        : BaseBotCommandContext;

export type BotInteractionContext = BotCommandContext<Interaction>;
export type BotChatInteractionContext =
    BotCommandContext<ChatInputCommandInteraction>;
export type BotAutocompleteInteractionContext =
    BotCommandContext<AutocompleteInteraction>;

export type BotCommand = ChatInputApplicationCommandData & {
    reaction: BotReaction;
};
export type BotReaction = (
    context: BotCommandContext<Interaction>
) => Promise<void>;

export function isChat(
    ctx: BotInteractionContext
): ctx is BotChatInteractionContext {
    return ctx.interaction.isChatInputCommand();
}

export function isAutocomplete(
    ctx: BotInteractionContext
): ctx is BotAutocompleteInteractionContext {
    return ctx.interaction.isAutocomplete();
}

// this should also be able to see if a string _could_ be a url if more text gets added
// for use in autocompletion
export function isUrl(str: string, canBePartial: boolean = false): boolean {
    /**
     * todo
     *
     * regex?
     * new URL?
     */

    throw new Error("missing implementation!");

    return true;
}
