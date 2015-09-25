'use strict';

var $reporter = require('./lib/reporter');
var $processor = require('./lib/processor');

var $path = require('path');
var $fs = require('fs');

var $extend = require('extend');

module.exports = BuenosHtmllint;
module.exports.reporter = $reporter;
module.exports.embeddedConfig = embeddedConfig;

var DEFAULT_CONFIG = {
    reporters: [
        [$reporter, { path: './reports/htmllint-report.json' }]
    ],
    src: [
        './**/*.html',
        '!./node_modules/**/*'
    ]
};

function BuenosHtmllint (options) {

    if (this instanceof BuenosHtmllint) {

        var self = this;

        self.options = _checkOptions(options);

        self.log = {
            totalCount: 0,
            totalErrorCount: 0,
            successCount: 0,
            failureCount: 0,
            errorCount: 0,
            files: {}
        };

        var processor = new $processor(self);

        self.promise = processor.checkPath()
            .then(function () {

                if (Array.isArray(self.options.reporters)) {
                    self.options.reporters.forEach(function (reporter) {

                        if (Array.isArray(reporter)) {
                            reporter[0](self.log, reporter[1]);
                        }
                        else if (typeof reporter === 'function') {
                            reporter(self.log);
                        }
                        else {
                            throw 'Reporter should be a function or array of function (and options)';
                        }

                    });
                }

                return self.log;

            });


    }
    else {
        return new BuenosHtmllint(options);
    }


    function _checkOptions (options) {

        options = $extend({}, DEFAULT_CONFIG, options || {});

        if (!options.htmllintConfig) {
            // search on the fly for each file
            options.htmllintConfig = false;
        }
        else if (typeof options.htmllintConfig === 'string') {
            // must be a path to a config file.. try to read it
            try {
                options.htmllintConfig = {
                    source: $path.resolve(options.htmllintConfig),
                    config: JSON.parse($fs.readFileSync($path.resolve(options.htmllintConfig)).toString())
                };
            } catch (e) {
                throw 'Could not read config file at ' + options.htmllintConfig;
            }
        }
        else {
            options.htmllintConfig = {
                source: 'custom',
                config: options.htmllintConfig
            };
        }

        return options;

    }

}

function embeddedConfig () {

    return JSON.parse($fs.readFileSync($path.resolve(__dirname, 'resources/defaultConfiguration.json')).toString());

}

// execute when not imported
if (!module.parent) {
    module.exports();
}
