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
