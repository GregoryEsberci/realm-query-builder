import Realm from 'realm';

export type RealmQuerySort = 'asc' | 'desc';
export type RealmStringOperator = 'CONTAINS' | 'CONTAINS[c]'
  | 'BEGINSWITH' | 'BEGINSWITH[c]'
  | 'ENDSWITH' | 'ENDSWITH[c]'
  | 'LIKE' | 'LIKE[c]'
  | '==' | '==[c]'
  | '!=' | '!=[c]';
export type RealmNumberOperator = '>' | '<' | '>=' | '<=';
export type RealmEqualityOperator = '==' | '!=';
export type RealmConditionalOperator = RealmNumberOperator
  | RealmStringOperator
  | RealmEqualityOperator;

export type RealmLogicOperator = 'AND' | 'OR';
export type RealmNumericValueType = Date | number;

type Predicate = {
  type: 'predicate',
  predicate: 'FALSEPREDICATE' | 'TRUEPREDICATE'
  logicalOperator: RealmLogicOperator,
}

type Filter = {
  type: 'filter',
  value: any,
  field: string,
  condition: RealmConditionalOperator,
  logicalOperator: RealmLogicOperator,
}

type Prefix = {
  value: 'NOT' | '(',
  at: number
}

type Suffix = {
  value: ')'
  at: number
}

type Action = Filter | Predicate;

const DEFAULT_OPERATOR: RealmLogicOperator = 'AND';
export class RealmQueryBuilder<T = any> {
  private _realmResult: Realm.Results<T>;

  private _distinctFields: ReadonlyArray<string> = [];

  private _prefixes: Prefix[] = [];

  private _suffixes: Suffix[] = [];

  private _actions: ReadonlyArray<Action> = [];

  private _operator: RealmLogicOperator | undefined = undefined;

  private _resultLimit: undefined | number = undefined;

  constructor(realmResults: Realm.Results<T>) {
    this._realmResult = realmResults;
  }

  clone() {
    return Object.create(this) as this;
  }

  where(
    field: string,
    operator: RealmConditionalOperator,
    value: any,
  ) {
    return this.clone()._where(field, operator, value);
  }

  truepredicate() {
    return this.clone()._predicate('TRUEPREDICATE');
  }

  falsepredicate() {
    return this.clone()._predicate('FALSEPREDICATE');
  }

  equalTo(field: string, value: any, caseInsensitive?: boolean) {
    const operator = caseInsensitive ? '==[c]' : '==';

    return this.where(field, operator, value);
  }

  notEqualTo(field: string, value: any, caseInsensitive?: boolean) {
    const operator = caseInsensitive ? '!=[c]' : '!=';

    return this.where(field, operator, value);
  }

  like(field: string, value: string, caseInsensitive?: boolean) {
    const operator = caseInsensitive ? 'LIKE[c]' : 'LIKE';

    return this.where(field, operator, value);
  }

  contains(field: string, value: string, caseInsensitive?: boolean) {
    const operator = caseInsensitive ? 'CONTAINS[c]' : 'CONTAINS';

    return this.where(field, operator, value);
  }

  beginsWith(field: string, value: string, caseInsensitive?: boolean) {
    const operator = caseInsensitive ? 'BEGINSWITH[c]' : 'BEGINSWITH';

    return this.where(field, operator, value);
  }

  endsWith(field: string, value: string, caseInsensitive?: boolean) {
    const operator = caseInsensitive ? 'ENDSWITH[c]' : 'ENDSWITH';

    return this.where(field, operator, value);
  }

  greaterThan(field: string, value: RealmNumericValueType) {
    return this.where(field, '>', value);
  }

  greaterThanOrEqualTo(
    field: string,
    value: RealmNumericValueType,
  ) {
    return this.where(field, '>=', value);
  }

  lessThan(field: string, value: RealmNumericValueType) {
    return this.where(field, '<', value);
  }

  lessThanOrEqualTo(
    field: string,
    value: RealmNumericValueType,
  ) {
    return this.where(field, '<=', value);
  }

  between(field: string, start: RealmNumericValueType, end: RealmNumericValueType) {
    return this
      .clone()
      ._beginGroup()
      ._where(field, '>=', start)
      ._where(field, '<=', end)
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

  in(field: string, values: ReadonlyArray<any>) {
    const thisClone = this.clone();

    if (values.length === 0) {
    if (values.length === 0) return thisClone;
    }

    thisClone._beginGroup();
    values.forEach((value, index) => {
      if (index !== 0) thisClone._setOperator('OR');

      thisClone._where(field, '==', value);
    });
    thisClone._endGroup();

    return thisClone;
  }

  distinct(...fields: string[]) {
    return this.clone()._distinct(...fields);
  }

  sorted(field: string, order?: RealmQuerySort) {
    return this.clone()._sorted(field, order);
  }

  limit(limit: number) {
    return this.clone()._limit(limit);
  }

  fist(): T | undefined {
    return this.result()[0];
  }

  last(): T | undefined {
    const result = this.result();

    return result[result.length - 1];
  }

  findBy(field: string, value: any) {
    return this.clone()._where(field, '==', value).fist();
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

  private _merge(query: RealmQueryBuilder<T>) {
    const queryClone = query.clone();

    return this
      ._mergePrefixes(queryClone)
      ._mergeSuffixes(queryClone)
      ._mergeFilters(queryClone)
      ._mergeDistinctFields(queryClone);
  }

  /**
   * CAUTION: Needs to be executed before _mergeFilters
   * @param query
   * @returns
   */
  private _mergePrefixes(query: RealmQueryBuilder<T>) {
    const newPrefixSuffixes = query._prefixes.map(
      (group) => {
        const initAt = this._actions.length;
        return { ...group, at: group.at + initAt };
      },
    );

    this._prefixes = [...this._prefixes, ...newPrefixSuffixes];

    return this;
  }

  /**
   * CAUTION: Needs to be executed before _mergeFilters
   * @param query
   * @returns
   */
  private _mergeSuffixes(query: RealmQueryBuilder<T>) {
    const newPrefixSuffixes = query._suffixes.map(
      (group) => {
        const initAt = this._actions.length;
        return { ...group, at: group.at + initAt };
      },
    );

    this._suffixes = [...this._suffixes, ...newPrefixSuffixes];

    return this;
  }

  private _mergeFilters(query: RealmQueryBuilder<T>) {
    if (query._actions.length) {
      query._actions[0].logicalOperator = this._operator || DEFAULT_OPERATOR;
      this._actions = [...this._actions, ...query._actions];
    }

    return this;
  }

  private _mergeDistinctFields(query: RealmQueryBuilder<T>) {
    this._distinctFields = [...this._distinctFields, ...query._distinctFields];

    return this;
  }

  private _limit(limit: number) {
    this._resultLimit = limit;

    return this;
  }

  private _sorted(field: string, order?: RealmQuerySort) {
    const isDescending = order === 'desc';

    this._realmResult = this._realmResult.sorted(field, isDescending);

    return this;
  }

  private _getQueryFilter() {
    if (this._actions.length === 0) {
      return 'TRUEPREDICATE';
    }

    const getPrefix = (index: number) => this._prefixes.reduce((acc, prefix) => {
      if (prefix.at !== index) return acc;

      return `${acc} ${prefix.value} `;
    }, '');

    const getSuffix = (index: number) => this._suffixes.reduce((acc, suffix) => {
      if (suffix.at !== index) return acc;

      return `${acc} ${suffix.value} `;
    }, '');

    return this._actions.reduce((query, criteria, index) => {
      const predicate = index === 0 ? undefined : criteria.logicalOperator;

      if (predicate) query += ` ${predicate} `;

      query += getPrefix(index);

      if (criteria.type === 'filter') {
        query += `${criteria.field} ${criteria.condition} $${index}`;
      } else if (criteria.type === 'predicate') {
        query += `${criteria.predicate}`;
      }

      query += getSuffix(index);

      return query;
    }, '');
  }

  private _getQuerySuffix() {
    let suffix = '';

    if (this._distinctFields.length) {
      suffix += ` DISTINCT(${this._distinctFields.join(',')})`;
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
    this._operator = undefined;

    return this;
  }

  private _setOperator(operator: RealmLogicOperator) {
    this._operator = operator;

    return this;
  }

  private _distinct(...fields: string[]) {
    this._distinctFields = [...fields];

    return this;
  }

  private _where(
    field: string,
    condition: RealmConditionalOperator,
    value: any,
  ) {
    this._actions = [
      ...this._actions,
      {
        type: 'filter',
        field,
        condition,
        value,
        logicalOperator: this._operator || DEFAULT_OPERATOR,
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
        logicalOperator: this._operator || DEFAULT_OPERATOR,
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
