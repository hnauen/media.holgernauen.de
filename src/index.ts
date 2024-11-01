#!/usr/bin/env node

import dotenv from 'dotenv';
import yargs from 'yargs';

import { initCommand } from './commands/init';
import { importCommand } from './commands/import';
import { execCommand} from './commands/exec';
import { prepareCommand} from './commands/prepare';

import { hideBin } from 'yargs/helpers';
import { addDefaultOptions } from './helper/yargs';
import { loadConfig } from './helper/configuration';

// ------------------------------

dotenv.config();

// ------------------------------

const config = loadConfig();
//console.log(`Config found: ${JSON.stringify(config)}`);
//console.log("logLevel", process.env);

const yargsInstance = yargs( hideBin(process.argv));

let parser = yargsInstance
    .usage('Usage: $0 <cmd> [args]')
    .showHelpOnFail(true, 'Specify --help for available options')
    .help('h')
    .alias('h', 'help')
    .config(config.options)
    .detectLocale(false)
    .demandCommand(1, 1)
    .strictCommands(true)
    .wrap(Math.min(yargsInstance.terminalWidth(), 120))
    .env('MHD');

parser = addDefaultOptions(parser)
    .command(initCommand)
    .command(importCommand)
    .command(prepareCommand)
    .command(execCommand);
(async () => {
    //const argv = await parser.parse();
    await parser.parse();
})();
