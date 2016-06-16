var analyze = require('../analyze');
var assert = require('assert');
var median = require('median');
var expect = require('chai').expect;
require('chai').should();

describe('analyze', () => {

    it('stores all occurring keys', () => {
        let array = [
            { a: 'b' },
            { a: 'c', b: 'd' }
        ];

        let analysis = analyze(array);

        assert.ok(analysis.keys['a'], 'key "a" should exist');
        assert.ok(analysis.keys['b'], 'key "b" should exist');
        assert.equal(Object.keys(analysis.keys).length, 2, 'only two keys should exist');
    });

    it('counts the occurrences of keys', () => {
        let array = [
            { a: 'b' },
            { a: 'c', b: 'd' }
        ];

        let analysis = analyze(array);

        assert.equal(analysis.keys['a'].occurrences, 2, 'key "a" should occur twice');
        assert.equal(analysis.keys['b'].occurrences, 1, 'key "b" should occur once');
    });

    it('counts the occurrences of values for keys', () => {
        let array = [
            { a: 'b' },
            { a: 'c', b: 'd' },
            { a: 'c' }
        ];

        let analysis = analyze(array);

        assert.equal(analysis.keys['a'].values('b').occurrences, 1);
        assert.equal(analysis.keys['b'].values('d').occurrences, 1);
        assert.equal(analysis.keys['a'].values('c').occurrences, 2);
    });

    it('stores the possible types for values of keys', () => {
        let array = [
            { a: 'b' },
            { a: 'c', b: 'd' },
            { a: true }
        ];

        let analysis = analyze(array);

        assert.ok(analysis.keys['a'].types['string'],
                  'type "string" should be registered for key "a"');
        assert.ok(analysis.keys['a'].types['boolean'],
                  'type "boolean" should be registered for key "a"');

        assert.ok(analysis.keys['b'].types['undefined'],
                  'type "undefined" should be registered for key "b"');
        assert.ok(analysis.keys['b'].types['string'],
                  'type "string" should be registered for key "b"');
    });

    it('stores the counts of the possible types', () => {
        let array = [
            { a: 'b' },
            { a: 'c', b: 'd' },
            { a: true }
        ];

        let analysis = analyze(array);

        assert.equal(analysis.keys['a'].types['string'].occurrences, 2,
                     'key "a" should have 2 values of type "string"');
        assert.equal(analysis.keys['a'].types['boolean'].occurrences, 1,
                     'key "a" should have 1 values of type "boolean"');

        assert.equal(analysis.keys['b'].types['undefined'].occurrences, 2,
                     'key "b" should have 2 values of type "undefined"');
        assert.equal(analysis.keys['b'].types['string'].occurrences, 1,
                     'key "b" should have 2 values of type "string"');

    });

    it('calculates the median of numeric values', () => {
        let array = [
            { a: 10 },
            { a: 20, b: 0 },
            { a: 10, b: 3, c: true }
        ];

        let analysis = analyze(array);

        assert.equal(analysis.keys['a'].types['number'].median, median([10, 20, 10]));
        assert.equal(analysis.keys['b'].types['number'].median, median([0, 3]));
        assert.equal(analysis.keys['c'].types['number'], undefined);
    });

    it('calculates the percentage of boolean values', () => {
        let array = [
            { a: 10, b: true },
            { a: true, b: false },
            { c: false }
        ];

        let analysis = analyze(array);

        assert.equal(analysis.keys['a'].types['boolean'].percentages['true'], (1 / 3) * 100);
        assert.equal(analysis.keys['a'].types['boolean'].percentages['false'], 0);
        assert.equal(analysis.keys['a'].types['boolean'].percentages['other'], (2 / 3) * 100);
    });

    it('preserves a copy of the original array', () => {
        let array = [
            { a: 1, b: 2 }
        ];

        let analysis = analyze(array);

        for (let i = 0; i < array.length; i++) {
            assert.notEqual(array[i], analysis.original[i]);
            assert.deepEqual(array[i], analysis.original[i]);
        }
    });

    it('stores all possible values for a key', () => {
        let array = [
            { a: 1, b: 2 },
            { a: 3 }
        ];

        let analysis = analyze(array);

        assert.deepEqual(analysis.keys['a'].values(), [1, 3]);
        assert.deepEqual(analysis.keys['b'].values(), [2]);
    });

});

describe('analyze(...).report()', () => {
    it('lists the median number if the value can be a number', () => {

        // Arrange...

        let arr = [
            { a: 1, c: 2, d: 'hey' },
            { a: 3, c: 4 },
            { a: '3', c: '5' }, // not counted
            { a: -10, c: -100 }
        ];

        // Act...

        let report = analyze(arr).report();

        // Assert...

        assert.equal(report['a'].median, median([1, 3, -10]));
        assert.equal(report['c'].median, median([2, 4, -100]));
        assert.equal(report['d'].median, null);
    });

    it('lists the percentage of true/false/nonBoolean for all values', () => {

        // Arrange...

        let arr = [
            { a: true, b: false, c: 'hey' },
            { a: 'yo', b: true }
        ];

        // Act...

        let report = analyze(arr).report();

        // Assert...

        assert.equal(report.a.percentageTrue, 50);
        assert.equal(report.a.percentageFalse, 0);
        assert.equal(report.a.percentageNonBoolean, 50);

        assert.equal(report.b.percentageTrue, 50);
        assert.equal(report.b.percentageFalse, 50);
        assert.equal(report.b.percentageNonBoolean, 0);

        assert.equal(report.c.percentageTrue, 0);
        assert.equal(report.c.percentageFalse, 0);
        assert.equal(report.c.percentageNonBoolean, 100);
    });

    it('lists the number of possible values', () => {

        // Arrage...
        let arr = [
            { a: 1, b: 1 },
            { a: 2, b: 2 },
            { a: 1, b: '2' }
        ];

        // Act...

        let report = analyze(arr).report();

        // Assert...

        assert.deepEqual(report.a.possibleValues, [1, 2]);
        assert.deepEqual(report.b.possibleValues, [1, 2, '2']);
    });

    it('lists the percentage of occurrences for all values', () => {

        // Arrage...
        let arr = [
            { a: 1, b: 1 },
            { a: 2, b: 2 },
            { a: 1, b: '2' }
        ];

        // Act...

        let report = analyze(arr).report();

        // Assert...

        report.a.valuePercentages
            .should.deep.include.members({ value: 1, percentage: 2 / 3 * 100 });
        report.a.valuePercentages
            .should.deep.include.members({ value: 2, percentage: 1 / 3 * 100 });

        report.b.valuePercentages
            .should.deep.include.members({ value: 1, percentage: 1 / 3 * 100 });
        report.b.valuePercentages
            .should.deep.include.members({ value: 2, percentage: 1 / 3 * 100 });
        report.b.valuePercentages
            .should.deep.include.members({ value: '2', percentage: 1 / 3 * 100 });

    });
});
