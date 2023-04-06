import { Sequelize } from "sequelize-typescript";

import { botStart, BotCommand } from "./bot/bot";
import { goto, play, test } from "./bot/commands";

import {
    findConfig,
    PlaybackActionImpl,
    PlaybackSourceImpl,
    SessionImpl,
} from "./disco";

const dotenv = require("dotenv");
dotenv.config({ path: ".env" });

const cfg = findConfig(process.env);
const commands: BotCommand[] = [test, play, goto];

const db = new Sequelize({
    dialect: "sqlite",
    database: "disco",
    username: "root",
    storage: cfg.dbPath,
    models: [PlaybackActionImpl, PlaybackSourceImpl, SessionImpl],
});

(async () => botStart(commands, db, cfg))();
