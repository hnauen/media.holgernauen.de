import fs from 'fs';
import path from 'path';

import yargs from 'yargs';
import dayjs from 'dayjs';
import { ExifTool } from 'exiftool-vendored';

import { defaultCollectionStructure } from '../helper/collectionStructure';
import { coerceDirectoryExist, coerceNumber, coerceRegex, DefaultOptions } from '../helper/yargs';
import { logger } from '../helper/logger';
import { readAllFiles } from '../helper/files';

// ------------------------------

export const importCommand: yargs.CommandModule = {
    command: 'import <collectible> <source>',
    describe: 'Import media into collection',
    builder: (yargs: yargs.Argv<object>) => {
      return yargs
            .positional('collectible', {
                describe: 'What to import',
                demandOption: true,
                choices: defaultCollectionStructure.collectibles.map((collectible) => collectible.section),
            })
            .positional('source', {
                describe: 'Folder to import',
                demandOption: true,
                type: "string",
                coerce: (source) => coerceDirectoryExist(source),
            })
            .option('fileNameRegex', {
                alias: 'f',
                describe: 'Filter files by name',
                default: '/^[^.].*$/i/', // all, except hidden files
                type: 'string',
                coerce: (fileNameRegex) => coerceRegex(fileNameRegex),
            })
            .option('move', {
                alias: 'm',
                describe: 'Delete source files after import',
                default: false,
                type: 'boolean',
            })
            .option('overwrite', {
                alias: 'o',
                describe: 'Overwrite existing files',
                default: false,
                type: 'boolean',
            })
            .option('target', {
                alias: 't',
                describe: 'Folder within the base folder',
                default: defaultCollectionStructure.folders[0],
                choices: defaultCollectionStructure.folders,
            })
            .option('tza', {
                describe: 'Timezone adjustment in hours',
                type: 'number',
                coerce: (tza) => coerceNumber(tza),
            })
            .example([
                ['$0 import picture /path/to/source', 'Import into ${intFolder}/incoming/picture'],
                ['$0 import picture /path/to/source -o', 'Overwrite existing files (or use MHD_OVERWRITE'],
            ]);
    },
    handler: async (args: yargs.ArgumentsCamelCase<object>) => {
      const options: Options = <Options> <unknown> args;
      await runCommand(options);
    },
};

// ------------------------------

interface Options extends DefaultOptions {
    collectible: string;
    source: string;
    fileNameRegex: RegExp;
    move: boolean;
    overwrite: boolean;
    target: string;
    tza: number;
};

// ------------------------------

const runCommand = async (options: Options) => {
    logger.debug('runCommand import with options %s', options);
    const targetPath = path.join(options.intFolder, options.target, options.collectible);
    if (!fs.existsSync(targetPath)) {
        logger.error(`Target path ${targetPath} does not exist`);
        return;
    }
    if (!fs.statSync(targetPath).isDirectory()) {
        logger.error(`Target path ${targetPath} is not a directory`);
        return;
    }
    switch (options.collectible) {
        case 'picture':
            const exiftool = new ExifTool();
            for (const file of readAllFiles(options.source, options.fileNameRegex)) {
                logger.info(`Importing ${file}`);
                const tags = await exiftool.read(file);
                const dateTimeOriginal = dayjs(tags.DateTimeOriginal?.toString());
                let dateTimeTarget = dateTimeOriginal;
                if (options.tza) {
                    dateTimeTarget = dateTimeOriginal.add(options.tza, 'hour');
                }
                const folderYear = dateTimeTarget.format('YYYY');
                const folderMonth = dateTimeTarget.format('MM');
                const folderTimestamp = dateTimeTarget.format('YYYY-MM-DD');
                const targetDirectory = path.join(targetPath, folderYear, folderMonth, folderTimestamp);
                logger.debug(`Creating folder ${targetDirectory}`);
                fs.mkdirSync(targetDirectory, {
                    recursive: true,
                });
                const targetFilePath = path.join(targetDirectory, path.basename(file));
                logger.debug(`Copy to ${targetFilePath}`);
                if (fs.existsSync(targetFilePath) && !options.overwrite) {
                    logger.error(`Use --overwrite to replace existing file ${targetFilePath}`);
                }
                else {
                    fs.copyFileSync(file, targetFilePath);
                    if (options.tza) {
                        const dateTimeTargetString = dateTimeTarget.format('YYYY-MM-DDTHH:mm:ss');
                        try {
                            await exiftool.write(targetFilePath, { AllDates: dateTimeTargetString }, { writeArgs: ['-overwrite_original'] });
                        }
                        catch (error) {
                            logger.error(error);
                        }
                    }
                    if (options.move) {
                        logger.debug(`Delete ${file}`);
                        fs.unlinkSync(file);
                    }
                }
            }
            await exiftool.end();
            break;
        default:
            logger.error(`Collectible ${options.collectible} not implemented`);
            break;
    }
};
