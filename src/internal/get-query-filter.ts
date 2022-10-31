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
    const predicate = index === 0 ? undefined : criteria.logicalOperator;

    if (predicate) query += ` ${predicate} `;

    query += getPrefix(index);

    if (criteria.type === 'filter') {
      query += `${criteria.property} ${criteria.condition} $${filterIndex}`;
      filterIndex += 1;
    } else if (criteria.type === 'predicate') {
      query += criteria.predicate;
    }

    query += getSuffix(index);

    return query;
  }, '');
};

export default getQueryFilter;
