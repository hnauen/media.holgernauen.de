import yargs from "yargs";

import { DefaultOptions } from "../helper/yargs";
import { logger } from "../helper/logger";

// ------------------------------

export const prepareCommand: yargs.CommandModule = {
    command: 'prepare',
    describe: 'Prepare some media',
    builder: (yargs: yargs.Argv<object>) => {
      return yargs
            .example([
                ['$0 prepare', 'Prepare some media'],
        ]);
    },
    handler: async (args: yargs.ArgumentsCamelCase<object>) => {
      const options: Options = <Options> <unknown> args;
      await runCommand(options);
    },
};

// ------------------------------

interface Options extends DefaultOptions {
  dummy: string;
};

// ------------------------------

const runCommand = async (options: Options) => {
    logger.debug('runCommand exec with options %s', options);
    logger.error('Not implemented');
    process.exit(2);
};
