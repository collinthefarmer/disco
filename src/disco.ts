import { REST, Routes } from "discord.js";
import { commands, rxstrip } from "../_src/commands";

export interface BotConfig {
    discordAppId: string;
    discordToken: string;
    spotifyAppId: string;
    spotifyToken: string;
}

export async function start(cfg: BotConfig) {
    const restClient = new REST({ version: "10" }).setToken(cfg.discordToken);
    await restClient.put(Routes.applicationCommands(cfg.discordAppId), commandsBody());

}
