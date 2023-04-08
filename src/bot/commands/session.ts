import { Session, SessionSource } from "../../disco/models";
import { BotInteractionContext } from "./commands";

import { Op } from "sequelize";
import { ChannelType } from "discord-api-types/v10";

async function getChannelActiveSession(
    channelId: string,
    name?: string
): Promise<Session | null> {
    let where = {};
    if (name) {
        where = {
            name,
            channelId,
            expires: {
                [Op.gt]: Date.now(),
            },
        };
    } else {
        where = {
            channelId,
            expires: {
                [Op.gt]: Date.now(),
            },
        };
    }

    return Session.findOne({where});
}

export async function fetchOrCreateSession(
    ctx: BotInteractionContext,
    name?: string
): Promise<Session> {
    if (!ctx.interaction.channelId) {
        throw new Error("wrong ~");
    }

    // if necessary, swap this for a method that resolves the voice channel the user is in
    // currently planning on using any given voice channel's message feed as that id
    const channelId = ctx.interaction.channelId;

    let session = await getChannelActiveSession(channelId, name);
    if (!session) {
        session = name
            ? new Session({ name, channelId })
            : new Session({ channelId });

        await session.save();
    }

    return session;
}

export async function fetchOrCreateSource(
    ctx: BotInteractionContext
): Promise<SessionSource> {
    const userId = ctx.interaction.user.id;
    let source = await SessionSource.findOne({ where: { id: userId } });
    if (!source) {
        source = new SessionSource({
            id: userId,
            name: ctx.interaction.user.username,
        });

        await source.save();
    }

    return source;
}
