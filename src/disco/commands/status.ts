import { BotCommand } from "./command";
import { ChatInputCommandInteraction } from "discord.js";

export class Status extends BotCommand {
    name = "status";
    description = "Get information about the current status (if there is one).";

    onChat(i: ChatInputCommandInteraction): Promise<void> {
        return Promise.resolve(undefined);
    }
}
