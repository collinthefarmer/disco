// set up commands
import {REST, Routes} from "discord.js";
import {commands, rxstrip} from "../_src/commands";
import {BotConfig, start} from "./disco";

const dotenv = require("dotenv");
const config = dotenv.config({ path: ".env" })?.parsed;

function readConfig(configData: Object): BotConfig {

}

start(config.DISCO_DISCAPPID, config.DISCO_DISCTOKEN, config.DISCO_SPOTAPPID, config.DISCO_SPOTAPPSEC)