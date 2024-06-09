import type { RealmLogicOperator } from '../types';

export type DeepReadonly<T> =
    T extends (infer R)[] ? DeepReadonlyArray<R> :
    T extends ((...args: any[]) => any) ? T :
    T extends object ? DeepReadonlyObject<T> :
    T;

export type DeepReadonlyArray<T> = ReadonlyArray<DeepReadonly<T>>

export type DeepReadonlyObject<T> = {
    readonly [P in keyof T]: DeepReadonly<T[P]>;
};

export type Predicate = 'FALSEPREDICATE' | 'TRUEPREDICATE'

export type Filtered = {
  type: 'filtered',
  query: string,
  values: any[]
  logicalOperator: RealmLogicOperator,
}

export type Prefix = {
  value: 'NOT' | '(',
  at: number
}

export type Suffix = {
  value: ')'
  at: number
}

export type Action = Filtered;
