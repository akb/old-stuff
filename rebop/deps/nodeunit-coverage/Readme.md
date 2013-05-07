# nodeunit-coverage #

coverage reporter for nodeunit

## How? ##

1) Create instrumented version of your code

    node-jscoverage lib lib-cov

2) Run nodeunit with the coverage reporter 

    nodeunit --reporter ~/work/nodeunit-coverage/lib/reporter.js test/*.test.js

## Credits ##

Built for [nodeunit](http://github.com/caolan/nodeunit)

Borrowed code from [expresso](http://github.com/visionmedia/expresso/)

Is useless without [node-jscoverage](http://github.com/visionmedia/node-jscoverage)

Modified by Alexei Broner to work with node > 0.4 for rebop.