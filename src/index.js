import { resolve, extname } from 'path';
import { readFileSync } from 'fs';
import _ from 'lodash';
import parse from './parsers.js';

const makeArrayDiff = (obj1, obj2) => {
  const keys = _.sortBy(_.union(_.keys(obj1), _.keys(obj2)));

  const result = keys.map((key) => {
    const value1 = obj1[key];
    const value2 = obj2[key];
    if (_.has(obj1, key) && _.has(obj2, key) && (value1 !== value2)) {
      return {
        name: key, value1, value2, type: 'changed',
      };
    }
    if (!_.has(obj1, key)) {
      return { name: key, value: value2, type: 'added' };
    }
    if (!_.has(obj2, key)) {
      return { name: key, value: value1, type: 'removed' };
    }
    return { name: key, value: value1, type: 'unchanged' };
  });
  return result;
};

const readFile = (file) => (readFileSync(resolve(file), 'utf-8'));

const genDiff = (file1, file2) => {
  const obj1 = parse(readFile(file1), extname(file1).slice(1));
  const obj2 = parse(readFile(file2), extname(file2).slice(1));

  const arrdiff = makeArrayDiff(obj1, obj2);
  const result = arrdiff.map((item) => {
    if (item.type === 'changed') {
      return `- ${item.name}: ${item.value1}\n+ ${item.name}: ${item.value2}`;
    }
    if (item.type === 'added') {
      return `+ ${item.name}: ${item.value}`;
    }
    if (item.type === 'removed') {
      return `- ${item.name}: ${item.value}`;
    }
    return `  ${item.name}: ${item.value}`;
  });
  return `{\n${result.join('\n')}\n}`;
};

export default genDiff;
