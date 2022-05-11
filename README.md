# realm-query-builder
A realm query builder to realm.js.

Immutable:
All API operations that change the realm-query-builder object will return a new instance instead.

## Installation
```
npm install --save realm-query-builder
or
yarn add realm-query-builder
```


## Exemple

### Using realmQueryBuilder directly
```ts
import realmQueryBuilder from 'realm-query-builder';

realmQueryBuilder(realm.objects('User'))
  .equalTo('active', true)
  .greaterThanOrEqualTo('age', 18)
  .in('country', ['BR', 'AR', 'US'])
  .distinct('name')
  .result();
```
The same as:
```ts
realm.objects('User').filtered('active == $0 AND age >= $1 AND (country == $2 OR country == $3 OR country == $4) DISTINCT(name)', true, 18, 'BR', 'AR', 'US')
```

-------

### Extending

```ts
import { RealmQueryBuilder } from 'realm-query-builder';

class UserQuery extends RealmQueryBuilder {
  active() {
    return this.equalTo('active', true);
  }

  byAge(age: number) {
    return this.equalTo('age', age);
  }
}

const userQuery = () =>  new UserQuery(realm.objects('User'));

userQuery()
  .active()
  .byAge(18)
  .distinct('country')
  .result();
```

The same as:
```ts
realm.objects('User').filtered('active == $0 AND age == $1 DISTINCT(country)', true, 18);
```




## API

* [`clone(): RealmQueryBuilder`](#clone-realmquerybuilder)

* [`where(field: string, condition: RealmConditionalOperator, value: any): RealmQueryBuilder`](#wherefield-string-condition-realmconditionaloperator-value-any-realmquerybuilder)

* [`equalTo(field: string, value: any, caseInsensitive?: boolean): RealmQueryBuilder`](#equaltofield-string-value-any-caseinsensitive-boolean-realmquerybuilder)

* [`notEqualTo(field: string, value: any, caseInsensitive?: boolean): RealmQueryBuilder`](#notequaltofield-string-value-any-caseinsensitive-boolean-realmquerybuilder)

* [`like(field: string, value: string, caseInsensitive?: boolean): RealmQueryBuilder`](#likefield-string-value-string-caseinsensitive-boolean-realmquerybuilder)

* [`contains(field: string, value: string, caseInsensitive?: boolean): RealmQueryBuilder`](#containsfield-string-value-string-caseinsensitive-boolean-realmquerybuilder)

* [`beginsWith(field: string, value: string, caseInsensitive?: boolean): RealmQueryBuilder`](#beginswithfield-string-value-string-caseinsensitive-boolean-realmquerybuilder)

* [`endsWith(field: string, value: string, caseInsensitive?: boolean): RealmQueryBuilder`](#endswithfield-string-value-string-caseinsensitive-boolean-realmquerybuilder)

* [`greaterThan(field: string, value: RealmNumericValueType): RealmQueryBuilder`](#greaterthanfield-string-value-realmnumericvaluetype-realmquerybuilder)

* [`greaterThanOrEqualTo(field: string, value: RealmNumericValueType): RealmQueryBuilder`](#greaterthanorequaltofield-string-value-realmnumericvaluetype-realmquerybuilder)

* [`lessThan(field: string, value: RealmNumericValueType): RealmQueryBuilder`](#lessthanfield-string-value-realmnumericvaluetype-realmquerybuilder)

* [`lessThanOrEqualTo(field: string, value: RealmNumericValueType): RealmQueryBuilder`](#lessthanorequaltofield-string-value-realmnumericvaluetype-realmquerybuilder)

* [`between(field: string, start: RealmNumericValueType, end: RealmNumericValueType): RealmQueryBuilder`](#betweenfield-string-start-realmnumericvaluetype-end-realmnumericvaluetype-realmquerybuilder)

* [`or(): RealmQueryBuilder`](#or-realmquerybuilder)

* [`and(): RealmQueryBuilder`](#and-realmquerybuilder)

* [`beginGroup(): RealmQueryBuilder`](#begingroup-realmquerybuilder)

* [`endGroup(): RealmQueryBuilder`](#endgroup-realmquerybuilder)

* [`in(field: string, values: ReadonlyArray): RealmQueryBuilder`](#infield-string-values-readonlyarray-realmquerybuilder)

* [`distinct(...fields: string[]): RealmQueryBuilder`](#distinctfields-string-realmquerybuilder)

* [`sorted(field: string, order?: RealmQuerySort): RealmQueryBuilder`](#sortedfield-string-order-realmquerysort-realmquerybuilder)

* [`limit(limit: number): RealmQueryBuilder`](#limitlimit-number-realmquerybuilder)

* [`findBy(field: string, value: any): T | undefined`](#findbyfield-string-value-any-t--undefined)

* [`size(): number`](#size-number)

* [`min(property?: string): V | null`](#minproperty-string-v--null)

* [`max(property?: string): V | null`](#maxproperty-string-v--null)

* [`sum(property?: string): number | null`](#sumproperty-string-number--null)

* [`avg(property?: string): number`](#avgproperty-string-number)

* [`merge(query: RealmQueryBuilder): RealmQueryBuilder`](#mergequery-realmquerybuilder-realmquerybuilder)

* [`result(): Realm.Results`](#result-realmresults)


### `clone(): RealmQueryBuilder<T>`
Create a clone of the current object

### `where(field: string, condition: RealmConditionalOperator, value: any): RealmQueryBuilder<T>`
Add condition

### `equalTo(field: string, value: any, caseInsensitive?: boolean): RealmQueryBuilder<T>`
Alias to [`where(field, '==', value)`](#wherefield-string-condition-realmconditionaloperator-value-any-realmquerybuildert), if `caseInsensitive: true` the operador applied will be `==[c]`

### `notEqualTo(field: string, value: any, caseInsensitive?: boolean): RealmQueryBuilder<T>`
Alias to [`where(field, '!=', value)`](#wherefield-string-condition-realmconditionaloperator-value-any-realmquerybuildert), if `caseInsensitive: true` the operador applied will be `!=[c]`

### `like(field: string, value: string, caseInsensitive?: boolean): RealmQueryBuilder<T>`
Alias to [`where(field, 'LIKE', value)`](#wherefield-string-condition-realmconditionaloperator-value-any-realmquerybuildert), if `caseInsensitive: true` the operador applied will be `LIKE[c]`

### `contains(field: string, value: string, caseInsensitive?: boolean): RealmQueryBuilder<T>`
Alias to [`where(field, 'CONTAINS', value)`](#wherefield-string-condition-realmconditionaloperator-value-any-realmquerybuildert), if `caseInsensitive: true` the operador applied will be `CONTAINS[c]`

### `beginsWith(field: string, value: string, caseInsensitive?: boolean): RealmQueryBuilder<T>`
Alias to [`where(field, 'BEGINSWITH', value)`](#wherefield-string-condition-realmconditionaloperator-value-any-realmquerybuildert), if `caseInsensitive` `true` the operador applied will be `BEGINSWITH[c]`
  

### `endsWith(field: string, value: string, caseInsensitive?: boolean): RealmQueryBuilder<T>`
Alias to [`where(field, 'ENDSWITH', value)`](#wherefield-string-condition-realmconditionaloperator-value-any-realmquerybuildert), if `caseInsensitive: true` the operador applied will be `ENDSWITH[c]`

### `greaterThan(field: string, value: RealmNumericValueType): RealmQueryBuilder<T>`
Alias to [`where(field, '>', value)`](#wherefield-string-condition-realmconditionaloperator-value-any-realmquerybuildert)

### `greaterThanOrEqualTo(field: string, value: RealmNumericValueType): RealmQueryBuilder<T>`
Alias to [`where(field, '>=', value)`](#wherefield-string-condition-realmconditionaloperator-value-any-realmquerybuildert)

### `lessThan(field: string, value: RealmNumericValueType): RealmQueryBuilder<T>`
Alias to [`where(field, '<', value)`](#wherefield-string-condition-realmconditionaloperator-value-any-realmquerybuildert)

### `lessThanOrEqualTo(field: string, value: RealmNumericValueType): RealmQueryBuilder<T>`
Alias to [`where(field, '<=', value)`](#wherefield-string-condition-realmconditionaloperator-value-any-realmquerybuildert)

### `between(field: string, start: RealmNumericValueType, end: RealmNumericValueType): RealmQueryBuilder<T>`
Between condition, same as:
```ts
realmQueryBuilder(object)
  .beginGroup()
    .where(field, '>=', start)
    .where(field, '<=', end)
  .endGroup();
```

### `or(): RealmQueryBuilder<T>`
Join previous and next conditions with `OR` operator

### `and(): RealmQueryBuilder<T>`
Join previous and next conditions with `AND` operator, the default operator is `AND`

### `beginGroup(): RealmQueryBuilder<T>`
Begin the group (`left parenthesis`)

### `endGroup(): RealmQueryBuilder<T>`
Begin the group (`right parenthesis`)

exemple
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
The same as:
```ts
realm.objects('User').filtered('active == $0 AND (canWrite == $1 OR admin == $2)', true, true, true)
```

### `in(field: string, values: ReadonlyArray<any>): RealmQueryBuilder<T>`
In comparison, the realm.js don't support `IN` operator, it is generate with `OR`.
<!-- TODO: Add link to result method -->
The query can be slow when filters are applied ([result](#result)) if has much values or/and register on DB

Executed:
```ts
realResult.filtered('(field == $0 OR field == $1 OR field == $N)', values[0], values[1], values['N'])
```

Exemple: 
```ts
realmQueryBuilder(realm.objects('User'))
  .in('id', [11, 21, 34])
  .result()
```
The same as:
```ts
realm.objects('User').filtered('(id == $0 OR id == $1 OR id == $2)', 11, 21, 34)
```

### `distinct(...fields: string[]): RealmQueryBuilder<T>`
Add `DISTINCT` suffix, see: [Realm Query Language](https://www.mongodb.com/docs/realm/reference/realm-query-language/#sort--distinct--limit)

### `sorted(field: string, order?: RealmQuerySort): RealmQueryBuilder<T>`
Call `sorted` method, see: [sorted](https://www.mongodb.com/docs/realm-sdks/js/latest/Realm.Set.html#sorted)

### `limit(limit: number): RealmQueryBuilder<T>`
Add `LIMIT` suffix, see: [Realm Query Language](https://www.mongodb.com/docs/realm/reference/realm-query-language/#sort--distinct--limit)


### `findBy(field: string, value: any): T | undefined`
Apply the [`where(field, '==', value)`](#wherefield-string-condition-realmconditionaloperator-value-any-realmquerybuildert) and return the first value.

<!-- TODO: Adicionar link para a doc do `result` -->
### `size(): number`
Query the date and get results size, alias to `result().length`


### `min<V extends RealmNumericValueType>(property?: string): V | null`
Call [realm.js min](https://www.mongodb.com/docs/realm-sdks/js/latest/Realm.Set.html#min)

### `max<V extends RealmNumericValueType>(property?: string): V | null`
Call [realm.js max](https://www.mongodb.com/docs/realm-sdks/js/latest/Realm.Set.html#max)

### `sum(property?: string): number | null`
Call [realm.js sum](https://www.mongodb.com/docs/realm-sdks/js/latest/Realm.Set.html#sum)

### `avg(property?: string): number`
Call [realm.js avg](https://www.mongodb.com/docs/realm-sdks/js/latest/Realm.Set.html#avg)

### `merge(query: RealmQueryBuilder<T>): RealmQueryBuilder<T>`
Merge two `RealmQueryBuilder`

The operators [sorted](#sortedfield-string-order-realmquerysort-realmquerybuildert) and [limit](#limitlimit-number-realmquerybuildert) are not merged

Exemple
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
The same as:
```ts
realm.objects('User').filtered('age >= $0 OR (active == $1 AND admin == $2) LIMIT(20)', 18, true, false)
```

### `result(): Realm.Results<T>`
Execute the query with setted params (filters, distinct, limit, etc)
