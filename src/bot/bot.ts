import {
    REST,
    Routes,
    Interaction,
    Client as DiscordClient,
    InteractionType,
    ChatInputApplicationCommandData,
} from "discord.js";

import { Client as SpotifyClient } from "spotify.ts";
import { Sequelize } from "sequelize";

export interface BotConfig {
    discordAppId: string;
    discordToken: string;
    spotifyAppId: string;
    spotifyAppSc: string;
    dbPath: string;
}

/**
 * Start up the Discord Bot
 *
 * - set up the client needed for the discord rest api
 * - sync bot commands registered in discord to bot commands in code
 * - set up the spotify client
 *      - needed for search autocomplete
 * - set up database client
 * - start bot
 *
 * @param commands: BotCommand[]
 * @param db: Sequelize
 * @param cfg: BotConfig
 */
export async function botStart(
    commands: BotCommand[],
    db: Sequelize,
    cfg: BotConfig
) {
    const rest = new REST({ version: "10" }).setToken(cfg.discordToken);

    const discord = new DiscordClient({ intents: [] /* todo: define these */ });
    const spotify = new SpotifyClient({
        clientId: cfg.spotifyAppId,
        clientSecret: cfg.spotifyAppSc,
    });

    await installCommands(cfg.discordAppId, rest, commands);

    connectCommands(commands, {
        discordRest: rest,
        discordClient: discord,
        spotifyClient: spotify,
        db,
    });

    await discord.login(cfg.discordToken);
}

export type BotCommand = ChatInputApplicationCommandData & {
    reaction: BotReaction;
};
export type BotReaction = (
    context: BotCommandContext<Interaction>
) => Promise<void>;

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

async function installCommands(
    appId: string,
    client: REST,
    commands: BotCommand[]
): Promise<void> {
    try {
        // clean up the commands
        const clean = commands.map((c) => {
            const { reaction, ...command } = c;
            return command;
        });

        // send them to discord to be updated
        await client.put(Routes.applicationCommands(appId), { body: clean });
    } catch (e) {
        console.error(
            "Error while installing commands. Bot could not be started."
        );
        throw e;
    }
}

function connectCommands(commands: BotCommand[], ctx: BotCommandContext) {
    const reactionMap: Record<string, BotReaction> = {};
    commands.forEach((c) => (reactionMap[c.name] = c.reaction));

    ctx.discordClient.on("interactionCreate", async (interaction) => {
        let reaction: BotReaction;
        switch (interaction.type) {
            case InteractionType.ApplicationCommand:
            case InteractionType.ApplicationCommandAutocomplete:
                reaction = reactionMap[interaction.commandName];
                break;

            default:
                console.warn("Unsupported command type received, ignoring...");
                return;
        }

        ctx.interaction = interaction;
        await reaction(ctx as BotCommandContext<Interaction>);
    });
}
