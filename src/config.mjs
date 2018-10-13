import { readFileSync } from "fs";

export const config = readFileSync("config.json").toJSON();

export default config;
