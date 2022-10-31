import Realm from 'realm';
import getQueryFilter from './internal/get-query-filter';
import {
  mergeDistinctProperties,
  mergePrefixes,
  mergeSuffixes,
  mergeActions,
} from './internal/merge';
import type {
  DeepReadonlyArray,
  Predicate,
  Action,
  Filter,
  Prefix,
  Suffix,
} from './internal/types';
import {
  RealmConditionalOperator,
  RealmNumericValueType,
  RealmLogicOperator,
  RealmQuerySort,
} from './types';

export * from './types';

const DEFAULT_OPERATOR: RealmLogicOperator = 'AND';

export class RealmQueryBuilder<T = any> {
  private _realmResult: Realm.Results<T>;

  private _distinctProperties: DeepReadonlyArray<string> = [];

  private _prefixes: DeepReadonlyArray<Prefix> = [];

  private _suffixes: DeepReadonlyArray<Suffix> = [];

  private _actions: DeepReadonlyArray<Action> = [];

  private _operator: RealmLogicOperator = DEFAULT_OPERATOR;

  private _resultLimit: undefined | number = undefined;

  constructor(realmResults: Realm.Results<T>) {
    this._realmResult = realmResults;
  }

  clone() {
    return Object.create(this) as this;
  }

  where(
    property: string,
    operator: RealmConditionalOperator,
    value: any,
  ) {
    return this.clone()._where(property, operator, value);
  }

  truepredicate() {
    return this.clone()._predicate('TRUEPREDICATE');
  }

  falsepredicate() {
    return this.clone()._predicate('FALSEPREDICATE');
  }

  equalTo(property: string, value: any, caseInsensitive?: boolean) {
    const operator = caseInsensitive ? '==[c]' : '==';

    return this.where(property, operator, value);
  }

  notEqualTo(property: string, value: any, caseInsensitive?: boolean) {
    const operator = caseInsensitive ? '!=[c]' : '!=';

    return this.where(property, operator, value);
  }

  like(property: string, value: string, caseInsensitive?: boolean) {
    const operator = caseInsensitive ? 'LIKE[c]' : 'LIKE';

    return this.where(property, operator, value);
  }

  contains(property: string, value: string, caseInsensitive?: boolean) {
    const operator = caseInsensitive ? 'CONTAINS[c]' : 'CONTAINS';

    return this.where(property, operator, value);
  }

  beginsWith(property: string, value: string, caseInsensitive?: boolean) {
    const operator = caseInsensitive ? 'BEGINSWITH[c]' : 'BEGINSWITH';

    return this.where(property, operator, value);
  }

  endsWith(property: string, value: string, caseInsensitive?: boolean) {
    const operator = caseInsensitive ? 'ENDSWITH[c]' : 'ENDSWITH';

    return this.where(property, operator, value);
  }

  greaterThan(property: string, value: RealmNumericValueType) {
    return this.where(property, '>', value);
  }

  greaterThanOrEqualTo(
    property: string,
    value: RealmNumericValueType,
  ) {
    return this.where(property, '>=', value);
  }

  lessThan(property: string, value: RealmNumericValueType) {
    return this.where(property, '<', value);
  }

  lessThanOrEqualTo(
    property: string,
    value: RealmNumericValueType,
  ) {
    return this.where(property, '<=', value);
  }

  between(property: string, start: RealmNumericValueType, end: RealmNumericValueType) {
    return this
      .clone()
      ._beginGroup()
      ._where(property, '>=', start)
      ._where(property, '<=', end)
      ._endGroup();
  }

  or() {
    return this.clone()._setOperator('OR');
  }

  and() {
    return this.clone()._setOperator('AND');
  }

  beginGroup() {
    return this.clone()._beginGroup();
  }

  endGroup() {
    return this.clone()._endGroup();
  }

  not() {
    return this.clone()._not();
  }

  in(property: string, values: ReadonlyArray<any>) {
    const thisClone = this.clone();

    if (values.length === 0) {
      return thisClone.falsepredicate();
    }

    thisClone._beginGroup();
    values.forEach((value, index) => {
      if (index !== 0) thisClone._setOperator('OR');

      thisClone._where(property, '==', value);
    });
    thisClone._endGroup();

    return thisClone;
  }

  distinct(...properties: string[]) {
    return this.clone()._distinct(...properties);
  }

  sorted(property: string, order?: RealmQuerySort) {
    return this.clone()._sorted(property, order);
  }

  limit(limit: number) {
    return this.clone()._limit(limit);
  }

  first(): T | undefined {
    return this.result()[0];
  }

  last(): T | undefined {
    const result = this.result();

    return result[result.length - 1];
  }

  findBy(property: string, value: any) {
    return this.clone()._where(property, '==', value).first();
  }

  size() {
    return this.result().length;
  }

  min<V extends RealmNumericValueType>(property?: string) {
    return this.result().min(property) as V | null;
  }

  max<V extends RealmNumericValueType>(property?: string) {
    return this.result().max(property) as V | null;
  }

  sum(property?: string) {
    return this.result().sum(property);
  }

  avg(property?: string) {
    return this.result().avg(property);
  }

  merge(query: RealmQueryBuilder<T>) {
    return this.clone()._merge(query);
  }

  result() {
    const query = this._getQuery();
    const values = this._getQueryValues();

    return this._realmResult.filtered(query, ...values);
  }

  private _makeMergeData() {
    return {
      prefixes: this._prefixes,
      actions: this._actions,
      suffixes: this._suffixes,
      distinctProperties: this._distinctProperties,
      operator: this._operator,
    };
  }

  private _merge(query: RealmQueryBuilder<T>) {
    const data = {
      current: this._makeMergeData(),
      received: query._makeMergeData(),
    };

    this._prefixes = mergePrefixes(data);
    this._actions = mergeActions(data);
    this._suffixes = mergeSuffixes(data);
    this._distinctProperties = mergeDistinctProperties(data);

    return this;
  }

  private _limit(limit: number) {
    this._resultLimit = limit;

    return this;
  }

  private _sorted(property: string, order?: RealmQuerySort) {
    const isDescending = order === 'desc';

    this._realmResult = this._realmResult.sorted(property, isDescending);

    return this;
  }

  private _getQueryFilter() {
    return getQueryFilter({
      actions: this._actions,
      prefixes: this._prefixes,
      suffixes: this._suffixes,
    });
  }

  private _getQuerySuffix() {
    let suffix = '';

    if (this._distinctProperties.length) {
      const distinct = this._distinctProperties.join(',');
      suffix += ` DISTINCT(${distinct})`;
    }

    if (typeof this._resultLimit === 'number') {
      suffix += ` LIMIT(${this._resultLimit})`;
    }

    return suffix;
  }

  private _getQuery() {
    let query = this._getQueryFilter();

    query += this._getQuerySuffix();

    return query;
  }

  private _getQueryValues() {
    return this._actions
      .filter((action): action is Filter => action.type === 'filter')
      .map(({ value }) => value);
  }

  private _pushPrefix(value: Prefix['value']) {
    this._prefixes = [
      ...this._prefixes,
      { value, at: this._actions.length },
    ];

    return this;
  }

  private _pushSuffix(value: Suffix['value']) {
    this._suffixes = [
      ...this._suffixes,
      { value, at: this._actions.length - 1 },
    ];

    return this;
  }

  private _beginGroup() {
    return this._pushPrefix('(');
  }

  private _endGroup() {
    return this._pushSuffix(')');
  }

  private _not() {
    return this._pushPrefix('NOT');
  }

  private _resetOperator() {
    this._operator = DEFAULT_OPERATOR;

    return this;
  }

  private _setOperator(operator: RealmLogicOperator) {
    this._operator = operator;

    return this;
  }

  private _distinct(...properties: string[]) {
    this._distinctProperties = [...properties];

    return this;
  }

  private _where(
    property: string,
    condition: RealmConditionalOperator,
    value: any,
  ) {
    this._actions = [
      ...this._actions,
      {
        type: 'filter',
        property,
        condition,
        value,
        logicalOperator: this._operator,
      },
    ];

    this._resetOperator();

    return this;
  }

  private _predicate(
    predicate: Predicate['predicate'],
  ) {
    this._actions = [
      ...this._actions,
      {
        type: 'predicate',
        predicate,
        logicalOperator: this._operator,
      },
    ];

    this._resetOperator();

    return this;
  }
}

const realmQueryBuilder = <T>(realmResults: Realm.Results<T>) => (
  new RealmQueryBuilder<T>(realmResults)
);

export default realmQueryBuilder;
