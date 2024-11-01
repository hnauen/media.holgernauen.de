import path from 'path';

import yargs from 'yargs';

import { defaultCollectionStructure } from '../helper/collectionStructure';
import { logger } from '../helper/logger';
import { copyFile, createCollectiblePath } from '../helper/files';
import { defaultConfigFile, defaultConfigTemplateFile } from '../helper/configuration';
import { DefaultOptions } from '../helper/yargs';

// ------------------------------

export const initCommand: yargs.CommandModule = {
    command: 'init',
    describe: 'Initalize files and folder',
    builder: (yargs: yargs.Argv<object>) => {
      return yargs
            .option('configFile', {
                alias: 'c',
                describe: 'Location of config file',
                default: defaultConfigFile,
                type: "string",
            })
            .option('skipIntFolder', {
                alias: 'I',
                describe: 'Do not create int folders',
                type: "boolean",
            })
            .option('skipConfigFile', {
                alias: 'C',
                describe: 'Do not create config file',
                type: "boolean",
            })
            .example([
                ['$0 init', 'Use default base folder or env MHD_BASE_FOLDER via .env'],
                ['$0 init -i /path/to/folder', 'Use specified int folder'],
                ['$0 init --intFolder /path/to/folder', 'Use specified int folder'],
            ]);
    },
    handler: async (args: yargs.ArgumentsCamelCase<object>) => {
      const options: Options = <Options> <unknown> args;
      await runCommand(options);
    },
};

// ------------------------------

interface Options extends DefaultOptions {
    configFile: string;
    skipIntFolder: boolean;
    skipConfigFile: boolean;
};

// ------------------------------

const runCommand = async (options: Options) => {
    logger.debug('runCommand init with options %s', options);
    if (options.intFolder && !options.skipIntFolder) {
        for (const folder of defaultCollectionStructure.folders) {
            const folderPath = path.join(options.intFolder, folder);
            logger.info(`Creating folder ${folderPath}`);
            for (const collectible of defaultCollectionStructure.collectibles) {
                const collectiblePath = path.join(folderPath, collectible.section);
                createCollectiblePath(collectiblePath, collectible.assembly);
            }
        }
    }
    else {
        logger.info(`Skipped creating base folder`);
    }
    if (options.configFile && !options.skipConfigFile) {
        logger.info(`Creating config file`);
        copyFile(defaultConfigTemplateFile, options.configFile);
    }
    else {
        logger.info(`Skipped creating config file`);
    }
};
