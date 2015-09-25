'use strict';

var $fs = require('fs');
var $path = require('path');

var $sortedObject = require('sorted-object');
var $mkdirp = require('mkdirp');
var $colors = require('colors');

module.exports = reporter;

function reporter (log, options) {

    $mkdirp.sync($path.relative('.', $path.dirname(options.path)));

    // sort the files object by key for more consistent output
    var files = log.files;
    log.files = $sortedObject(files);

    $fs.writeFileSync(options.path, JSON.stringify(log, null, 4));

    console.log('');
    console.log($colors.yellow('BuenosHtmllint') + ' Code Style results:\n');

    if (log.totalErrorCount === 0) {
        console.log($colors.green('    ' + [
            'Checked',
            log.totalCount,
            'files, all files passed with no errors.'
        ].join(' ')));
    }
    else {
        console.log($colors.red('    ' + [
            'Checked',
            log.totalCount,
            'files, found a grand total of',
            log.totalErrorCount,
            'errors in',
            log.failureCount,
            'files\n'
        ].join(' ')));

        console.log('Error summary:\n');

        // show first few errors in log, that'll help
        var logPreviewLines = 10;
        var moreInLog = false;

        Object.keys(log.files).forEach(function (filename) {

            var lintResult = log.files[filename];
            if (lintResult.errorCount > 0) {

                // abort if we used all the preview lines
                if (!logPreviewLines) {
                    moreInLog = true;
                    return;
                }

                console.log('    File: ' + $colors.bold(filename) + ', ' + lintResult.errorCount + ' errors');

                lintResult.errors.forEach(function (error) {

                    // abort if we used all the preview lines
                    if (!logPreviewLines) {
                        moreInLog = true;
                        return;
                    }

                    logPreviewLines--;
                    console.log('        ' + [
                        '#' + error.line + ':' + error.column,
                        error.message,
                        $colors.dim('(' + error.rule + ')')
                    ].join(' '));

                });

            }
        });

        if (moreInLog) {
            console.log('        ...\n    > More errors can be viewed in the report');
        }
        else {

        }

        console.log('');

    }


    console.log('    Report written to ' + $path.relative('.', options.path));

}
