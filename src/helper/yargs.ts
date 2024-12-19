import fs from 'fs';
import path from 'path';

import expand_tilde from 'expand-tilde';
import yargs from 'yargs';

import { initLogger, logger } from './logger';
import { getConfiguration } from './configuration';
import { renderTemplate } from './templates';

// ------------------------------

export const coerceNumber = (number: number) => {
  if (isNaN(number)) {
    throw new Error(`"${number}" is not a number.`);
  }
  return number;
};

export const coerceRegex = (regexStr: string) => {
  try {
    let regex;
    const re = /^\/(.*)\/(.*?)\/$/;
    const reParts = re.exec(regexStr);
    if (reParts) {
      regex = new RegExp(reParts[1], reParts[2]);
    }
    else {
      regex = new RegExp(regexStr);
    }
    return regex;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  catch (error) {
    throw new Error(`RegExp "${regexStr}" is not a valid regular expression.`);
  }
};

export const coerceDirectoryExist = (directoryPath: string) => {
  const normalizedDirectoryPath = path.normalize(expand_tilde(directoryPath));
  if (!fs.existsSync(normalizedDirectoryPath)) {
    throw new Error(`Path "${normalizedDirectoryPath}" does not exist.`);
  }
  if (!fs.lstatSync(normalizedDirectoryPath).isDirectory()) {
    throw new Error(`Path "${normalizedDirectoryPath}" is not a directory.`);
  }
  return normalizedDirectoryPath;
};


export const coerceFileExist = (filePath: string) => {
  const normalizedFilePath = path.normalize(expand_tilde(filePath));
  if (!fs.existsSync(normalizedFilePath)) {
    throw new Error(`File "${normalizedFilePath}" does not exist.`);
  }
  if (!fs.lstatSync(normalizedFilePath).isFile()) {
    throw new Error(`File "${normalizedFilePath}" is not a regular file.`);
  }
  return normalizedFilePath;
};

export const coerceLogger = (logLevel: string) => {
  initLogger(logLevel);
  return logLevel;
};

export const coerceVars = (vars: string[]) => {
  const result: AnyKeyValueObject = { ...getConfiguration().vars };

  vars.forEach((keyValue) => {
    const matches = keyValue.match(/(.+?)\s*=\s*(.+)/i);
    if (!matches || matches.length !== 3) {
      throw new Error(`Invalid variable "${keyValue}"`);
    }
    result[matches[1]] = matches[2];
  });

  logger.debug('coerceVars %s', vars);
  logger.debug('coerceVars %s', result);

  return result;
};

export interface AnyKeyValueObject {
  [key: string]: string;
};
export interface DefaultOptions {
  logLevel: string;
  vars: AnyKeyValueObject;
  intFolder: string;
};

export const addDefaultOptions = (yargs: yargs.Argv<object>) => {
  return yargs
    .option('logLevel', {
      alias: 'l',
      describe: 'Severity of the log output',
      choices: ['error', 'info', 'verbose', 'debug'],
      default: 'info',
      coerce: (logLevel: string) => coerceLogger(logLevel),
    })
    .option('vars', {
      alias: ['v', 'var'],
      describe: 'Variables for settings and other options, key=value',
      type: 'array',
      coerce: (vars: string[]) => coerceVars(vars),
    })
    .option('intFolder', {
      alias: 'i',
      describe: 'Integration folder of the collection',
      default: path.relative(process.cwd(), path.join(__dirname, '..', '..')) || '.',
      type: 'string',
      coerce: (intFolder: string) => coerceDirectoryExist(intFolder),
    })
    .check((argv) => {
      if (!argv.vars) {
        argv.vars = argv.var = argv.v = { ...getConfiguration().vars };
      }
      Object.keys(argv.vars).forEach((key) => {
        if (argv.vars) {
          argv.vars[key] = renderTemplate(argv.vars[key], argv.vars);
        }
      });
      logger.debug('check %s', argv.vars);
      return true;
    });
};
exports.addDefaultOptions = addDefaultOptions;
