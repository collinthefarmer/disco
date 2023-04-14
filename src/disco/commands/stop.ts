import { BotCommand } from "./command";
import { ChatInputCommandInteraction } from "discord.js";

export class Stop extends BotCommand {
    name = "stop";
    description = "Stop playback and end the session.";

    onChat(i: ChatInputCommandInteraction): Promise<void> {
        return Promise.resolve(undefined);
    }
}
