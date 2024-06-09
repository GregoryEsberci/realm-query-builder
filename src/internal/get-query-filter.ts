import {
  Action,
  DeepReadonlyArray,
  Prefix,
  Suffix,
} from './types';

type Params = {
  actions: DeepReadonlyArray<Action>,
  prefixes: DeepReadonlyArray<Prefix>,
  suffixes: DeepReadonlyArray<Suffix>
}

const makeGetPrefix = (prefixes: ReadonlyArray<Prefix>) => {
  const getter = (index: number) => prefixes.reduce((acc, prefix) => {
    if (prefix.at !== index) return acc;

    return `${acc} ${prefix.value} `;
  }, '');

  return getter;
};

const makeGetsSuffixes = (suffixes: ReadonlyArray<Suffix>) => {
  const getter = (index: number) => suffixes.reduce((acc, suffix) => {
    if (suffix.at !== index) return acc;

    return `${acc} ${suffix.value} `;
  }, '');

  return getter;
};

const getQueryFilter = ({ actions, prefixes, suffixes }: Params) => {
  if (actions.length === 0) return 'TRUEPREDICATE';

  let filterIndex = 0;

  const getPrefix = makeGetPrefix(prefixes);
  const getSuffix = makeGetsSuffixes(suffixes);

  return actions.reduce((query, criteria, index) => {
    if (index !== 0) query += ` ${criteria.logicalOperator} `;

    query += getPrefix(index);

    query += criteria.query.replace(
      /(?<=\$)(\d+)/g, // matches the number that is preceded by a $
      (valueIndex) => (+valueIndex + filterIndex).toString(),
    );

    filterIndex += criteria.values.length;

    query += getSuffix(index);

    return query;
  }, '');
};

export default getQueryFilter;
