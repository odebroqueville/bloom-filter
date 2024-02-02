# Bloom filter

This small utility was created to demonstrate how a Bloom filter can be used to filter out unsafe content from a list of websites and has been tested using a blacklist containing just over 2 million websites.

The utility checks a list of websites (stored in video_websites.json) for nsfw content and removes it using both the is-porn npm module and a Bloom filter which uses the murmurhash3 library with default settings:

- number of hash functions k = 5
- false positives rate p = 0.0001 (1 in 10'000)

The parameters for the Bloom filter can be changed in the cp.js file.

First build the blacklist to suit your needs.

Then, given a file named video_websites.json, with the structure: 
[
    {
        "host": "Domain of website",
        "name": "Name of website",
        "urlRegex": "Regex expression"
    }
]
the script cp.js will:

1. Build a bloom filter using the library murmurhash3 with parameters provided below
2. Check if websites are nsfw websites using the [is-porn](https://www.npmjs.com/package/is-porn) library and a blacklist of nsfw websites that you may create to your liking. There are many lists available on GitHub, some more recently updated than others.
3. Remove nsfw websites from list
4. Write cleaned list of video websites to file cleaned_video_websites.json

# Install
```npm i is-porn murmurhash3```

# Run
```node cp.js```

# Debug
Set the constant logToConsole to true to debug or false to silence.