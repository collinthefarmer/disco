import {
    AllowNull,
    AutoIncrement,
    BelongsTo,
    Column,
    Comment,
    CreatedAt,
    DataType,
    ForeignKey,
    HasOne,
    Model,
    PrimaryKey,
    Scopes,
    Table,
    UpdatedAt,
} from "sequelize-typescript";

import { Session } from "./Session";
import { Op } from "sequelize";
import { SessionSource } from "./SessionSource";

interface TrackAttributes {
    id: number;

    duration: number;
    size: number;
    created: number;
    updated: number;
    started: number | null;
    progress: number | null;

    next: SessionTrack | null;
    prev: SessionTrack | null;
    session: Session;
    source: SessionSource;

    nextId: number | null;
    prevId: number | null;
    sessionId: number;
    sourceId: number;
}

export interface TrackCreateAttributes {
    duration: number;
    size: number;
    sourceId: string;
}

@Scopes(() => ({
    terminal: {
        where: {
            nextId: null,
        },
        include: [Session],
    },
    initial: {
        where: {
            prev: null,
        },
        include: [Session],
    },
    queued: {
        where: {
            finished: {
                [Op.eq]: null,
            },
        },
        include: [Session],
    },
    linked: {
        include: [
            {
                model: Session,
                identifier: "nextId",
            },
            {
                model: Session,
                identifier: "prevId",
            },
        ],
    },
}))
@Table
export class SessionTrack<IsLast extends boolean = boolean> extends Model<
    TrackAttributes,
    TrackCreateAttributes
> {
    @AutoIncrement
    @PrimaryKey
    @Column
    declare id: number;

    @HasOne(() => SessionTrack, "nextId")
    declare next: IsLast extends true ? SessionTrack : null;

    @AllowNull
    @Column({ type: DataType.STRING })
    declare nextId: number | null;

    @HasOne(() => SessionTrack, "prevId")
    declare prev: SessionTrack | null;

    @Column({ type: DataType.STRING })
    declare prevId: number | null;

    @Comment("duration in MS")
    @Column
    declare duration: number;

    @Comment("size in bytes")
    @Column
    declare size: number;

    @CreatedAt
    @Column
    declare created: number;

    @UpdatedAt
    @Column
    declare updated: number;

    @Comment("timestamp when playback was started")
    @AllowNull
    @Column({ type: DataType.INTEGER })
    declare started: number | null;

    @Comment("ms of playback progress, only updated on completion or pause")
    @AllowNull
    @Column({ type: DataType.INTEGER })
    declare progress: number | null;

    @BelongsTo(() => Session)
    declare session: Session;

    @ForeignKey(() => Session)
    @Column
    declare sessionId: number;

    @BelongsTo(() => SessionSource)
    declare source: SessionSource;

    @ForeignKey(() => SessionSource)
    @Column
    declare sourceId: number;
}
