import {
    AllowNull,
    AutoIncrement,
    Column,
    DataType,
    Default,
    DefaultScope,
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
    static ttl(): number {
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

    @HasMany(() => SessionTrack, { as: "linked" })
    declare history: SessionTrack[];

    public async addTrack(
        t: TrackCreateAttributes,
        after: SessionTrack | null
    ): Promise<SessionTrack> {
        const track = new SessionTrack(t);
        track.sessionId = this.id;
        track.nextId = null;
        track.prevId = after?.id ?? null;

        await track.save();

        if (after instanceof SessionTrack) {
            after.nextId = track.id;
            await after.save();
        }

        this.set("expires", this.expires + t.duration);
        await this.increment("queuedCt");
        await this.save();

        return track.reload();
    }
}
