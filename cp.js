/***************************************************************************** 
Given a file named video_websites.json, with the structure: 
[
    {
        "host": "Domain of website",
        "name": "Name of website",
        "urlRegex": "Regex expression"
    }
]
this script will:
1. Build a bloom filter using the library murmurhash3 with parameters provided below
2. Check if websites are nsfw websites using the is-porn library and a blacklist of nsfw websites provided in blacklist.js
3. Remove the nsfw websites from the list
4. Write cleaned list of video websites to file cleaned_video_websites.json
******************************************************************************/

const fs = require('fs');
const isPorn = require('is-porn');
const { BloomFilter } = require('./bloom.js');
const { blacklist } = require('./blacklist.js');
const blacklistSet = new Set(blacklist);

// Bloom filter parameters
const n = blacklistSet.size; // number of domains
const p = 0.0001; // 1 in 10'000 false positives
const k = 5; // number of hash functions

// Set debug mode
const logToConsole = true;

// Read list of video websites provided by Downie from file video_websites.json
const websites = JSON.parse(fs.readFileSync('video_websites.json', 'utf8'));

// create bloom filter
const bloomFilter = new BloomFilter(n, p, k);

const isDomainBlacklisted = (domain) => {
    return bloomFilter.lookup(domain);
}

// add domains to bloom filter
if (logToConsole) console.log("BUILDING BLOOM FILTER...");
let i = 1;
blacklistSet.forEach((domain) => {
    bloomFilter.add(domain);
    if (logToConsole) console.log(i, domain);
    i++;
});

// check if websites are porn websites
const checkWebsites = async () => {
    if (logToConsole) console.log(`CHECKING ${websites.length} VIDEO WEBSITES...`);
    let j = 1;
    for (let i = 0; i < websites.length; i++) {
        const website = websites[i];
        try {
            let status = true;
            status = await new Promise((resolve, reject) => {
                isPorn(website.host, (error, status) => {
                    if (error) {
                        // nslookup fails
                        resolve(true);
                    } else {
                        resolve(status);
                    }
                });
            });
            if (!status && !isDomainBlacklisted(website.host)) status = false;
            if (status) {
                if (logToConsole) console.log(j, website.name, website.host);
                websites.splice(i, 1);
                j++;
            }
        } catch (error) {
            console.error("Error checking website:", error);
        }
    }
    // write video websites to file
    if (logToConsole) console.log(`SAVING ${websites.length} VIDEO WEBSITES...`);
    let data = JSON.stringify(websites, null, 2);
    fs.writeFile('cleaned_video_websites.json', data, (err) => {
        if (err) throw err;
        if (logToConsole) console.log('Data written to file');
    });
    // print bloom filter parameters
    if (logToConsole) console.log('BLOOM FILTER PARAMETERS:');
    if (logToConsole) console.log('number of domains:', n);
    if (logToConsole) console.log('false positive rate:', p);
    if (logToConsole) console.log('bloom filter size:', bloomFilter.size);
    if (logToConsole) console.log('number of hash functions:', bloomFilter.hashCount);
}

checkWebsites();
