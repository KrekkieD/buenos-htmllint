# Buenos Htmllint!

A NodeJS wrapper around the [htmllint](https://www.npmjs.com/package/htmllint) HTML code linter, for your convenience.

Part of the buenos linting family: [buenos-jshint](https://www.npmjs.com/package/buenos-jshint), [buenos-jscs](https://www.npmjs.com/package/buenos-jscs), [buenos-htmllint](https://www.npmjs.com/package/buenos-htmllint).

## Installing

```
$ npm install --save-dev buenos-htmllint
```

## Usage

### In a node file

```
var $buenosHtmllint = require('buenos-htmllint');

$buenosHtmllint(options);
```

### From your package.json

```json
{
    "scripts": {
        "buenos-htmllint": "buenos-htmllint"
    }
}
```

```bash
$ npm run buenos-htmllint
```

## Options

```javascript
{

    /**
     * Optional. Array of reporters. Each reporter is called with the htmllint results
     */
    reporters: [
    
        // a reporter can be an array where key 0 is the function 
        [ someFunction ],
        
        // a reporter can also be given a config variable
        [ someFunction, optionalConfig ],
        
        // a reporter may also be a direct function, not wrapped in an array
        someFunction,
        
        // default value:
        [ $buenosHtmllint.reporter, { path: './reports/buenos-htmllint.json' }]
        
    ],
    
    
    /**
     * Optional. Globs using minimatch. default value:
     */
    src: [
        './**/*.html',
        '!./node_modules/**/*'
    ],
        
    
    /**
     * Optional. Htmllint rules. May be:
     * - a file path to the rules json
     * - an object containing the rules
     * When left out it will follow this order to get its config:
     * - any parent package.json with a htmllintConfig property
     * - a .htmllintrc file in file folder or up
     * - a .htmllint.json file in file folder or up
     * - embedded config
     */
    htmllintConfig: './myConfig.json'
}
```

## API

### BuenosHtmllint (class)

```
var $buenosHtmllint = require('buenos-htmllint');

var instance = new $buenosHtmllint();
```

#### .log

The log object containing the status of the checked files.

#### .options

The parsed options object.

#### .promise

A promise that is resolved when the linter is complete. The `log` is provided as argument.

```
var $buenosHtmllint = require('buenos-htmllint');

var instance = new $buenosHtmllint();
instance.promise.then(function (log) {
    // done processing!
    console.log(log);
});
```

### reporter

The default reporter. Useful in case you want to combine your own reporter with the default reporter.

```
var $buenosHtmllint = require('buenos-htmllint');

new $buenosHtmllint({
    reporters: [
        [ $buenosHtmllint.reporter, { path: './reports/buenos-htmllint.json' }],
        myReporter
    ]
});
```

### embeddedConfig

Returns the htmllint config as embedded in the module.

```
var $buenosHtmllint = require('buenos-htmllint');

console.log(
    $buenosHtmllint.embeddedConfig()
);
```

## Reporters

You can specify your own reporters. A reporter is called as a function, the first argument being the `log`, the
second argument being the reporter config (if defined).

```
var $buenosHtmllint = require('buenos-htmllint');

new $buenosHtmllint({
    reporters: [
    
        // function, no config can be defined
        reporterWithoutConfig,
        
        // array of function, no config defined 
        [ reporterWithoutConfig ],
        
        // array of function and config obj
        [ reporterWithConfig, { myConfig: 'defined' } ]
    ]
});

function reporterWithoutConfig (log, config) {
    
    // log = $buenosHtmllint.log
    // config = undefined
    
}


function reporterWithConfig (log, config) {
    
    // log = $buenosHtmllint.log
    // config = { myConfig: 'defined' };
    
}
```

### Log format

```
{
    
    // how many files are checked?
    "totalCount": 1,
    
    // how many total errors were found?
    "totalErrorCount": 1,
        
    // how many files passed?
    "successCount": 0,

    // how many files failed?
    "failureCount": 1,

    // object of files checked
    "files": {
    
        // file name
        "index.js": {
        
            // where did the htmllint config come from?
            "htmllintConfig": "embedded", // embedded, custom, or file path
            
            // how many errors were found in this file?
            "errorCount": 1,
            
            // array of errors found in this file
            "errors": [
                {
                    "line": 2, // line of error
                    "column": 1, // column of error
                    "code": "E025", // error code returned by linter function
                    "data": {}, // relevant data for the error
                    "rule": "html-req-lang", // offending rule
                    "filename": "./test/srcFiles/index.html", // file in which the error occured
                    "message": "html element should specify the language of the page" // error message
                }
            ],
            
            // did the file pass the check?
            "passed": false
        }
    }
}
```
