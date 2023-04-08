import { Sequelize } from "sequelize-typescript";

import { botStart, commands } from "./bot";

import { findConfig } from "./disco";

import { Session, SessionTrack, SessionSource } from "./disco/models";

const dotenv = require("dotenv");
dotenv.config({ path: ".env" });

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
    await botStart(commands, db, cfg);
})();
