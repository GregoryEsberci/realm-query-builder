# realm-query-builder

Is a powerful query builder for Realm.js, designed to simplify and enhance the querying experience for your Realm databases.

**Immutable:** All API operations that change the realm-query-builder object will return a new instance instead.

## Installation

```sh
npm install --save realm-query-builder
# or
yarn add realm-query-builder
```

## Useful Links

Some useful links for understanding and working with Realm queries:

- [Realm Query Language](https://www.mongodb.com/docs/realm/realm-query-language/) (Comprehensive)
- [Realm Query Language API](https://www.mongodb.com/docs/realm-sdks/js/latest/tutorial-query-language.html) (API-specific)

These resources provide in-depth information on Realm query language and its usage, helping you make the most out of `realm-query-builder`.

## Example

### Using realmQueryBuilder directly

```ts
import realmQueryBuilder from 'realm-query-builder';

const users = realmQueryBuilder(realm.objects('User'))
  .equalTo('active', true)
  .greaterThanOrEqualTo('age', 18)
  .in('country', ['BR', 'AR', 'US'])
  .distinct('name')
  .result();

console.log(users);
```

### Extending

```ts
import { RealmQueryBuilder } from 'realm-query-builder';

type User = {
  age: number,
  active: boolean,
}

class UserQuery extends RealmQueryBuilder<User & Realm.Object> {
  active() {
    return this.equalTo('active', true);
  }

  byAge(age: number) {
    return this.equalTo('age', age);
  }
}

const userQuery = () => new UserQuery(realm.objects<User>('User'));

const users = userQuery()
  .active()
  .byAge(18)
  .distinct('country')
  .result();

console.log(users);
```

## API

### `where(field: string, condition: RealmConditionalOperator, value: any): this`

Adds a filter to the query with the specified property, operator and value.

### `equalTo(field: string, value: any, caseInsensitive?: boolean): this`

Filter the data by property that match a specified value.

### `notEqualTo(field: string, value: any, caseInsensitive?: boolean): this`

Evaluates to true expression matches property value wildcard string expression. A wildcard string expression is a string that uses normal characters with two special wildcard characters:

- The * wildcard matches zero or more of any character.
- The ? wildcard matches any character.

For example, the wildcard string `d?g` matches `dog`, `dig`, and `dug`, but not `ding`, `dg`, or `a dog`.

### `like(field: string, value: string, caseInsensitive?: boolean): this`

An alias for [`where(field, 'LIKE' | 'LIKE[c]', value)`](#wherefield-string-condition-realmconditionaloperator-value-any-this). If `caseInsensitive: true`, the operator applied will be `LIKE[c]`.

### `contains(field: string, value: string, caseInsensitive?: boolean): this`

An alias for [`where(field, 'CONTAINS' | 'CONTAINS[c]', value)`](#wherefield-string-condition-realmconditionaloperator-value-any-this). If `caseInsensitive: true`, the operator applied will be `CONTAINS[c]`.

### `beginsWith(field: string, value: string, caseInsensitive?: boolean): this`

An alias for [`where(field, 'BEGINSWITH' | BEGINSWITH[c], value)`](#wherefield-string-condition-realmconditionaloperator-value-any-this). If `caseInsensitive`, `true` the operator applied will be `BEGINSWITH[c]`.

### `endsWith(field: string, value: string, caseInsensitive?: boolean): this`

An alias for [`where(field, 'ENDSWITH' | ENDSWITH[c], value)`](#wherefield-string-condition-realmconditionaloperator-value-any-this). If `caseInsensitive: true`, the operator applied will be `ENDSWITH[c]`.

### `greaterThan(field: string, value: RealmNumericValueType): this`

An alias for [`where(field, '>', value)`](#wherefield-string-condition-realmconditionaloperator-value-any-this).

### `greaterThanOrEqualTo(field: string, value: RealmNumericValueType): this`

An alias for [`where(field, '>=', value)`](#wherefield-string-condition-realmconditionaloperator-value-any-this).

### `lessThan(field: string, value: RealmNumericValueType): this`

An alias for [`where(field, '<', value)`](#wherefield-string-condition-realmconditionaloperator-value-any-this).

### `lessThanOrEqualTo(field: string, value: RealmNumericValueType): this`

An alias for [`where(field, '<=', value)`](#wherefield-string-condition-realmconditionaloperator-value-any-this).

### `between(field: string, start: RealmNumericValueType, end: RealmNumericValueType): this`

A between condition, same as:

```ts
realmQueryBuilder(object)
  .beginGroup()
    .where(field, '>=', start)
    .where(field, '<=', end)
  .endGroup();
```

### `or(): this`

Join previous and next conditions with the `OR` operator.

### `and(): this`

Join previous and next conditions with the `AND` operator, the default operator is `AND`.

### `beginGroup(): this`

Begins a group for combining filter conditions in the query. Use with [endGroup()](#endgroup-this) to close the group.

### `endGroup(): this`

Ends a group for combining filter conditions in the query. Should be used after starting a group with [beginGroup()](#begingroup-this).

Example:

```ts
realmQueryBuilder(realm.objects('User'))
  .equalTo('active', true)
  .beginGroup()
    .equalTo('canWrite', true)
    .or()
    .equalTo('admin', true)
  .endGroup()
  .result();
```

### `in(field: string, values: ReadonlyArray<any>): this`

Adds an `IN` filter condition to the query, filtering objects where the specified property's value matches any of the values in the provided array.
Realm.js started supporting `IN` in [version 10.20.0](https://github.com/realm/realm-js/issues/2781#issuecomment-1223641109), it is applied with `OR` chains for more compatibility.

### `not(): this`

Implements [not operator](https://www.mongodb.com/docs/realm/realm-query-language/#logical-operators) for the next operation or group.

### `distinct(...fields: string[]): this`

Add `DISTINCT` suffix, see: [Realm Query Language](https://www.mongodb.com/docs/realm/realm-query-language/#sort--distinct---limit)

### `sorted(field: string, order?: RealmQuerySort): this`

Call the `sorted` method, see: [sorted](https://www.mongodb.com/docs/realm-sdks/js/latest/Realm.Collection.html#sorted)

### `limit(limit: number): this`

Add `LIMIT` suffix, see: [Realm Query Language](https://www.mongodb.com/docs/realm/realm-query-language/#sort--distinct---limit)

### `clone(): this`

Create a clone of the current object.

#### `truepredicate(): this`

A predicate that always evaluates to TRUE.

#### `falsepredicate(): this`

A predicate that always evaluates to FALSE.

### `merge(query: RealmQueryBuilder<T>)): this`

Merges the current query with another RealmQueryBuilder instance.

The operators sorted and limit are not merged.

Example:

```ts
const queryA =  realmQueryBuilder(realm.objects('User'))
  .equalTo('active', true)
  .equalTo('admin', false)
  .limit(10);

const queryB =  realmQueryBuilder(realm.objects('User'))
  .greaterThanOrEqualTo('age', 18)
  .limit(20)
  .or()
  .beginGroup()
    .merge(queryA)
  .endGroup()
  .result();
```

### `min<V extends RealmNumericValueType>(property?: string): V | null`

Call [realm.js min](https://www.mongodb.com/docs/realm-sdks/js/latest/Realm.Set.html#min)

### `max<V extends RealmNumericValueType>(property?: string): V | null`

Call [realm.js max](https://www.mongodb.com/docs/realm-sdks/js/latest/Realm.Set.html#max)

### `sum(property?: string): number | null`

Call [realm.js sum](https://www.mongodb.com/docs/realm-sdks/js/latest/Realm.Set.html#sum)

### `avg(property?: string): number`

Call [realm.js avg](https://www.mongodb.com/docs/realm-sdks/js/latest/Realm.Set.html#avg)

### `first(): T | undefined`

Get the first result.

### `last(): T | undefined`

Get the last result.

### `findBy(field: string, value: any): T | undefined`

Apply the [`where(field, '==', value)`](#wherefield-string-condition-realmconditionaloperator-value-any-this) condition and return the first value.

### `size(): number`

Query the data and get the result's size, alias to [result().length](#result-realmresultst)

### `result(): Realm.Results<T>`

Executes the query and returns the filtered results
