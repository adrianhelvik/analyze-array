var rawAnalyze = require('./analyze');

exports = module.exports = function (array) {
    return rawAnalyze(array).report();
};

exports.raw = rawAnalyze;
