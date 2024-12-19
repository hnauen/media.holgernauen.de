import fs from 'fs';
import path from 'path';

import { CollectibleAssembly, defaultCollectionStructure } from './collectionStructure';
import { logger } from './logger';

export function* readAllFiles(dir: string, regex: RegExp): Generator<string> {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    if (file.isDirectory()) {
      yield* readAllFiles(path.join(dir, file.name), regex);
    }
    else {
      if (!regex || regex.test(file.name)) {
        yield path.join(dir, file.name);
      }
    }
  }
};

export const createCollectiblePath = (collectiblePath: string, assembly: CollectibleAssembly) => {
  switch (assembly) {
    case CollectibleAssembly.Dictionary:
      logger.verbose(`Creating folders: "${collectiblePath}/[_A-Z国]"`);
      for (const folder of defaultCollectionStructure.albumFolders) {
        const folderDirectory = path.join(collectiblePath, folder);
        fs.mkdirSync(folderDirectory, {
          recursive: true,
        });
      }
      break;
    case CollectibleAssembly.Date: {
      const currentYear = new Date().getFullYear();
      const folderDirectory = path.join(collectiblePath, `${currentYear}`);
      logger.verbose(`Creating folder: "${folderDirectory}"`);
      fs.mkdirSync(folderDirectory, {
        recursive: true,
      });
    }
      break;
    case CollectibleAssembly.Unstructured:
      logger.verbose(`Creating folder: "${collectiblePath}"`);
      fs.mkdirSync(collectiblePath, {
        recursive: true,
      });
      break;
    default:
      logger.error(`Unknown CollectibleAssembly: ${assembly}`);
      break;
  }
};

export const createJsonFile = (filePath: string, content: string) => {
  const folderPath = path.dirname(filePath);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, {
      recursive: true,
    });
  } else if (!fs.statSync(folderPath).isDirectory()) {
    logger.error(`Not a directory: "${folderPath}"`);
    return false;
  }
  if (!fs.existsSync(filePath)) {
    logger.verbose(`Creating file: "${filePath}"`);
    fs.writeFileSync(filePath, JSON.stringify(content, null, 2));
    return true;
  }
  else {
    logger.debug(`File already exists: "${filePath}"`);
    return false;
  }
};

export const copyFile = (source: string, target: string): boolean => {
  if (!fs.existsSync(source)) {
    logger.error(`Source does not exist: "${source}"`);
    return false;
  }
  if (!fs.statSync(source).isFile) {
    logger.error(`Source is not a file: "${source}"`);
    return false;
  }

  if (fs.existsSync(target)) {
    logger.error(`Target already exists: "${target}"`);
    return false;
  }
  const targetPath = path.dirname(target);
  if (!fs.existsSync(targetPath)) {
    fs.mkdirSync(targetPath, {
      recursive: true,
    });
  }
  else if (!fs.statSync(targetPath).isDirectory()) {
    logger.error(`Not a directory: "${targetPath}"`);
    return false;
  }

  fs.copyFileSync(source, target, fs.constants.COPYFILE_EXCL);
  return true;
};

