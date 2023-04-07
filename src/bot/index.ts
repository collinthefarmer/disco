import { BotCommand, goto, pause, play, skip, stop, test } from "./commands";

export { botStart } from "./bot";

export const commands: BotCommand[] = [test, play, goto, pause, skip, stop];
