import { Goto } from "./goto";
import {
    ApplicationCommandOptionData,
    ApplicationCommandOptionType,
    ChatInputCommandInteraction,
} from "discord.js";

// todo: move these to a better solution (strings file?)
namespace Strings {
    export const skip = `skip`;
    export const skipDescription = `Skip this track, or the next N tracks.`;

    export const skipN = `skipN`;
    export const skipNDescription = `Number of tracks to skip (including this one).`;
}

export class Skip extends Goto {
    name = Strings.skip;
    description = Strings.skipDescription;

    options: ApplicationCommandOptionData[] = [
        {
            name: Strings.skipN,
            description: Strings.skipNDescription,
            type: ApplicationCommandOptionType.Integer,
        },
    ];

    onChat(i: ChatInputCommandInteraction): Promise<void> {
        return super.onChat(i);
    }
}
