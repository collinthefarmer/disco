import { Sequelize } from "sequelize-typescript";

import {
    boogie,
    findConfig,
    Session,
    SessionTrack,
    SessionSource,
} from "./disco";

import { Play } from "./bot";

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
    await boogie(db, cfg, [Play]);
})();
