import { Sequelize } from "sequelize-typescript";

import {
    boogie,
    findConfig,
    Session,
    SessionTrack,
    SessionSource,
} from "./disco";

import { Goto, Pause, Play, Skip, Status, Stop } from "./bot";

require("dotenv").config({ path: ".env" });

const cfg = findConfig(process.env);

const db = new Sequelize({
    dialect: "sqlite",
    database: "disco",
    username: "root",
    storage: cfg.dbPath,
    models: [Session, SessionTrack, SessionSource],
});

(async () => {
    await db.authenticate();
    await db.sync();
    await boogie(db, cfg, [Goto, Pause, Play, Skip, Status, Stop]);
})();
