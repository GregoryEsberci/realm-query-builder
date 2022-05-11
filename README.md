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

* [`clone(): this`](#clone-this)

* [`where(field: string, condition: RealmConditionalOperator, value: any): this`](#wherefield-string-condition-realmconditionaloperator-value-any-this)

* [`equalTo(field: string, value: any, caseInsensitive?: boolean): this`](#equaltofield-string-value-any-caseinsensitive-boolean-this)

* [`notEqualTo(field: string, value: any, caseInsensitive?: boolean): this`](#notequaltofield-string-value-any-caseinsensitive-boolean-this)

* [`like(field: string, value: string, caseInsensitive?: boolean): this`](#likefield-string-value-string-caseinsensitive-boolean-this)

* [`contains(field: string, value: string, caseInsensitive?: boolean): this`](#containsfield-string-value-string-caseinsensitive-boolean-this)

* [`beginsWith(field: string, value: string, caseInsensitive?: boolean): this`](#beginswithfield-string-value-string-caseinsensitive-boolean-this)

* [`endsWith(field: string, value: string, caseInsensitive?: boolean): this`](#endswithfield-string-value-string-caseinsensitive-boolean-this)

* [`greaterThan(field: string, value: RealmNumericValueType): this`](#greaterthanfield-string-value-realmnumericvaluetype-this)

* [`greaterThanOrEqualTo(field: string, value: RealmNumericValueType): this`](#greaterthanorequaltofield-string-value-realmnumericvaluetype-this)

* [`lessThan(field: string, value: RealmNumericValueType): this`](#lessthanfield-string-value-realmnumericvaluetype-this)

* [`lessThanOrEqualTo(field: string, value: RealmNumericValueType): this`](#lessthanorequaltofield-string-value-realmnumericvaluetype-this)

* [`between(field: string, start: RealmNumericValueType, end: RealmNumericValueType): this`](#betweenfield-string-start-realmnumericvaluetype-end-realmnumericvaluetype-this)

* [`or(): this`](#or-this)

* [`and(): this`](#and-this)

* [`beginGroup(): this`](#begingroup-this)

* [`endGroup(): this`](#endgroup-this)

* [`in(field: string, values: ReadonlyArray): this`](#infield-string-values-readonlyarrayany-this)

* [`distinct(...fields: string[]): this`](#distinctfields-string-this)

* [`sorted(field: string, order?: RealmQuerySort): this`](#sortedfield-string-order-realmquerysort-this)

* [`limit(limit: number): this`](#limitlimit-number-this)

* [`findBy(field: string, value: any): T | undefined`](#findbyfield-string-value-any-t--undefined)

* [`size(): number`](#size-number)

* [`min(property?: string): V | null`](#minv-extends-realmnumericvaluetypeproperty-string-v--null)

* [`max(property?: string): V | null`](#maxv-extends-realmnumericvaluetypeproperty-string-v--null)

* [`sum(property?: string): number | null`](#sumproperty-string-number--null)

* [`avg(property?: string): number`](#avgproperty-string-number)

* [`merge(query: RealmQueryBuilder): this`](#mergequery-realmquerybuildert-this)

* [`result(): Realm.Results`](#result-realmresultst)


#### `clone(): this`
Create a clone of the current object

#### `where(field: string, condition: RealmConditionalOperator, value: any): this`
Add condition

#### `equalTo(field: string, value: any, caseInsensitive?: boolean): this`
Alias to [`where(field, '==', value)`](#wherefield-string-condition-realmconditionaloperator-value-any-this), if `caseInsensitive: true` the operador applied will be `==[c]`

#### `notEqualTo(field: string, value: any, caseInsensitive?: boolean): this`
Alias to [`where(field, '!=', value)`](#wherefield-string-condition-realmconditionaloperator-value-any-this), if `caseInsensitive: true` the operador applied will be `!=[c]`

#### `like(field: string, value: string, caseInsensitive?: boolean): this`
Alias to [`where(field, 'LIKE', value)`](#wherefield-string-condition-realmconditionaloperator-value-any-this), if `caseInsensitive: true` the operador applied will be `LIKE[c]`

#### `contains(field: string, value: string, caseInsensitive?: boolean): this`
Alias to [`where(field, 'CONTAINS', value)`](#wherefield-string-condition-realmconditionaloperator-value-any-this), if `caseInsensitive: true` the operador applied will be `CONTAINS[c]`

#### `beginsWith(field: string, value: string, caseInsensitive?: boolean): this`
Alias to [`where(field, 'BEGINSWITH', value)`](#wherefield-string-condition-realmconditionaloperator-value-any-this), if `caseInsensitive` `true` the operador applied will be `BEGINSWITH[c]`
  

#### `endsWith(field: string, value: string, caseInsensitive?: boolean): this`
Alias to [`where(field, 'ENDSWITH', value)`](#wherefield-string-condition-realmconditionaloperator-value-any-this), if `caseInsensitive: true` the operador applied will be `ENDSWITH[c]`

#### `greaterThan(field: string, value: RealmNumericValueType): this`
Alias to [`where(field, '>', value)`](#wherefield-string-condition-realmconditionaloperator-value-any-this)

#### `greaterThanOrEqualTo(field: string, value: RealmNumericValueType): this`
Alias to [`where(field, '>=', value)`](#wherefield-string-condition-realmconditionaloperator-value-any-this)

#### `lessThan(field: string, value: RealmNumericValueType): this`
Alias to [`where(field, '<', value)`](#wherefield-string-condition-realmconditionaloperator-value-any-this)

#### `lessThanOrEqualTo(field: string, value: RealmNumericValueType): this`
Alias to [`where(field, '<=', value)`](#wherefield-string-condition-realmconditionaloperator-value-any-this)

#### `between(field: string, start: RealmNumericValueType, end: RealmNumericValueType): this`
Between condition, same as:
```ts
realmQueryBuilder(object)
  .beginGroup()
    .where(field, '>=', start)
    .where(field, '<=', end)
  .endGroup();
```

#### `or(): this`
Join previous and next conditions with `OR` operator

#### `and(): this`
Join previous and next conditions with `AND` operator, the default operator is `AND`

#### `beginGroup(): this`
Begin the group (left parenthesis)

#### `endGroup(): this`
Begin the group (right parenthesis)

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

#### `in(field: string, values: ReadonlyArray<any>): this`
In comparison, the realm.js don't support `IN` operator, it is generate with `OR`.
The query can be slow when filters are applied ([result](#result-realmresultst)) if has much values or/and register on DB

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

#### `distinct(...fields: string[]): this`
Add `DISTINCT` suffix, see: [Realm Query Language](https://www.mongodb.com/docs/realm/reference/realm-query-language/#sort--distinct--limit)

#### `sorted(field: string, order?: RealmQuerySort): this`
Call `sorted` method, see: [sorted](https://www.mongodb.com/docs/realm-sdks/js/latest/Realm.Set.html#sorted)

#### `limit(limit: number): this`
Add `LIMIT` suffix, see: [Realm Query Language](https://www.mongodb.com/docs/realm/reference/realm-query-language/#sort--distinct--limit)


#### `findBy(field: string, value: any): T | undefined`
Apply the [`where(field, '==', value)`](#wherefield-string-condition-realmconditionaloperator-value-any-this) and return the first value.

#### `size(): number`
Query the date and get results size, alias to [result().length](#and-realmquerybuildert)


#### `min<V extends RealmNumericValueType>(property?: string): V | null`
Call [realm.js min](https://www.mongodb.com/docs/realm-sdks/js/latest/Realm.Set.html#min)

#### `max<V extends RealmNumericValueType>(property?: string): V | null`
Call [realm.js max](https://www.mongodb.com/docs/realm-sdks/js/latest/Realm.Set.html#max)

#### `sum(property?: string): number | null`
Call [realm.js sum](https://www.mongodb.com/docs/realm-sdks/js/latest/Realm.Set.html#sum)

#### `avg(property?: string): number`
Call [realm.js avg](https://www.mongodb.com/docs/realm-sdks/js/latest/Realm.Set.html#avg)

#### `merge(query: RealmQueryBuilder<T>)): this`
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

#### `result(): Realm.Results<T>`
Execute the query with setted params (filters, distinct, limit, etc)
