import { BotCommand } from "./command";
import { ChatInputCommandInteraction } from "discord.js";

export class Pause extends BotCommand {
    name = "pause";
    description = "Pause playback.";

    onChat(i: ChatInputCommandInteraction): Promise<void> {
        return Promise.resolve(undefined);
    }
}
