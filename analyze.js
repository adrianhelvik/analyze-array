var median = require('median');
var clone = require('clone');
var flatten = require('flat');

/**
 * Provide a raw analysis of the given array
 */
function analyze(array) {

    array = clone(array);

    var analysis = {
        keys: {},
        original: array,
        report() {
            // set this as the first argument
            const args = Array.from(arguments);
            args.unshift(this);

            // .. and call the report function
            return report.apply(null, args);
        }
    };

    // flatten all entries of the array for the analysis phase
    array = array.map(entry => flatten(entry));

    const allKeys = [];
    let isFirst = true;
    let itemsCovered = 0;

    // First iteration
    // * store type occurrences for keys
    //   * with count
    // * log occurrence count for:
    //   * keys
    //   * values for a key
    for (const item of array) {

        // ---

        for (const key of Object.keys(item)) {

            // create entry for key.
            if (! analysis.keys[key]) {
                analysis.keys[key] = {};
                analysis.keys[key].occurrences = 0;
                const valueStorage = analysis.keys[key]._values = [];

                // Use function to avoid type
                // coercion into string.
                analysis.keys[key].values = function (key, setValue) {

                    if (key == null && setValue == null) {
                        return valueStorage.map(val => val._valueData);
                    }

                    if (setValue) {
                        valueStorage.push(setValue);
                        setValue._valueData = key;
                        return setValue;
                    }

                    for (const value of valueStorage) {
                        if (value._valueData === key) {
                            return value;
                        }
                    }

                    return null;
                };
                analysis.keys[key].types = {}
            }

            // create entry for values
            if (! analysis.keys[key].values(item[key])) {
                analysis.keys[key].values(item[key], {});
                analysis.keys[key].values(item[key]).occurrences = 0;
            }

            analysis.keys[key].occurrences++;
            analysis.keys[key].values(item[key]).occurrences++;

            if (! analysis.keys[key].types[typeof item[key]]) {
                analysis.keys[key].types[typeof item[key]] = {};
                analysis.keys[key].types[typeof item[key]].occurrences = 0;
            }

            analysis.keys[key].types[typeof item[key]].occurrences++;

            // ---

            // For first item just add the key to the existing keys.
            if (isFirst) {
                allKeys.push(key);
            }

            // for subsequent keys, check if it has occurred and
            // that the undefined type has not been created.
            else if (! allKeys.includes(key) && ! analysis.keys[key].types['undefined']) {
                analysis.keys[key].types['undefined'] = {
                    occurrences: itemsCovered
                };

                allKeys.push(key);
            }
        }

        for (const key of allKeys) {
            if (! Object.keys(item).includes(key)) {
                if (! analysis.keys[key].types['undefined']) {
                    analysis.keys[key].types['undefined'] = {
                        occurrences: 0
                    };
                }
                analysis.keys[key].types['undefined'].occurrences++;
            }
        }

        // ---

        isFirst = false;
        itemsCovered++;
    }

    // Second iteration - store statistics about types
    // * store median of values which can be numeric
    // * calculate what percentage possibly boolean values are:
    //   * true
    //   * false
    //   * other (non-boolean or not set)
    for (const key of Object.keys(analysis.keys)) {

        const numericValues = [];

        if (analysis.keys[key].types['number']) {
            for (const item of array) {
                if (typeof item[key] == 'number') {
                    numericValues.push(item[key]);
                }
            }

            analysis.keys[key].types['number'].median = median(numericValues);
        }

        if (analysis.keys[key].types['boolean']) {
            let trueCount = 0;
            let falseCount = 0;
            let otherCount = 0;

            for (const item of array) {

                switch (item[key]) {
                    case true:
                        trueCount++;
                        break;
                    case false:
                        falseCount++;
                        break;
                    default:
                        otherCount++;
                }
            }

            analysis.keys[key].types['boolean'].percentages = {
                'true': (trueCount / array.length) * 100,
                'false': (falseCount / array.length) * 100,
                'other': (otherCount / array.length) * 100
            };
        }
    }

    return analysis;
}

/**
 * Provide a cleaner more user friendly report
 * of the collected data.
 */
function report(analysis) {
    const fullReport = {};

    for (const key of Object.keys(analysis.keys)) {
        const value = analysis.keys[key];
        const report = fullReport[key] = {};

        // median
        if (value.types['number']) {
            report.median = value.types.number.median;
        } else {
            report.median = null;
        }

        // list boolean / non-boolean percentages
        if (value.types.boolean) {
            report.percentageTrue = value.types.boolean.percentages.true;
            report.percentageFalse = value.types.boolean.percentages.false;
            report.percentageNonBoolean = value.types.boolean.percentages.other;
        } else {
            report.percentageTrue = 0;
            report.percentageFalse = 0;
            report.percentageNonBoolean = 100;
        }

        // list possible values
        report.possibleValues = value.values();

        // list value percentages
        report.valuePercentages = [];

        for (const val of report.possibleValues) {
            const info = value.values(val);

            let percentage;
            if (info) {
                percentage = info.occurrences / analysis.original.length * 100;
            } else {
                percentage = 0;
            }
            report.valuePercentages.push({
                value: val,
                percentage
            });
        }
    }

    return fullReport;
}

module.exports = analyze;
