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

type Filter = {
  value: any,
  field: string,
  condition: RealmConditionalOperator,
  logicalOperator: RealmLogicOperator,
}

type Group = {
  start: number,
  end: number,
}

const DEFAULT_OPERATOR: RealmLogicOperator = 'AND';
const INITIAL_GROUP_END = -1;

export class RealmQueryBuilder<T = any> {
  private realmResult: Realm.Results<T>;

  private distinctFields: ReadonlyArray<string> = [];

  private groups: ReadonlyArray<Readonly<Group>> = [];

  private filters: ReadonlyArray<Filter> = [];

  private operator: RealmLogicOperator | undefined = undefined;

  private resultLimit: undefined | number = undefined;

  constructor(realmResults: Realm.Results<T>) {
    this.realmResult = realmResults;
  }

  static create<R>(realmResults: Realm.Results<R>) {
    return new RealmQueryBuilder(realmResults);
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

  in(field: string, values: ReadonlyArray<any>) {
    const thisClone = this.clone();

    if (values.length === 0) return thisClone;

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

  findBy(field: string, value: any) {
    const data = this.clone()
      ._where(field, '==', value)
      ._limit(1)
      .result();

    return data.length === 0 ? undefined : data[0];
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

    return this.realmResult.filtered(query, ...values);
  }

  private _merge(query: RealmQueryBuilder<T>) {
    const queryClone = query.clone();

    return this
      ._mergeGroups(queryClone)
      ._mergeFilters(queryClone)
      ._mergeDistinctFields(queryClone);
  }

  /**
   * CAUTION: Needs to be executed before _mergeFilters
   * @param query
   * @returns
   */
  private _mergeGroups(query: RealmQueryBuilder<T>) {
    const newGroups = query.groups.map(
      (group) => {
        const initAt = this.filters.length;

        const start = group.start + initAt;
        const end = group.end + initAt;

        return ({ start, end });
      },
    );

    this.groups = [...this.groups, ...newGroups];

    return this;
  }

  private _mergeFilters(query: RealmQueryBuilder<T>) {
    if (query.filters.length) {
      query.filters[0].logicalOperator = this.operator || DEFAULT_OPERATOR;
      this.filters = [...this.filters, ...query.filters];
    }

    return this;
  }

  private _mergeDistinctFields(query: RealmQueryBuilder<T>) {
    this.distinctFields = [...this.distinctFields, ...query.distinctFields];

    return this;
  }

  private _limit(limit: number) {
    this.resultLimit = limit;

    return this;
  }

  private _sorted(field: string, order?: RealmQuerySort) {
    const isDescending = order === 'desc';

    this.realmResult = this.realmResult.sorted(field, isDescending);

    return this;
  }

  private _getQueryFilter() {
    if (this.filters.length === 0) {
      return 'TRUEPREDICATE';
    }

    return this.filters.reduce((query, criteria, index) => {
      const predicate = index === 0 ? undefined : criteria.logicalOperator;
      const beginGroups = this.groups.filter((group) => group.start === index);
      const endGroups = this.groups.filter((group) => group.end === index);

      if (predicate) query += ` ${predicate} `;

      query += '('.repeat(beginGroups.length);
      query += `${criteria.field} ${criteria.condition} $${index}`;
      query += ')'.repeat(endGroups.length);

      return query;
    }, '');
  }

  private _getQuerySuffix() {
    let suffix = '';

    if (this.distinctFields.length) {
      suffix += ` DISTINCT(${this.distinctFields.join(',')})`;
    }

    if (typeof this.resultLimit === 'number') {
      suffix += ` LIMIT(${this.resultLimit})`;
    }

    return suffix;
  }

  private _getQuery() {
    let query = this._getQueryFilter();

    query += this._getQuerySuffix();

    return query;
  }

  private _getQueryValues() {
    return this.filters.map(({ value }) => value);
  }

  private _beginGroup() {
    this.groups = [
      ...this.groups,
      {
        start: this.filters.length,
        end: INITIAL_GROUP_END,
      },
    ];

    return this;
  }

  private _endGroup() {
    const currentGroupIndex = this.groups
      .map((group) => group.end)
      .lastIndexOf(INITIAL_GROUP_END);

    if (currentGroupIndex === -1) {
      throw new Error('Group not started');
    }

    if (this.filters.length === 0) {
      throw new Error('Invalid group, no filter found');
    }

    const groupsClone = [...this.groups];
    const end = this.filters.length - 1;

    groupsClone[currentGroupIndex] = {
      ...groupsClone[currentGroupIndex],
      end,
    };

    this.groups = groupsClone;

    return this;
  }

  private _resetOperator() {
    this.operator = undefined;

    return this;
  }

  private _setOperator(operator: RealmLogicOperator) {
    this.operator = operator;

    return this;
  }

  private _distinct(...fields: string[]) {
    this.distinctFields = [...fields];

    return this;
  }

  private _where(
    field: string,
    condition: RealmConditionalOperator,
    value: any,
  ) {
    this.filters = [
      ...this.filters,
      {
        field,
        condition,
        value,
        logicalOperator: this.operator || DEFAULT_OPERATOR,
      },
    ];

    this._resetOperator();

    return this;
  }
}

const realmQueryBuilder = RealmQueryBuilder.create;

export default realmQueryBuilder;
