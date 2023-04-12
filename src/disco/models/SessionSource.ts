import {
    Column,
    Comment,
    HasMany,
    Model,
    PrimaryKey,
    Table,
} from "sequelize-typescript";
import { SessionTrack } from "./SessionTrack";

interface SourceAttributes {
    id: string;
    name: string;
    tracks: SessionTrack[];
}

interface SourceCreateAttributes {
    id: string;
    name: string;
}

@Table
export class SessionSource extends Model<
    SourceAttributes,
    SourceCreateAttributes
> {
    static async forUser(userId: string): Promise<SessionSource> {
        const [src] = await SessionSource.findOrCreate({
            where: {
                id: userId,
            },
            defaults: {
                id: userId,
                name: "",
            },
        });

        return src;
    }

    @Comment("Should match to ID of linked Discord User.")
    @PrimaryKey
    @Column
    declare id: string;

    @Column
    declare name: string;

    @HasMany(() => SessionTrack)
    declare tracks: SessionTrack[];
}
