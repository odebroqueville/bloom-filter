const murmurhash3 = require('murmurhash3');

module.exports.BloomFilter = class BloomFilter {
    constructor(itemsCount, prob, hashCount) {
        this.prob = prob;
        this.size = this.getSize(itemsCount, prob, hashCount);
        //this.hashCount = this.getHashCount(this.size, itemsCount);
        this.hashCount = hashCount;
        this.bitArray = Array(this.size).fill(false);
    }

    add(domain) {
        for (let i = 0; i < this.hashCount; i++) {
            murmurhash3.murmur32(domain, i, (err, digest) => {
                if (err) throw err;
                this.bitArray[digest % this.size] = true;
            });
        }
    }

    lookup(domain) {
        for (let i = 0; i < this.hashCount; i++) {
            murmurhash3.murmur32(domain, i, (err, digest) => {
                if (err) throw err;
                if (!this.bitArray[digest % this.size]) {
                    return false;
                }
            });
        }
        return true;
    }

    getSize(n, p, k) {
        //const m = -(n * Math.log(p)) / (Math.log(2) ** 2);
        const m = - n * k / Math.log(1 - Math.pow(p, 1 / k));
        return Math.ceil(m);
    }

    getHashCount(m, n) {
        const k = (m / n) * Math.log(2);
        return Math.floor(k);
    }
}
