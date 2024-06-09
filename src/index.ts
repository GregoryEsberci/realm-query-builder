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

  /**
   * Creates a shallow clone of the current RealmQueryBuilder instance.
   *
   * @returns {this} - A new RealmQueryBuilder instance.
   */
  clone() {
    return Object.create(this) as this;
  }

  /**
   * Concatenate the `query`, like realm `Collection.filtered`.
   *
   * @param {string} query.
   * @param  {any[]} ...values
   * @returns {this} - The modified RealmQueryBuilder instance.
   */
  filtered(query: string, ...values: any[]) {
    return this.clone()._filtered(query, ...values);
  }

  /**
   * Adds a filter to the query with the specified property, operator and value.
   *
   * @param {string} property - The property to filter.
   * @param {RealmConditionalOperator} operator - The conditional operator.
   * @param {any} value - The value to compare.
   * @returns {this} - The modified RealmQueryBuilder instance.
   */
  where(
    property: string,
    operator: RealmConditionalOperator,
    value: any,
  ) {
    return this.clone()._where(property, operator, value);
  }

  /**
   * Adds a predicate that always evaluates to `true`.
   *
   * @returns {this} - The modified RealmQueryBuilder instance.
   */
  truepredicate() {
    return this.clone()._predicate('TRUEPREDICATE');
  }

  /**
   * Adds a predicate that always evaluates to `false`.
   *
   * @returns {this} - The modified RealmQueryBuilder instance.
   */
  falsepredicate() {
    return this.clone()._predicate('FALSEPREDICATE');
  }

  /**
   * Filter the data by property that match a specified value.
   *
   * @param {string} property - The property to filter on.
   * @param {any} value - The value to compare with.
   * @param {boolean} [caseInsensitive] - Indicates if the comparison should be case-insensitive.
   * @returns {this} - Returns the QueryBuilder instance for method chaining.
   */
  equalTo(property: string, value: any, caseInsensitive?: boolean) {
    const operator = caseInsensitive ? '==[c]' : '==';

    return this.where(property, operator, value);
  }

  /**
   * Filter the data by property that doesn't match a specified value.
   *
   * @param {string} property - The property to filter on.
   * @param {any} value - The value to compare with.
   * @param {boolean} [caseInsensitive] - Indicates if the comparison should be case-insensitive.
   * @returns {this} - Returns the QueryBuilder instance for method chaining.
   */
  notEqualTo(property: string, value: any, caseInsensitive?: boolean) {
    const operator = caseInsensitive ? '!=[c]' : '!=';

    return this.where(property, operator, value);
  }

  /**
   * Filter the data they matches property value wildcard string expression.
   * A wildcard string expression is a string that uses normal characters with two special wildcard characters:
   *
   * - The * wildcard matches zero or more of any character.
   * - The ? wildcard matches any character.
   *
   * For example, the wildcard string `d?g` matches `dog`, `dig`, and `dug`, but not `ding`, `dg`, or `a dog`.
   *
   * @param {string} property - The property to filter on.
   * @param {string} value - The value to match against.
   * @param {boolean} [caseInsensitive] - Indicates if the comparison should be case-insensitive.
   * @returns {this} - Returns the QueryBuilder instance for method chaining.
   */
  like(property: string, value: string, caseInsensitive?: boolean) {
    const operator = caseInsensitive ? 'LIKE[c]' : 'LIKE';

    return this.where(property, operator, value);
  }

  /**
   * Filter the data they value string expression is found anywhere in property value.
   *
   * @param {string} property - The property to filter on.
   * @param {string} value - The value to match against.
   * @param {boolean} [caseInsensitive] - Indicates if the comparison should be case-insensitive.
   * @returns {this} - Returns the QueryBuilder instance for method chaining.
   */
  contains(property: string, value: string, caseInsensitive?: boolean) {
    const operator = caseInsensitive ? 'CONTAINS[c]' : 'CONTAINS';

    return this.where(property, operator, value);
  }

  /**
   * Filter the data they property value value begins with string expression.
   * This is similar to contains, but only matches if the param value is found at the beginning of property value.
   *
   * @param {string} property - The property to filter on.
   * @param {string} value - The value to match against.
   * @param {boolean} [caseInsensitive] - Indicates if the comparison should be case-insensitive.
   * @returns {this} - Returns the QueryBuilder instance for method chaining.
   */
  beginsWith(property: string, value: string, caseInsensitive?: boolean) {
    const operator = caseInsensitive ? 'BEGINSWITH[c]' : 'BEGINSWITH';

    return this.where(property, operator, value);
  }

  /**
   * Filter the data they property value value ends with string expression.
   * This is similar to contains, but only matches if the param value is found at the very end of property value.
   *
   * @param {string} property - The property to filter on.
   * @param {string} value - The value to match against.
   * @param {boolean} [caseInsensitive] - Indicates if the comparison should be case-insensitive.
   * @returns {this} - Returns the QueryBuilder instance for method chaining.
   */
  endsWith(property: string, value: string, caseInsensitive?: boolean) {
    const operator = caseInsensitive ? 'ENDSWITH[c]' : 'ENDSWITH';

    return this.where(property, operator, value);
  }

  /**
   * Filter the data they param value (numerical or date expression) is greater than the property value.
   * For dates will select the document if the param value date is later than as the property value date.
   *
   * @param {string} property - The property to filter on.
   * @param {string} value - The value to match against.
   * @param {boolean} [caseInsensitive] - Indicates if the comparison should be case-insensitive.
   * @returns {this} - Returns the QueryBuilder instance for method chaining.
   */
  greaterThan(property: string, value: RealmNumericValueType) {
    return this.where(property, '>', value);
  }

  /**
   * Filter the data they param value (numerical or date expression) is greater or equal than the property value.
   * For dates will select the document if the param value date is later than or the same as the property value date.
   *
   * @param {string} property - The property to filter on.
   * @param {string} value - The value to match against.
   * @param {boolean} [caseInsensitive] - Indicates if the comparison should be case-insensitive.
   * @returns {this} - Returns the QueryBuilder instance for method chaining.
   */
  greaterThanOrEqualTo(
    property: string,
    value: RealmNumericValueType,
  ) {
    return this.where(property, '>=', value);
  }

  /**
   * Filter the data they param value (numerical or date expression) is less than the property value.
   * For dates will select the document if the param value date is earlier than the property value date.
   *
   * @param {string} property - The property to filter on.
   * @param {string} value - The value to match against.
   * @param {boolean} [caseInsensitive] - Indicates if the comparison should be case-insensitive.
   * @returns {this} - Returns the QueryBuilder instance for method chaining.
   */
  lessThan(property: string, value: RealmNumericValueType) {
    return this.where(property, '<', value);
  }

  /**
   * Filter the data they param value (numerical or date expression) is less or equal than the property value.
   * For dates will select the document if the param value date is earlier than or the same as the property value date.
   *
   * @param {string} property - The property to filter on.
   * @param {string} value - The value to match against.
   * @param {boolean} [caseInsensitive] - Indicates if the comparison should be case-insensitive.
   * @returns {this} - Returns the QueryBuilder instance for method chaining.
   */
  lessThanOrEqualTo(
    property: string,
    value: RealmNumericValueType,
  ) {
    return this.where(property, '<=', value);
  }

  /**
   * Adds a range filter to the data, restricting the property's value to be within the specified range.
   *
   * @param {string} property - The property to filter.
   * @param {RealmNumericValueType} start - The start of the range (inclusive).
   * @param {RealmNumericValueType} end - The end of the range (inclusive).
   * @returns {this} - Returns the QueryBuilder instance for method chaining.
   */
  between(property: string, start: RealmNumericValueType, end: RealmNumericValueType) {
    return this
      .clone()
      ._beginGroup()
      ._where(property, '>=', start)
      ._where(property, '<=', end)
      ._endGroup();
  }

  /**
   * Join previous and next conditions with the `OR` operator.
   *
   * @returns {this} - Returns the QueryBuilder instance for method chaining.
   */
  or() {
    return this.clone()._setOperator('OR');
  }

  /**
   * Join previous and next conditions with the `AND` operator, the default operator is `AND`.
   *
   * @returns {this} - Returns the QueryBuilder instance for method chaining.
   */
  and() {
    return this.clone()._setOperator('AND');
  }

  /**
   * Begins a group for combining filter conditions in the query. Use with {@link RealmQueryBuilder#endGroup} to close the group.
   *
   * @returns {this} - Returns the QueryBuilder instance for method chaining.
   * @see {@link RealmQueryBuilder#endGroup}
   */
  beginGroup() {
    return this.clone()._beginGroup();
  }

  /**
   * Ends a group for combining filter conditions in the query. Should be used after starting a group with {@link RealmQueryBuilder#beginGroup}.
   *
   * @returns {this} - Returns the QueryBuilder instance for method chaining.
   * @see {@link RealmQueryBuilder#beginGroup}
   */
  endGroup() {
    return this.clone()._endGroup();
  }

  /**
   * Adds a "NOT" prefix to the query, negating the next filter condition or group.
   *
   * @returns {this} - Returns the QueryBuilder instance for method chaining.
   */
  not() {
    return this.clone()._not();
  }

  /**
   * Adds an `IN` filter condition to the query, filtering objects where the specified property's value matches any of the values in the provided array.
   * Realm.js started supporting `IN` in version 10.20.0, it is applied with `OR` chains for more compatibility.
   *
   * @param {string} property - The property to filter.
   * @param {ReadonlyArray<any>} values - An array of values to match against the property.
   * @returns {this} - Returns the QueryBuilder instance for method chaining.
   */
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

  /**
   * Specify a name of the property to compare. Remove duplicates for that property in the results.
   * If you specify multiple properties, the query removes duplicates by the first field, and then the second.
   * For example, if you `distinct('name', 'assignee')`, the query only removes duplicates where the values of both properties are the same.
   *
   * @param {...string} properties - The properties to include for uniqueness.
   * @returns {this} - Returns the QueryBuilder instance for method chaining.
   */
  distinct(...properties: string[]) {
    return this.clone()._distinct(...properties);
  }

  /**
   * Specify the name of the property to compare, and whether to sort by ascending (asc) or descending (desc) order.
   * With multiple `sorted`, the query sorts by the first, and then the second.
   *
   * For example, the query returns sorted by priority, and then by name when priority value is the same.
   * ```js
   * query.sorted('priority').sorted('name')
   * ```
   *
   * @param {string} property - The property to use for sorting.
   * @param {RealmQuerySort} [order='asc'] - The sorting order, which can be 'asc' (ascending) or 'desc' (descending). Defaults to 'asc'.
   * @returns {this} - Returns the QueryBuilder instance for method chaining.
   */
  sorted(property: string, order?: RealmQuerySort) {
    return this.clone()._sorted(property, order);
  }

  /**
   * Limit the results to the specified number.
   *
   * @param {number} limit - The maximum number of results to return.
   * @returns {this} - Returns the QueryBuilder instance for method chaining.
   */
  limit(limit: number) {
    return this.clone()._limit(limit);
  }

  /**
   * Executes the query and returns the first matching object or undefined.
   *
   * @returns {T | undefined} - The first matching object or undefined if results are empty.
   */
  first(): T | undefined {
    return this.result()[0];
  }

  /**
   * Executes the query and returns the last matching object or undefined if results are empty.
   *
   * @returns {T | undefined} - The last matching object or undefined.
   */
  last(): T | undefined {
    const result = this.result();

    return result[result.length - 1];
  }

  /**
   * Apply the `equalTo(property, value)` condition and return the first value or undefined if don`t find anything.
   *
   * @param {string} property - The property to search.
   * @param {any} value - The value to match.
   * @returns {T | undefined} - The matching object or undefined.
   */
  findBy(property: string, value: any) {
    return this.clone()._where(property, '==', value).first();
  }

  /**
   * Gets the number of objects that match the query.
   *
   * @returns {number} - The number of matching objects.
   */
  size() {
    return this.result().length;
  }

  /**
   * Evaluates to the lowest value of a given numerical property across a collection. null values are ignored.
   *
   * @param {string} [property] - The property for which to calculate the lowest value.
   * @returns {Result | null} - The lowest value of the specified property or null if no values are found.
   */
  min<Result extends RealmNumericValueType>(property?: string) {
    return this.result().min(property) as Result | null;
  }

  /**
   * Evaluates to the highest value of a given numerical property across a collection. null values are ignored.
   *
   * @param {string} [property] - The property for which to calculate the maximum value.
   * @returns {Result | null} - The maximum value of the specified property or null if no values are found.
   */
  max<Result extends RealmNumericValueType>(property?: string) {
    return this.result().max(property) as Result | null;
  }

  /**
   * Evaluates to the sum of a given numerical property across a collection, excluding null values.
   *
   * @param {string} [property] - The property for which to calculate the sum.
   * @returns {number} - The sum of values in the specified property.
   */
  sum(property?: string) {
    return this.result().sum(property);
  }

  /**
   * Evaluates to the average value of a given numerical property across a collection. If any values are null, they are not counted in the result.
   *
   * @param {string} [property] - The property for which to calculate the average.
   * @returns {number} - The average value of the specified property.
   */
  avg(property?: string) {
    return this.result().avg(property);
  }

  /**
   * Merges the current query with another RealmQueryBuilder instance.
   *
   * The operators sorted and limit are not merged.
   *
   * @param {RealmQueryBuilder<T>} query - The query to merge.
   * @returns {this} - The modified RealmQueryBuilder instance.
   */
  merge(query: RealmQueryBuilder<T>) {
    return this.clone()._merge(query);
  }

  /**
   * Executes the query and returns the filtered results.
   *
   * @returns {Realm.Results<T>} - The filtered results.
   */
  result() {
    const query = this._getQuery();
    const values = this._getQueryValues();

    try {
      return this._realmResult.filtered(query, ...values);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'unknown';

      throw new Error(
        `RealmQueryBuilder: Fail to get result, error: ${errorMessage};\nquery: "${query}";\nvalues: "${JSON.stringify(values)}"`,
      );
    }
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
    return this._actions.flatMap((action) => action.values);
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
    this._distinctProperties = [...this._distinctProperties, ...properties];

    return this;
  }

  private _filtered(query: string, ...values: any[]) {
    this._actions = [
      ...this._actions,
      {
        type: 'filtered',
        query,
        values,
        logicalOperator: this._operator,
      },
    ];

    this._resetOperator();

    return this;
  }

  private _where(
    property: string,
    condition: RealmConditionalOperator,
    value: any,
  ) {
    return this._filtered(`${property} ${condition} $0`, value);
  }

  private _predicate(predicate: Predicate) {
    return this._filtered(predicate);
  }
}

const realmQueryBuilder = <T>(realmResults: Realm.Results<T>) => (
  new RealmQueryBuilder<T>(realmResults)
);

export default realmQueryBuilder;
