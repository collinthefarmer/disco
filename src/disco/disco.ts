import { Sequelize } from "sequelize";
import { Client as SpotifyClient } from "spotify.ts";
import { Client as DiscordClient } from "discord.js";

import { BotCommand, BotCommandEnvironment, syncCommands } from "../bot";
import { REST } from "discord.js";

export const SESSION_IDLE_WAIT_MS = 1000 * 60 * 30; // 30 minutes
export interface DiscoConfig {
    discordAppId: string;
    discordToken: string;
    spotifyAppId: string;
    spotifyAppSc: string;
    dbPath: string;
}

/**
 * Put ur process.env in here and we'll put the config together ourselves
 *
 * vars:
 * DISCO_DISCAPPID - discord application id
 * DISCO_DISCTOKEN - discord token
 * DISCO_SPOTAPPID - spotify client id
 * DISCO_SPOTAPPSC - spotify client secret
 *
 * @param configData: Record<string, string | undefined>
 */
export function findConfig(
    configData: Record<string, string | undefined> // i.e., process.env
): DiscoConfig {
    const missing: string[] = [];
    if (
        [
            "DISCO_DISCAPPID",
            "DISCO_DISCTOKEN",
            "DISCO_SPOTAPPID",
            "DISCO_SPOTAPPSC",
            "DISCO_DBPATH",
        ].some((key) => {
            if (key in configData) return false;
            return +missing.push(key); // push and return true
        })
    ) {
        throw new Error(`Incomplete BotConfig: missing (${missing})`);
    }

    return {
        discordAppId: (configData as any).DISCO_DISCAPPID,
        discordToken: (configData as any).DISCO_DISCTOKEN,
        spotifyAppId: (configData as any).DISCO_SPOTAPPID,
        spotifyAppSc: (configData as any).DISCO_SPOTAPPSC,
        dbPath: (configData as any).DISCO_DBPATH,
    };
}

type ConcreteBotCommandType = new (e: BotCommandEnvironment) => BotCommand;

/**
 * Start up the Discord Bot
 *
 * - set up the client needed for the discord rest api
 * - sync bot commands registered in discord to bot commands in code
 * - set up the spotify client
 *      - needed for search autocomplete
 * - start database client
 * - start bot
 *
 * @param db: Sequelize
 * @param cfg: BotConfig
 * @param cmds: ConcreteBotCommandType[]
 */
export async function boogie(
    db: Sequelize,
    cfg: DiscoConfig,
    cmds: ConcreteBotCommandType[]
) {
    const env: BotCommandEnvironment = {
        discordRest: new REST({ version: "10" }).setToken(cfg.discordToken),
        discord: new DiscordClient({ intents: [] /* todo: define these */ }),
        spotify: new SpotifyClient({
            clientId: cfg.spotifyAppId,
            clientSecret: cfg.spotifyAppSc,
        }),
        db,
        cfg,
    };

    await env.spotify.start();

    const inst = cmds.map((c) => new c(env));

    await syncCommands(inst, env);
    await env.discord.login(cfg.discordToken);
}
