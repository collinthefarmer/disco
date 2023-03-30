import { commands } from "./bot/commands";
import { start } from "./bot/disco";
import { findConfig } from "./bot/disco";
import { Sequelize } from "sequelize";

const dotenv = require("dotenv");
dotenv.config({ path: ".env" });

const cfg = findConfig(process.env);
const db = new Sequelize(cfg.dbPath);

start(commands, db, cfg);
