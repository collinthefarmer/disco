import {
    AllowNull,
    AutoIncrement,
    Column,
    DataType,
    Default,
    HasMany,
    HasOne,
    Model,
    PrimaryKey,
    Scopes,
    Table,
    Unique,
} from "sequelize-typescript";

import { SESSION_IDLE_WAIT_MS } from "../disco";
import { Op } from "sequelize";
import { SessionTrack, TrackCreateAttributes } from "./SessionTrack";

export type SessionQueue = [SessionTrack<true>, ...SessionTrack<false>[]];

interface SessionAttributes {
    id: number;
    name: string;
    channelId: string;
    started: number;
    expires: number;
    last: SessionTrack<true>;
    first: SessionTrack | null;
    history: SessionTrack[];
    queuedCt: number;
}

interface SessionCreateAttributes {
    name?: string;
    channelId: string;
}

@Scopes(() => ({
    fresh: {
        where: {
            expires: { [Op.lt]: Date.now() },
        },
    },
    expired: {
        where: {
            expires: { [Op.gte]: Date.now() },
        },
    },
    listening: {
        where: {
            current: { [Op.ne]: null },
        },
    },
}))
@Table
export class Session extends Model<SessionAttributes, SessionCreateAttributes> {
    static async forChannel(
        channelId: string,
        name?: string
    ): Promise<Session> {
        const [sess] = await Session.findOrCreate({
            where: {
                channelId,
                name: name ? name : undefined,
                expires: { [Op.gt]: Date.now() },
            },
            defaults: {
                channelId,
                name: name ? name : undefined,
            },
        });

        return sess.save();
    }

    private static ttl(): number {
        return Date.now() + SESSION_IDLE_WAIT_MS;
    }

    @AllowNull
    @AutoIncrement
    @PrimaryKey
    @Column
    declare id: number;

    @Default(() => new Date().toISOString())
    @Column
    declare name: string;

    @Unique
    @Column
    declare channelId: string;

    @Column({ type: DataType.INTEGER })
    declare started: number;

    @Default(Session.ttl)
    @Column
    declare expires: number;

    @HasOne(() => SessionTrack, { as: "terminal" })
    get last(): Promise<SessionTrack<true> | null> {
        return SessionTrack.findOne({
            where: {
                sessionId: this.id,
                nextId: null,
            },
        });
    }

    @HasOne(() => SessionTrack, { as: "initial" })
    declare first: SessionTrack | null;

    @Default(0)
    @Column
    declare queuedCt: number;

    @HasMany(() => SessionTrack, { as: "linked" })
    declare history: SessionTrack[];

    @HasMany(() => SessionTrack, { as: "queued" })
    get queue(): SessionQueue {
        const first = this.history.filter((t) => t.prev === null)[0];
        const sorted = [first];

        let next = first.next;
        while (next) {
            sorted.push(next);
            next = next.next;
        }

        return sorted as SessionQueue;
    }

    get next(): SessionTrack | null {
        for (const t of this.queue) {
            if (t.progress && t.progress !== t.duration) return t;
        }

        return this.first;
    }

    async addTrack(
        t: TrackCreateAttributes,
        after: SessionTrack | null
    ): Promise<SessionTrack> {
        const track = new SessionTrack(t);
        track.sessionId = this.id;
        track.prevId = after?.id ?? null;

        if (after instanceof SessionTrack) {
            track.nextId = after.nextId;
            after.nextId = track.id;
            await after.save();
        }

        this.queuedCt++;

        await this.save();
        return track.save();
    }

    async *setlist() {
        let next = this.next;

        while (next) {
            yield next;
            next = await this.flip(next);
        }

        return null;
    }

    private async flip(track: SessionTrack): Promise<SessionTrack | null> {
        track.progress = track.duration;

        await track.save();
        await track.reload({ include: [SessionTrack] });

        return track.next;
    }
}
