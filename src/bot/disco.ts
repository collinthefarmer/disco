import { BotConfig, botStart } from "./bot";

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
): BotConfig {
    const missing: string[] = [];
    if (
        [
            "DISCO_DISCAPPID",
            "DISCO_DISCTOKEN",
            "DISCO_SPOTAPPID",
            "DISCO_SPOTAPPSC",
            "DISCO_DBPATH"
        ].some((key) => {
            if (key in configData) return false;
            return +missing.push(key) // push and return true
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

export const start = botStart;
