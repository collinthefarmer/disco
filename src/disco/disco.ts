import {
    Column,
    HasOne,
    Model,
    Sequelize,
    Table,
    DataType,
    PrimaryKey,
} from "sequelize-typescript";

import {
    PlaybackAction,
    PlaybackSource,
    Session,
    SessionCommand,
    SessionManager,
} from "./playback";

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
export class PlaybackSourceImpl extends Model<PlaybackSource> {
    @PrimaryKey
    @Column
    declare id: string;

    @Column
    declare name: string;
}

@Table
export class PlaybackActionImpl extends Model<PlaybackAction> {
    @PrimaryKey
    @Column
    declare id: string;

    @HasOne(() => PlaybackActionImpl, "id")
    declare next: PlaybackActionImpl;

    @HasOne(() => PlaybackSourceImpl, "id")
    declare src: PlaybackSourceImpl;

    @Column
    declare url: string;
}

@Table
export class SessionImpl extends Model<Session> {
    @PrimaryKey
    @Column
    declare id: string;

    @HasOne(() => PlaybackActionImpl, "id")
    declare current: PlaybackActionImpl | null;

    @Column({ type: DataType.STRING, allowNull: true })
    declare name: string | null;

    @HasOne(() => PlaybackActionImpl, "id")
    declare last: PlaybackActionImpl;

    get next(): PlaybackActionImpl | null {
        if (!this.current) return null;
        return this.current.next;
    }

    get queue(): PlaybackActionImpl[] {
        if (!this.current) return [];

        const q = [this.current];
        let next = this.current.next;
        while (next) {
            q.push(next);
            next = next.next;
        }

        return q;
    }

    declare history: Session[];

    revert(to: Session) {
        throw new Error();
    }
}

export class DiscoSessionManager implements SessionManager {
    public initialized: Promise<void>;

    constructor(public session: SessionImpl, private dbConnection: Sequelize) {
        this.initialized = this.initialize(this.dbConnection);
    }

    queueDrop(i: number): void {}

    queueGoto(i: number): void {}

    async queuePush(cmd: SessionCommand): Promise<void> {
        const pushed = new PlaybackActionImpl(cmd.asAction());

        if (!this.session.current) {
            this.session.current = pushed;
        } else if (!this.session.next) {
            this.session.current.next = pushed;
        } else {
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
    }
}
