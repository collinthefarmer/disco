import {
    ApplicationCommandData,
    ApplicationCommandType,
    AutocompleteInteraction,
    ChatInputApplicationCommandData,
    ChatInputCommandInteraction,
    Interaction,
    REST,
    Routes,
    Client as DiscordClient,
} from "discord.js";

import { Client as SpotifyClient } from "spotify.ts";
import { Sequelize } from "sequelize";

import { DiscoConfig } from "../index";

export type BotCommandDefinition = ChatInputApplicationCommandData;

export type BotCommandEnvironment = {
    db: Sequelize;
    spotify: SpotifyClient;
    discord: DiscordClient;
    discordRest: REST;
    cfg: DiscoConfig;
};

export abstract class BotCommand implements BotCommandDefinition {
    private static isChat(i: Interaction): i is ChatInputCommandInteraction {
        return i.isChatInputCommand();
    }

    private static isAuto(i: Interaction): i is AutocompleteInteraction {
        return i.isAutocomplete();
    }

    async react(
        this: BotCommand & BotCommandDefinition,
        i: Interaction
    ): Promise<void> {
        if (BotCommand.isChat(i)) return this.onChat(i);
        else if (BotCommand.isAuto(i) && this.onAutocomplete)
            return this.onAutocomplete(i);
        else if (BotCommand.isAuto(i))
            console.warn(`Missing onAutocomplete hook on ${this.name}.`);
        else
            console.warn(`Invalid interaction type ${i.type} on ${this.name}.`);
    }

    toData(this: BotCommandDefinition): ApplicationCommandData {
        const data = {
            name: this.name,
            description: this.description,
            type: ApplicationCommandType.ChatInput,
        };

        const optional = {
            defaultMemberPermissions: this.defaultMemberPermissions,
            dmPermission: this.dmPermission,
            nsfw: this.nsfw,
            options: this.options,
            descriptionLocalizations: this.descriptionLocalizations,
            nameLocalizations: this.nameLocalizations,
        };

        for (const [key, value] of Object.entries(optional)) {
            if (value === undefined) continue;
            (data as any)[key] = value;
        }

        return data;
    }

    constructor(protected env: BotCommandEnvironment) {}

    abstract name: string;
    abstract description: string;

    abstract onChat(i: ChatInputCommandInteraction): Promise<void>;

    onAutocomplete?(i: AutocompleteInteraction): Promise<void>;
}

async function installCommands(
    commands: BotCommand[],
    appId: string,
    client: REST
): Promise<void> {
    try {
        await client.put(Routes.applicationCommands(appId), {
            body: commands.map((c) => c.toData()),
        });
    } catch (e) {
        console.error(
            "Error while installing commands. Bot could not be started."
        );
        throw e;
    }
}

function connectCommands(commands: BotCommand[], discord: DiscordClient) {
    const map = commands.reduce(
        (m, cmd) => Object.assign(m, { [cmd.name]: cmd }),
        {} as Record<string, BotCommand>
    );

    discord.on("interactionCreate", async (i) => {
        if (!("commandName" in i) || !(i.commandName in map)) {
            throw new Error("Invalid command name received. (somehow?)");
        }

        return await map[i.commandName].react(i);
    });
}

export async function syncCommands(
    commands: BotCommand[],
    env: BotCommandEnvironment
) {
    connectCommands(commands, env.discord);
    await installCommands(commands, env.cfg.discordAppId, env.discordRest);
}
