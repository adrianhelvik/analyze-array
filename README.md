Installation
============

`npm i --save analyze-array`

Usage
=====

Input
-----

```javascript
const analyze = require('analyze-array');
const {render: pretty} = require('prettyjson');

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

Output
------

```yaml
a:
  median:               55
  percentageTrue:       0
  percentageFalse:      0
  percentageNonBoolean: 100
  possibleValues:
    - 10
    - 100
  valuePercentages:
    -
      value:      10
      percentage: 50
    -
      value:      100
      percentage: 50
b:
  median:               30
  percentageTrue:       0
  percentageFalse:      0
  percentageNonBoolean: 100
  possibleValues:
    - 30
  valuePercentages:
    -
      value:      30
      percentage: 50
c.d:
  median:               40
  percentageTrue:       0
  percentageFalse:      0
  percentageNonBoolean: 100
  possibleValues:
    - 40
  valuePercentages:
    -
      value:      40
      percentage: 100
c.e:
  median:               null
  percentageTrue:       0
  percentageFalse:      50
  percentageNonBoolean: 50
  possibleValues:
    - false
  valuePercentages:
    -
      value:      false
      percentage: 50
```

What data is available
======================

This is copied directly from the spec. If you're unsure about anything,
check out the spec. The result of analyze.raw is made to ease the collection
of data, while the result of analyze is made to be easily digestable.

Fields starting with \_ are **not** a part of the API and are subject to
change with minor versions. Changes to other fields will require a new
major version.

analyze
-------
* It lists the median number if the value can be a number (otherwise null)
    * Type: `number` or `null`
    * `report.‹key›.median`
* It lists the percentage of true/false/nonBoolean for all values
    * Type: `number`
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

* `npm i -g jasmine`
* `npm test`

Notes
=====

Pull requests are very welcome!
