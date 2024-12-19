import { Liquid } from 'liquidjs';
import { getTagTemplate } from './collectionStructure';
import { Tags } from 'exiftool-vendored';

const engine = new Liquid();

engine.registerFilter('or', (initial, arg1) => initial || arg1);

engine.registerFilter('initial', (initial) => {
  let result = '';

  // Remmove diacritics
  const string = initial?.normalize("NFD").replace(/\p{Diacritic}/gu, "") || '';

  // If Latin character
  if (string.match(/^[a-z]/i)) {
    result = string[0].toUpperCase();
  }
  // If Chinese character, see https://ayaka.shn.hk/hanregex/
  else if (string.match(/[\u4e00-\u9fff\u3400-\u4dbf\u{20000}-\u{2a6df}\u{2a700}-\u{2ebef}\u{30000}-\u{323af}\ufa0e\ufa0f\ufa11\ufa13\ufa14\ufa1f\ufa21\ufa23\ufa24\ufa27\ufa28\ufa29\u3006\u3007][\ufe00-\ufe0f\u{e0100}-\u{e01ef}]?/gmu)) {
    result = '国';
  } else {
    result = '_';
  }

  return result;
});

export const renderTemplate = (template: string, data: object): string => {
  try {
    return engine.parseAndRenderSync(template, data);
  } catch (error) {
    console.error('Error rendering template', error);
    process.exit(1);
  }
};

export const renderTagTemplate = (varName: string, tags: Tags) => {
  const template = getTagTemplate(varName) || '';
  return renderTemplate(template, tags);
};
