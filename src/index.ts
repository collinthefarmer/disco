import { findConfig, start } from "./bot/disco";
import { Sequelize } from "sequelize";
import { BotCommand } from "./bot/bot";
import { goto, play, test } from "./bot/commands";

const dotenv = require("dotenv");
dotenv.config({ path: ".env" });

const cfg = findConfig(process.env);
const db = new Sequelize(cfg.dbPath);

const commands: BotCommand[] = [test, play, goto];

start(commands, db, cfg);
