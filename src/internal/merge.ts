import {
  Action,
  DeepReadonlyArray,
  Prefix,
  Suffix,
} from './types';
import { RealmLogicOperator } from '../types';

type Atributes = {
  actions: DeepReadonlyArray<Action>,
  prefixes: DeepReadonlyArray<Prefix>,
  suffixes: DeepReadonlyArray<Suffix>,
  distinctProperties: DeepReadonlyArray<string>,
  operator: RealmLogicOperator,
}

type Params = {
  current: Atributes,
  received: Atributes
}

export const mergePrefixes = ({ current, received }: Params) => {
  const initAt = current.actions.length;

  const newPrefixSuffixes = received.prefixes.map(
    (prefix) => ({ ...prefix, at: prefix.at + initAt }),
  );

  return [...current.prefixes, ...newPrefixSuffixes];
};

export const mergeSuffixes = ({ current, received }: Params) => {
  const initAt = current.actions.length;

  const newPrefixSuffixes = received.suffixes.map(
    (suffix) => ({ ...suffix, at: suffix.at + initAt }),
  );

  return [...current.suffixes, ...newPrefixSuffixes];
};

export const mergeActions = ({ current, received }: Params) => {
  const receivedActions = [...received.actions];

  if (received.actions.length) {
    receivedActions[0] = {
      ...receivedActions[0],
      logicalOperator: current.operator,
    };
  }

  return [...current.actions, ...receivedActions];
};

export const mergeDistinctProperties = ({ current, received }: Params) => (
  [...current.distinctProperties, ...received.distinctProperties]
);
