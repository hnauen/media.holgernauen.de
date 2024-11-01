import yargs from "yargs";

import { logger } from "../helper/logger";
import { loadConfig } from "../helper/configuration";
import { DefaultOptions } from "../helper/yargs";

// ------------------------------

export const execCommand: yargs.CommandModule = {
    command: 'exec <script>',
    describe: 'Exec some script from ".mhdrc"',
    builder: (yargs: yargs.Argv<object>) => {
        return yargs
            .positional('script', {
                describe: 'script to execute',
                demandOption: true,
                choices: Object.keys(loadConfig().scripts) || [],
            })
            .example([
                ['$0 exec diff', 'Show differences between INT and PROD'],
                ['$0 exec update', 'Update PROD with the files from INT'],
                ['$0 exec backup', 'Backup PROD to BKUP'],
                ['$0 exec restore', 'Restore BKUP to PROD'],
                ['$0 exec extract', 'Extract MDs from PROD to INT'],
            ]);
    },
    handler: async (args: yargs.ArgumentsCamelCase<object>) => {
        const options: Options = <Options> <unknown> args;
        await runCommand(options);
    },
};

// ------------------------------

interface Options extends DefaultOptions {
    script: string;
};

// ------------------------------

const runCommand = async (options: Options) => {
    logger.debug('runCommand exec with options %s', options);
    try {
        const config = loadConfig();

        const vars = { ...config.options, ...config.vars };
        vars.command = options.script;
        vars.intFolder = options.intFolder;
        vars.logLevel = options.logLevel;

        logger.info(`Exec script ${options.script}`);
        let script = `${config.scripts[options.script]}`;

        logger.verbose(`${script}`); // log script incl. variables
        for (const varName in vars) {
            const varValue = vars[varName];
            script = script.replaceAll(`{${varName}}`, varValue);
        }
        logger.verbose(`${script}`); // log script with substituted variables

        const dynamicImport = new Function('specifier', 'return import(specifier)');
        const { execa } = await dynamicImport("execa");
        await execa(script, { shell: true, stdio: 'inherit' });
    }
    catch (error) {
        logger.error(error);
        process.exit(1);
    }
};
