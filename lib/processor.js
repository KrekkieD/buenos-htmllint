'use strict';

var $findConfig = require('./findConfig');

var $path = require('path');
var $fs = require('fs');

var $globby = require('globby');
var $q = require('q');
var $htmllint = require('htmllint');


module.exports = Processor;

function Processor (buenosHtmllint) {

    var self = this;

    self.checkPath = checkPath;
    self.checkFile = checkFile;

    function checkPath () {

        return $globby(buenosHtmllint.options.src)
            .then(function (files) {

                var deferreds = [];

                files.forEach(function (file) {
                    deferreds.push(checkFile(file));
                });

                return $q.allSettled(deferreds);

            });

    }

    function checkFile (file) {

        var deferred = $q.defer();

        $fs.readFile(file, function (err, dataBuffer) {

            if (err) {
                throw err;
            }

            var htmllintConfig = buenosHtmllint.options.htmllintConfig || $findConfig(file);

            $htmllint(dataBuffer.toString(), htmllintConfig.config)
                .then(
                function (htmllintData) {

                    // decorate errors
                    htmllintData.forEach(
                        function (issue) {
                            issue.filename = file;
                            issue.message = $htmllint.messages.renderIssue(issue);

                        }
                    );

                    var fileLog = logFileProcessed(
                        file, {
                            htmllintConfig: htmllintConfig.source,
                            errorCount: htmllintData.length,
                            errors: htmllintData || []
                        }
                    );

                    return fileLog.passed ? deferred.resolve() : deferred.reject();

                }, function (err) {
                    throw err;
                }
            ).done();

        });


        return deferred.promise;

    }

    function logFileProcessed (filePath, result) {

        buenosHtmllint.log.totalCount++;

        var fileDisplayName = $path.relative('.', filePath).split($path.sep).join('/');

        if (result.errorCount === 0) {
            result.passed = true;
            buenosHtmllint.log.successCount++;
        }
        else {
            buenosHtmllint.log.totalErrorCount += result.errorCount;
            result.passed = false;
            buenosHtmllint.log.failureCount++;
        }

        buenosHtmllint.log.files[fileDisplayName] = result;

        return result;

    }

}
