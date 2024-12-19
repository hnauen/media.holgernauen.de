import fs from 'fs';
import path from 'path';

import yargs from 'yargs';
import dayjs from 'dayjs';
import { ExifDateTime, ExifTool} from 'exiftool-vendored';

import { Collectible, defaultCollectionStructure, getCollectible } from '../helper/collectionStructure';
import { AnyKeyValueObject, coerceDirectoryExist, coerceNumber, coerceRegex, DefaultOptions } from '../helper/yargs';
import { logger } from '../helper/logger';
import { readAllFiles } from '../helper/files';
import { renderTagTemplate, renderTemplate } from '../helper/templates';

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
    const options: Options = <Options><unknown>args;
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

const prepareOptions = (options: Options) => {
  const targetPath = path.join(options.intFolder, options.target, options.collectible);
  if (!fs.existsSync(targetPath)) {
    logger.error(`Target path ${targetPath} does not exist`);
    process.exit(1);
  }
  if (!fs.statSync(targetPath).isDirectory()) {
    logger.error(`Target path ${targetPath} is not a directory`);
    process.exit(1);
  }

  const collectible = getCollectible(options.collectible);
  if (!collectible) {
    logger.error(`Collectible ${options.collectible} not found`);
    process.exit(1);
  }

  return { targetPath, collectible };
};

const checkFiles = async (collectible: Collectible, exiftool: ExifTool, options: Options) => {
  const vars: AnyKeyValueObject = {};

  // Check if everything is OK
  for (const file of readAllFiles(options.source, options.fileNameRegex)) {
    // Skip files that are not checked for the collectible
    if (collectible.checkMediaRegex && !file.match(collectible.checkMediaRegex)) {
      continue;
    }

    const tags = await exiftool.read(file);

    // Check all required vars
    for (const requiredVar of collectible.requiredVars) {
      const varContent = options.vars[requiredVar] || renderTagTemplate(requiredVar, tags);

      // Check if all required vars are given
      if (!varContent) {
        logger.error(`Missing variable "${requiredVar}" for ${file}`);
        return false;
      };

      // Check if vars for all files are unique if importing to one Folder
      if (collectible.importToOneFolder) {
        if (vars[requiredVar] && vars[requiredVar] !== varContent) {
          logger.error(`Variable "${requiredVar}" is not unique. Update tag or use variable.`);
          return false;
        }
        vars[requiredVar] = varContent;
      }
    }
  }
  return true;
}

const processFiles = async (targetPath: string, collectible: Collectible, exiftool: ExifTool, options: Options) => {
  for (const file of readAllFiles(options.source, options.fileNameRegex)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tags = (await exiftool.read(file)) as any;
    const dateTags: AnyKeyValueObject = {};

    // Convert ExifDateTime to string
    Object.keys(tags).forEach((key) => {
      if (tags[key] instanceof ExifDateTime) {
        const exifDateTime = tags[key];
        const dateTimeOriginal = dayjs(exifDateTime.toString());
        let dateTimeTarget = dateTimeOriginal;

        // Adjust date time in tags but ignore file system dates like FileCreateDate et. al.
        if (options.tza && !key.startsWith('File')) {
          dateTimeTarget = dateTimeOriginal.add(options.tza, 'hour');
        }
        tags[key] = dateTimeTarget.toISOString();
        dateTags[key] = tags[key];
      }
    });

    // Populate vars
    const vars: AnyKeyValueObject = {};
    for (const requiredVar of collectible.requiredVars) {
      const varContent = options.vars[requiredVar] || renderTagTemplate(requiredVar, tags);
      vars[requiredVar] = varContent;
    }

    // Create target path
    let targetDirectory = targetPath;
    for (const pathComponent of collectible.pathComponents) {
      targetDirectory = path.join(targetDirectory, renderTemplate(pathComponent, vars));
    }
    if (!fs.existsSync(targetDirectory)) {
      logger.info(`Creating folder "${targetDirectory}"`);
      fs.mkdirSync(targetDirectory, {
        recursive: true,
      });
    }

    // Copy file
    const targetFilePath = path.join(targetDirectory, path.basename(file));
    if (fs.existsSync(targetFilePath) && !options.overwrite) {
      logger.warn(`Use --overwrite to replace existing file "${targetFilePath}"`);
      continue;
    }
    logger.info(`Creating file "${targetFilePath}"`);
    fs.copyFileSync(file, targetFilePath);

    // Adjust date time in file
    if (options.tza) {
      try {
        //await exiftool.write(targetFilePath, { AllDates: dateTimeTargetString }, { writeArgs: ['-overwrite_original'] });
        await exiftool.write(targetFilePath, dateTags, { writeArgs: ['-overwrite_original'] });
      }
      catch (error) {
        logger.error(error);
      }
    }
  }
}

const doChores = async (options: Options) => {
  for (const file of readAllFiles(options.source, options.fileNameRegex)) {
    // Delete source file
    if (options.move) {
      logger.debug(`Delete ${file}`);
      fs.unlinkSync(file);

      // Todo: Remove empty folders
      // Todo: cd one up if cwd is empty
    }
  }
}

const runCommand = async (options: Options) => {
  logger.debug('runCommand import with options %s', options);

  const { targetPath, collectible } = prepareOptions(options);
  const exiftool = new ExifTool();

  if (! await checkFiles(collectible, exiftool, options)) {
    process.exit(1);
  }
  await processFiles(targetPath, collectible, exiftool, options);
  await doChores(options);

  await exiftool.end();
};
