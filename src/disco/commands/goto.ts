import { BotCommand } from "./command";
import {
    ApplicationCommandOptionData,
    ApplicationCommandOptionType,
    AutocompleteInteraction,
    ChatInputCommandInteraction,
} from "discord.js";

namespace Strings {
    export const goto = `goto`;
    export const gotoDescription = `Go to a point if the queue (if it exists).`;
    export const gotoPosition = `gotoPosition`;
    export const gotoPositionDescription = `The position to go to.`;
    export const gotoSkip = `gotoSkip`;
    export const gotoSkipDescription = `Skip all tracks between the current track and the target?`;
}

export class Goto extends BotCommand {
    name = Strings.goto;
    description = Strings.gotoDescription;

    options: ApplicationCommandOptionData[] = [
        {
            name: Strings.gotoPosition,
            description: Strings.gotoPositionDescription,
            type: ApplicationCommandOptionType.String,
            autocomplete: true,
            required: true,
        },
        {
            name: Strings.gotoSkip,
            description: Strings.gotoSkipDescription,
            type: ApplicationCommandOptionType.Boolean,
        },
    ];

    onChat(i: ChatInputCommandInteraction): Promise<void> {
        return Promise.resolve(undefined);
    }

    onAutocomplete(i: AutocompleteInteraction): Promise<void> {
        return Promise.resolve();
    }
}
