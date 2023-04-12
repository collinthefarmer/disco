import { Client as DiscordClient } from "discord.js";

import { Session } from "../models/Session";
import { SessionTrack } from "../models/SessionTrack";

export class DJ {
    private constructor(
        public session: Session,
        private client: DiscordClient
    ) {}

    private async play(track: SessionTrack) {
        throw new Error("todo");
    }

    async jam() {
        if (this.session.queuedCt < 1) {
            throw new Error("Can't spin on a session with no tracks queued!");
        }

        for await (const track of this.session.setlist()) {
            if (!track) return;
            await this.play(track);
        }
    }
}
