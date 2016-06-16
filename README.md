Installation
============

`npm i --save analyze-array`

Usage
=====

```javascript
const analyze = require('analyze-array');
const {pretty = render} = require('prettyjson');

const analysis = analyze([
    {
        a: 10,
        b: 30,
        c: {
            d: 40
        }
    },
    {
        a: 100,
        c: {
            d: 40,
            e: false
        }
    }
]);

console.log(pretty(analysis));
```

What data is available
======================

This is copied directly from the spec. If you're not sure about anything,
check out the spec. The result of analyze.raw is made to ease the collection
of data, while the result of analyze is made to be easily digestable.

Fields starting with \_ are **not** a part of the API and are subject to
change with minor versions. Changes to other fields will require a new
major version.

analyze
-------
* It lists the median number if the value can be a number (otherwise null)
    * Type: number or null
    * `report.‹key›.median`
* It lists the percentage of true/false/nonBoolean for all values
    * Type: number
    * `report.‹key›.percentageTrue`
    * `report.‹key›.percentageFalse`
    * `report.‹key›.percentageNonBoolean`
* It lists the number of possible values
    * Type: `Array`
    * `report.‹key›.possibleValues`
* It lists the percentage of occurrences for all values
    * Type: `[object]`
    * `report.‹key›.valuePercentages`
        * `[ { value: ‹value›, percentage: ‹percentage› }, ... ]`


analyze.raw (more data, uglier formatting)
------------------------------------------
* It stores all occurring keys
* It counts the occurrences of keys
* It counts the occurrences of values for keys
* It stores the possible types for values of keys
* It stores the counts of the possible types
* It calculates the median of numeric values
* It calculates the percentage of boolean values
* It preserves a copy of the original array
* It stores all possible values for a key
* It works with nested structures

Testing
=======

`npm i -g jasmine`
`npm test`
