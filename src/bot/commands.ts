import { BotCommand, wrapAsCommand } from "./bot";
import { Interaction } from "discord.js";

export const commands: BotCommand[] = [
    wrapAsCommand(test, "test", "test description!"),
];

export async function test(i: Interaction) {
    if (i.isChatInputCommand()) await i.reply("test received!");
}
