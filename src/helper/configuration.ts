
import fs from 'fs';
import os from 'os';
import path from 'path';

import findup_sync from 'findup-sync';
import json5 from 'json5';

// ----------------------------------------------------

const canonicalConfigFolder = path.join(os.homedir(), '.config', 'mhd'); // ~/.config/mhd
const projectFolder = path.relative(process.cwd(), path.join(__dirname, '..', '..')) || '.';

const defaultConfigFileName = '.mhdrc';
export const defaultConfigFile = path.join(projectFolder, defaultConfigFileName);

const defaultConfigTemplateFileName = '.mhdrc.template';
export const defaultConfigTemplateFile = path.join(projectFolder, defaultConfigTemplateFileName);

const findConfigurationFilePath = () => {
    const validFileNames = `(${defaultConfigFileName}|${defaultConfigFileName}.json5)`;
    const configPath = findup_sync(validFileNames) ||
        findup_sync(validFileNames, { cwd: canonicalConfigFolder }) ||
        findup_sync(validFileNames, { cwd: projectFolder });
    return configPath;
};

// ----------------------------------------------------

export interface Configuration {
    options: {
        [key: string]: string,
    },
    scripts: {
        [key: string]: string,
    },
    vars: {
        [key: string]: string,
    },
};

const emptyConfiguration: Configuration = {
    options: {},
    scripts: {},
    vars: {},
};

let configuration: Configuration | undefined;

const loadConfig = (): Configuration => {
    if (configuration) {
        return configuration;
    }
    const configPath = findConfigurationFilePath();
    if (!configPath) {
        console.log('Warning: Config file not found. Try to create one with "mhd init"');
        return emptyConfiguration;
    }
    try {
        const content = fs.readFileSync(configPath);
        configuration = <Configuration> json5.parse(content.toString());
        return configuration;
    }
    catch (error) {
        console.error(`Invalid JSON5 in ${configPath}`);
        console.error(error);
        process.exit(1);
    }
};

export const getConfiguration = (): Configuration => {
  return configuration || loadConfig();
};
