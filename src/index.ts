import { findConfig, start } from "./bot/disco";
import { Sequelize } from "sequelize";
import { BotCommand } from "./bot/bot";
import { play, test } from "./bot/commands";

const dotenv = require("dotenv");
dotenv.config({ path: ".env" });

const cfg = findConfig(process.env);
const db = new Sequelize(cfg.dbPath);

const commands: BotCommand[] = [play];

start(commands, db, cfg);
