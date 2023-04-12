import { BotCommand } from "./command";
import {
    ApplicationCommandOptionData,
    ApplicationCommandOptionType,
    AutocompleteInteraction,
    ChatInputCommandInteraction,
} from "discord.js";

namespace Strings {
    export const play = `play`;
    export const playDescription = `Start playing a track, add a track to the queue, or resume paused playback.`;
    export const playInput = `playInput`;
    export const playInputDescription = `Enter a URL from a supported source or search with autocomplete.`;
}

export class Play extends BotCommand {
    name = Strings.play;
    description = Strings.playDescription;

    options: ApplicationCommandOptionData[] = [
        {
            name: Strings.playInput,
            description: Strings.playInputDescription,
            type: ApplicationCommandOptionType.String,
            autocomplete: true,
        },
    ];

    onChat(i: ChatInputCommandInteraction): Promise<void> {
        return Promise.resolve(undefined);
    }

    onAutocomplete(i: AutocompleteInteraction): Promise<void> {
        return Promise.resolve();
    }
}