import {
    Column,
    HasOne,
    HasMany,
    Model,
    Sequelize,
    Table,
    DataType,
    PrimaryKey,
    UpdatedAt,
    CreatedAt,
    AllowNull,
    Default,
    AutoIncrement,
    ForeignKey,
    BelongsTo,
} from "sequelize-typescript";

import {
    PlaybackActionInterface,
    PlaybackSourceInterface,
    SessionInterface,
    SessionCommand,
    SessionManagerInterface,
} from "./playback";

export const SESSION_IDLE_WAIT_MS = 1000 * 60 * 30; // 30 minutes

export interface DiscoConfig {
    discordAppId: string;
    discordToken: string;
    spotifyAppId: string;
    spotifyAppSc: string;
    dbPath: string;
}

/**
 * Put ur process.env in here and we'll put the config together ourselves
 *
 * vars:
 * DISCO_DISCAPPID - discord application id
 * DISCO_DISCTOKEN - discord token
 * DISCO_SPOTAPPID - spotify client id
 * DISCO_SPOTAPPSC - spotify client secret
 *
 * @param configData: Record<string, string | undefined>
 */
export function findConfig(
    configData: Record<string, string | undefined> // i.e., process.env
): DiscoConfig {
    const missing: string[] = [];
    if (
        [
            "DISCO_DISCAPPID",
            "DISCO_DISCTOKEN",
            "DISCO_SPOTAPPID",
            "DISCO_SPOTAPPSC",
            "DISCO_DBPATH",
        ].some((key) => {
            if (key in configData) return false;
            return +missing.push(key); // push and return true
        })
    ) {
        throw new Error(`Incomplete BotConfig: missing (${missing})`);
    }

    return {
        discordAppId: (configData as any).DISCO_DISCAPPID,
        discordToken: (configData as any).DISCO_DISCTOKEN,
        spotifyAppId: (configData as any).DISCO_SPOTAPPID,
        spotifyAppSc: (configData as any).DISCO_SPOTAPPSC,
        dbPath: (configData as any).DISCO_DBPATH,
    };
}

// implementations

@Table
export class PlaybackSource extends Model<PlaybackSourceInterface> {
    @PrimaryKey
    @Column
    declare id: string;

    @Column
    declare name: string;
}

@Table
export class Session extends Model<
    Omit<SessionInterface, "next" | "queue" | "history" | "revert">
> {
    // omit because those aren't actual columns but the builder thinks they are
    @AllowNull
    @AutoIncrement
    @PrimaryKey
    @Column
    declare id: number;

    @AllowNull
    @Column({ type: DataType.STRING })
    declare name: string | null;

    @Column
    declare channelId: string;

    @Column
    declare expiresAt: number;

    @HasOne(() => PlaybackAction, "id")
    declare current: PlaybackAction | null;

    @HasOne(() => PlaybackAction, "id")
    declare last: PlaybackAction | null;

    declare history: SessionInterface[];

    get next(): PlaybackAction | null {
        if (!this.current) return null;
        return this.current.next;
    }

    get queue(): PlaybackAction[] {
        if (!this.current) return [];

        const q = [this.current];
        let next = this.current.next;
        while (next) {
            q.push(next);
            next = next.next;
        }

        return q;
    }

    revert(to: SessionInterface) {
        throw new Error();
    }
}

@Table
export class PlaybackAction extends Model<PlaybackActionInterface> {
    @PrimaryKey
    @AutoIncrement
    @Column
    declare id: number;

    @BelongsTo(() => Session)
    declare session: Session;

    @HasOne(() => PlaybackAction)
    declare next: PlaybackAction;

    @HasOne(() => PlaybackSource)
    declare src: PlaybackSource;

    @Column
    declare url: string;
}

export class DiscoSessionManager implements SessionManagerInterface {
    public initialized: Promise<void>;
    public session!: Session;

    constructor(public sessionId: string, private dbConnection: Sequelize) {
        this.initialized = this.initialize(this.dbConnection);
    }

    queueDrop(i: number): void {}

    queueGoto(i: number): void {}

    async queuePush(cmd: SessionCommand): Promise<void> {
        const pushed = new PlaybackAction(cmd.asAction());

        if (!this.session.current) {
            this.session.current = pushed;
            this.session.last = pushed;
        } else if (!this.session.next) {
            this.session.current.next = pushed;
        } else if (this.session.last) {
            this.session.last.next = pushed;
            this.session.last = pushed;
        }

        await pushed.save();
    }

    queueSkip(): void {}

    queueUndo(): void {}

    queueFind(cmd: SessionCommand): number {
        return 0;
    }

    private async initialize(sequelize: Sequelize) {
        await sequelize.authenticate();
        const session = await Session.findOne({
            where: { id: this.sessionId },
        });

        if (!session) throw new Error();
        this.session = session;
    }
}
