/* eslint-disable @typescript-eslint/ban-ts-comment */
import Realm from 'realm';
import realmQueryBuilder, { RealmConditionalOperator, RealmQueryBuilder } from '../src/index';

type DataType = { field: string; };
let fakeRealmResults: jest.Mocked<Realm.Results<DataType> & DataType[]>;

beforeEach(() => {
  // @ts-ignore
  fakeRealmResults = [];

  fakeRealmResults.filtered = jest.fn().mockReturnValue(fakeRealmResults);
  fakeRealmResults.sorted = jest.fn().mockReturnValue(fakeRealmResults);
});

describe('methods', () => {
  let instance: RealmQueryBuilder<DataType>;

  beforeEach(() => {
    instance = realmQueryBuilder(fakeRealmResults);
  });

  it('create', () => {
    instance.result();

    expect(instance).toBeInstanceOf(RealmQueryBuilder);
    // @ts-ignore => private attribute
    expect(instance.realmResult).toBe(fakeRealmResults);
  });

  it('clone', () => {
    const instanceClone = instance.clone();

    expect(instanceClone).toBeInstanceOf(RealmQueryBuilder);
    expect(instanceClone).not.toBe(instance);
  });

  const generateValues = (length: number) => Array.from({ length }, (_, index) => `value${index}`);

  describe('where', () => {
    it.each<[RealmConditionalOperator]>([['CONTAINS'], ['!='], ['==[c]']])('operator: %s', (operator) => {
      const whereReturn = instance.where('field', operator, 'value');

      whereReturn.result();

      expect(whereReturn).toBeInstanceOf(RealmQueryBuilder);
      expect(whereReturn).not.toBe(instance);

      expect(fakeRealmResults.filtered).toHaveBeenCalledWith(`field ${operator} $0`, 'value');
    });
  });

  describe('alias of where method', () => {
    let whereMethodSpy: jest.SpyInstance;

    beforeEach(() => {
      whereMethodSpy = jest.spyOn(instance, 'where');
    });

    describe.each([
      ['equalTo', '=='],
      ['notEqualTo', '!='],
      ['like', 'LIKE'],
      ['contains', 'CONTAINS'],
      ['beginsWith', 'BEGINSWITH'],
      ['endsWith', 'ENDSWITH'],
    ])(
      '%s',
      (methodName, operator) => {
        let method: (...args: any[]) => any;

        beforeEach(() => {
        // @ts-ignore
          method = instance[methodName].bind(instance);
        });

        it('case insensitive', () => {
          const result = method('field', 'value');

          expect(result).toBeInstanceOf(RealmQueryBuilder);

          expect(whereMethodSpy).toHaveBeenCalledWith('field', operator, 'value');
          expect(whereMethodSpy).toHaveBeenCalledTimes(1);
        });

        it('simple', () => {
          const result = method('field', 'value');

          expect(result).toBeInstanceOf(RealmQueryBuilder);

          expect(whereMethodSpy).toHaveBeenCalledWith('field', operator, 'value');
          expect(whereMethodSpy).toHaveBeenCalledTimes(1);
        });

        it('case sensitive', () => {
          const result = method('field', 'value', true);

          expect(result).toBeInstanceOf(RealmQueryBuilder);

          expect(whereMethodSpy).toHaveBeenCalledWith('field', `${operator}[c]`, 'value');
          expect(whereMethodSpy).toHaveBeenCalledTimes(1);
        });
      },
    );

    it.each([
      ['greaterThan', '>'],
      ['greaterThanOrEqualTo', '>='],
      ['lessThan', '<'],
      ['lessThanOrEqualTo', '<='],
    ])('%s', (methodName, operator) => {
    // @ts-ignore
      const result = instance[methodName]('field', 'value', true);

      expect(result).toBeInstanceOf(RealmQueryBuilder);

      expect(whereMethodSpy).toHaveBeenCalledWith('field', operator, 'value');
      expect(whereMethodSpy).toHaveBeenCalledTimes(1);
    });
  });

  it('between', () => {
    const newInstance = instance.equalTo('field1', 'value1').between('field2', 5, 10);

    newInstance.result();

    expect(newInstance).not.toBe(instance);
    expect(newInstance).toBeInstanceOf(RealmQueryBuilder);
    expect(fakeRealmResults.filtered).toHaveBeenCalledWith('field1 == $0 AND (field2 >= $1 AND field2 <= $2)', 'value1', 5, 10);
    expect(fakeRealmResults.filtered).toHaveBeenCalledTimes(1);
  });

  describe('or', () => {
    it('with equalTo', () => {
      const newInstance = instance
        .equalTo('field0', 'value0')
        .or()
        .equalTo('field1', 'value1');

      newInstance.result();

      expect(newInstance).not.toBe(instance);
      expect(newInstance).toBeInstanceOf(RealmQueryBuilder);
      expect(fakeRealmResults.filtered).toHaveBeenCalledWith('field0 == $0 OR field1 == $1', 'value0', 'value1');
      expect(fakeRealmResults.filtered).toHaveBeenCalledTimes(1);
    });

    it('with group', () => {
      const newInstance = instance
        .equalTo('field0', 'value0')
        .or()
        .beginGroup()
        .equalTo('field1', 'value1')
        .endGroup();

      newInstance.result();

      expect(newInstance).not.toBe(instance);
      expect(newInstance).toBeInstanceOf(RealmQueryBuilder);
      expect(fakeRealmResults.filtered).toHaveBeenCalledWith('field0 == $0 OR (field1 == $1)', 'value0', 'value1');
      expect(fakeRealmResults.filtered).toHaveBeenCalledTimes(1);
    });
  });

  describe('and', () => {
    it('with equalTo', () => {
      const newInstance = instance
        .equalTo('field0', 'value0')
        .and()
        .equalTo('field1', 'value1');

      newInstance.result();

      expect(newInstance).not.toBe(instance);
      expect(newInstance).toBeInstanceOf(RealmQueryBuilder);
      expect(fakeRealmResults.filtered).toHaveBeenCalledWith('field0 == $0 AND field1 == $1', 'value0', 'value1');
      expect(fakeRealmResults.filtered).toHaveBeenCalledTimes(1);
    });

    it('with group', () => {
      const newInstance = instance
        .equalTo('field0', 'value0')
        .and()
        .beginGroup()
        .equalTo('field1', 'value1')
        .endGroup();

      newInstance.result();

      expect(newInstance).not.toBe(instance);
      expect(newInstance).toBeInstanceOf(RealmQueryBuilder);
      expect(fakeRealmResults.filtered).toHaveBeenCalledWith('field0 == $0 AND (field1 == $1)', 'value0', 'value1');
      expect(fakeRealmResults.filtered).toHaveBeenCalledTimes(1);
    });
  });

  describe('group', () => {
    it('simple', () => {
    /* eslint-disable indent */
    const newInstance = instance
      .equalTo('field0', 'value0')
      .or()
      .beginGroup()
        .equalTo('field1', 'value1')
        .equalTo('field2', 'value2')
      .endGroup();
    /* eslint-enable indent */

      newInstance.result();

      expect(newInstance).not.toBe(instance);
      expect(newInstance).toBeInstanceOf(RealmQueryBuilder);
      expect(fakeRealmResults.filtered).toHaveBeenCalledWith(
        'field0 == $0 OR (field1 == $1 AND field2 == $2)',
        'value0',
        'value1',
        'value2',
      );
      expect(fakeRealmResults.filtered).toHaveBeenCalledTimes(1);
    });

    it('multiple', () => {
    /* eslint-disable indent */
    const newInstance = instance
      .equalTo('field0', 'value0')
      .beginGroup()
        .equalTo('field1', 'value1')
        .or()
        .equalTo('field2', 'value2')
      .endGroup()
      .beginGroup()
        .equalTo('field3', 'value3')
      .endGroup();
    /* eslint-enable indent */

      newInstance.result();

      expect(newInstance).not.toBe(instance);
      expect(newInstance).toBeInstanceOf(RealmQueryBuilder);
      expect(fakeRealmResults.filtered).toHaveBeenCalledWith(
        'field0 == $0 AND (field1 == $1 OR field2 == $2) AND (field3 == $3)',
        ...generateValues(4),
      );
      expect(fakeRealmResults.filtered).toHaveBeenCalledTimes(1);
    });

    it('nested', () => {
    /* eslint-disable indent */
    const newInstance = instance
      .equalTo('field0', 'value0')
      .beginGroup()
        .beginGroup()
          .equalTo('field1', 'value1')
          .or()
          .equalTo('field2', 'value2')
        .endGroup()
        .beginGroup()
          .equalTo('field3', 'value3')
          .equalTo('field4', 'value4')
        .endGroup()
      .endGroup();
    /* eslint-enable indent */

      newInstance.result();

      expect(newInstance).not.toBe(instance);
      expect(newInstance).toBeInstanceOf(RealmQueryBuilder);
      expect(fakeRealmResults.filtered).toHaveBeenCalledWith(
        'field0 == $0 AND ((field1 == $1 OR field2 == $2) AND (field3 == $3 AND field4 == $4))',
        ...generateValues(5),
      );
      expect(fakeRealmResults.filtered).toHaveBeenCalledTimes(1);
    });

    describe('error', () => {
      it('not started', () => {
        expect(() => instance.endGroup()).toThrow('Group not started');
      });

      it('without filters', () => {
        expect(() => instance.beginGroup().endGroup()).toThrow('Invalid group, no filter found');
      });
    });
  });

  describe('in', () => {
    it('empty values', () => {
      const newInstance = instance.equalTo('field0', 'value0').in('field1', []);

      newInstance.result();

      expect(newInstance).not.toBe(instance);
      expect(newInstance).toBeInstanceOf(RealmQueryBuilder);
      expect(fakeRealmResults.filtered).toHaveBeenCalledWith('field0 == $0', 'value0');
      expect(fakeRealmResults.filtered).toHaveBeenCalledTimes(1);
    });

    it('with one value', () => {
      const newInstance = instance
        .equalTo('field0', 'value0')
        .in('field1', ['value1'])
        .equalTo('field2', 'value2');

      newInstance.result();

      expect(newInstance).not.toBe(instance);
      expect(newInstance).toBeInstanceOf(RealmQueryBuilder);
      expect(fakeRealmResults.filtered).toHaveBeenCalledWith(
        'field0 == $0 AND (field1 == $1) AND field2 == $2',
        ...generateValues(3),
      );
      expect(fakeRealmResults.filtered).toHaveBeenCalledTimes(1);
    });

    it('with values', () => {
      const newInstance = instance
        .equalTo('field0', 'value0')
        .in('field1', ['value1', 'value2', 'value3']);

      newInstance.result();

      expect(newInstance).not.toBe(instance);
      expect(newInstance).toBeInstanceOf(RealmQueryBuilder);
      expect(fakeRealmResults.filtered).toHaveBeenCalledWith(
        'field0 == $0 AND (field1 == $1 OR field1 == $2 OR field1 == $3)',
        ...generateValues(4),
      );
      expect(fakeRealmResults.filtered).toHaveBeenCalledTimes(1);
    });
  });

  it('distinct', () => {
    const newInstance = instance.distinct('field1', 'field2');

    newInstance.result();

    expect(newInstance).not.toBe(instance);
    expect(newInstance).toBeInstanceOf(RealmQueryBuilder);
    expect(fakeRealmResults.filtered).toHaveBeenCalledWith('TRUEPREDICATE DISTINCT(field1,field2)');
    expect(fakeRealmResults.filtered).toHaveBeenCalledTimes(1);
  });

  describe('sorted', () => {
    it('default order', () => {
      const newInstance = instance.sorted('field1');

      expect(newInstance).not.toBe(instance);
      expect(newInstance).toBeInstanceOf(RealmQueryBuilder);
      expect(fakeRealmResults.sorted).toHaveBeenCalledWith('field1', false);
      expect(fakeRealmResults.sorted).toHaveBeenCalledTimes(1);
    });

    it('asc order', () => {
      const newInstance = instance.sorted('field1', 'asc');

      expect(newInstance).not.toBe(instance);
      expect(newInstance).toBeInstanceOf(RealmQueryBuilder);
      expect(fakeRealmResults.sorted).toHaveBeenCalledWith('field1', false);
      expect(fakeRealmResults.sorted).toHaveBeenCalledTimes(1);
    });

    it('desc order', () => {
      const newInstance = instance.sorted('field1', 'desc');

      expect(newInstance).not.toBe(instance);
      expect(newInstance).toBeInstanceOf(RealmQueryBuilder);
      expect(fakeRealmResults.sorted).toHaveBeenCalledWith('field1', true);
      expect(fakeRealmResults.sorted).toHaveBeenCalledTimes(1);
    });
  });

  it('limit', () => {
    const newInstance = instance
      .equalTo('field0', 'value0')
      .distinct('field1')
      .limit(10);

    newInstance.result();

    expect(newInstance).not.toBe(instance);
    expect(newInstance).toBeInstanceOf(RealmQueryBuilder);
    expect(fakeRealmResults.filtered).toHaveBeenCalledWith('field0 == $0 DISTINCT(field1) LIMIT(10)', 'value0');
    expect(fakeRealmResults.filtered).toHaveBeenCalledTimes(1);
  });

  describe('findBy', () => {
    it('found', () => {
      const cloneSpy = jest.spyOn(instance, 'clone');
      const expectedResult = { field: 'value' };

      fakeRealmResults.push(expectedResult);
      const result = instance.findBy('field0', 'value0');

      expect(cloneSpy).toHaveBeenCalledTimes(1);
      expect(result).toBe(expectedResult);

      expect(fakeRealmResults.filtered).toHaveBeenCalledWith('field0 == $0 LIMIT(1)', 'value0');
      expect(fakeRealmResults.filtered).toHaveBeenCalledTimes(1);
    });

    it('not found', () => {
      const cloneSpy = jest.spyOn(instance, 'clone');

      const result = instance.findBy('field0', 'value0');

      expect(cloneSpy).toHaveBeenCalledTimes(1);
      expect(result).toBeUndefined();

      expect(fakeRealmResults.filtered).toHaveBeenCalledWith('field0 == $0 LIMIT(1)', 'value0');
      expect(fakeRealmResults.filtered).toHaveBeenCalledTimes(1);
    });
  });

  it('size', () => {
    fakeRealmResults.push({ field: 'value1' });
    fakeRealmResults.push({ field: 'value2' });

    expect(instance.size()).toBe(2);
  });

  it('min', () => {
    fakeRealmResults.min = jest.fn().mockReturnValue(10);

    expect(instance.min('field0')).toBe(10);
    expect(fakeRealmResults.min).toHaveBeenCalledTimes(1);
    expect(fakeRealmResults.min).toHaveBeenCalledWith('field0');
  });

  it('max', () => {
    fakeRealmResults.max = jest.fn().mockReturnValue(10);

    expect(instance.max('field0')).toBe(10);
    expect(fakeRealmResults.max).toHaveBeenCalledTimes(1);
    expect(fakeRealmResults.max).toHaveBeenCalledWith('field0');
  });

  it('sum', () => {
    fakeRealmResults.sum = jest.fn().mockReturnValue(10);

    expect(instance.sum('field0')).toBe(10);
    expect(fakeRealmResults.sum).toHaveBeenCalledTimes(1);
    expect(fakeRealmResults.sum).toHaveBeenCalledWith('field0');
  });

  it('avg', () => {
    fakeRealmResults.avg = jest.fn().mockReturnValue(10);

    expect(instance.avg('field0')).toBe(10);
    expect(fakeRealmResults.avg).toHaveBeenCalledTimes(1);
    expect(fakeRealmResults.avg).toHaveBeenCalledWith('field0');
  });

  describe('merge', () => {
    it('filters', () => {
      const toMerge = realmQueryBuilder<DataType>(fakeRealmResults).equalTo('field1', 'value1');

      const newInstance = instance.equalTo('field0', 'value0').merge(toMerge);

      newInstance.result();

      expect(newInstance).not.toBe(instance);
      expect(newInstance).toBeInstanceOf(RealmQueryBuilder);
      expect(fakeRealmResults.filtered).toHaveBeenCalledWith('field0 == $0 AND field1 == $1', 'value0', 'value1');
      expect(fakeRealmResults.filtered).toHaveBeenCalledTimes(1);
    });

    it('distinctFields', () => {
      const toMerge = realmQueryBuilder<DataType>(fakeRealmResults).distinct('field2', 'field3');

      const newInstance = instance.distinct('field0', 'field1').merge(toMerge);

      newInstance.result();

      expect(newInstance).not.toBe(instance);
      expect(newInstance).toBeInstanceOf(RealmQueryBuilder);
      expect(fakeRealmResults.filtered).toHaveBeenCalledWith('TRUEPREDICATE DISTINCT(field0,field1,field2,field3)');
      expect(fakeRealmResults.filtered).toHaveBeenCalledTimes(1);
    });

    it('groups', () => {
      const toMerge = realmQueryBuilder(fakeRealmResults)
        .equalTo('field2', 'value2')
        .or()
        .beginGroup()
        .equalTo('field3', 'value3')
        .equalTo('field4', 'value4')
        .endGroup();

      const newInstance = instance
        .beginGroup()
        .equalTo('field0', 'value0')
        .equalTo('field1', 'value1')
        .endGroup()
        .or()
        .beginGroup()
        .merge(toMerge)
        .endGroup();

      newInstance.result();

      expect(newInstance).not.toBe(instance);
      expect(newInstance).toBeInstanceOf(RealmQueryBuilder);
      expect(fakeRealmResults.filtered).toHaveBeenCalledWith('(field0 == $0 AND field1 == $1) OR (field2 == $2 OR (field3 == $3 AND field4 == $4))', 'value0', 'value1', 'value2', 'value3', 'value4');
      expect(fakeRealmResults.filtered).toHaveBeenCalledTimes(1);
    });
  });
});

it('class extends', () => {
  class TestQuery extends RealmQueryBuilder<DataType> {
    active() {
      return this.equalTo('active', true);
    }
  }

  const instance = new TestQuery(fakeRealmResults);

  instance.equalTo('field0', 'value0').active().result();

  expect(fakeRealmResults.filtered).toHaveBeenCalledWith('field0 == $0 AND active == $1', 'value0', true);
});