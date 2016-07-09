
class DataExtractor {
    constructor({extractors = []}) {
        this.extractors = extractors;
    }

    addExtractor(fn) {
        if (typeof fn !== 'function') {
            throw new Error('Argument #1 should be a function');
        }

        this.extractors.push(fn);
    }

    extract(data) {
        var result;

        for (let i in this.extractors) {
            let extractor = this.extractors[i];
            let currentResult = extractor(data);

            if (currentResult) {
                result = currentResult;
                break;
            }
        }

        return result;
    }
}


module.exports = DataExtractor;
