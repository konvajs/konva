var numTests = 0;
var testCounter = null;
var before, after;

function startTimer() {
    var date = new Date();
    before = date.getTime();
}
function endTimer(str) {
    var date = new Date();
    after = date.getTime();
    var diff = after - before;
    console.log(str + ': ' + diff + 'ms');
}
function test(condition, message, warn) {
    if(!condition) {
        testCounter.style.backgroundColor = 'red';
        testCounter.style.color = 'black';
        throw new Error(message);
    }
    numTests++;

    testCounter.innerHTML = numTests;
}
function warn(condition, message) {
    if(!condition) {
        if(testCounter.style.backgroundColor != 'red') {
            testCounter.style.backgroundColor = 'orange';
            testCounter.style.color = 'black';
        }
        console.warn(message);

    }
    numTests++;
    testCounter.innerHTML = numTests;
}
function testDataUrl(actual, key, message) {
    var expected = dataUrls[key];

    if(actual !== expected) {
        if(testCounter.style.backgroundColor != 'red') {
            testCounter.style.backgroundColor = 'orange';
            testCounter.style.color = 'black';
        }
        console.warn(message + ' (NOTE: use Google Chrome for data url comparisons, run on web server for caching and filtering)');
    }
    numTests++;
    testCounter.innerHTML = numTests;
}
function testJSON(actual, expected, message) {

    if(actual !== expected) {
        if(testCounter.style.backgroundColor != 'red') {
            testCounter.style.backgroundColor = 'orange';
            testCounter.style.color = 'black';
        }
        console.warn(message + ' (NOTE: use Google Chrome for data url comparisons, run on web server for caching and filtering)');

        console.log('actual:');
        console.log(actual);
        console.log('expected:');
        console.log(expected);
    }
    numTests++;
    testCounter.innerHTML = numTests;
}
function log(message) {
    console.log('LOG: ' + message);
}

function showHit(layer) {
    layer.hitCanvas._canvas.style.position = 'relative';
	document.body.appendChild(layer.hitCanvas._canvas);
}

function Test() {
    this.counter = 0;
    testCounter = document.createElement('div');
    testCounter.id = 'testCounter';
    document.getElementsByTagName('body')[0].appendChild(testCounter);
}

Test.Modules = {};

Test.prototype = {
    addTestContainer: function(key) {
        var row = document.createElement('div');
        var container = document.createElement('div');
        var testMessage = document.createElement('p');

        container.id = key;

        document.body.appendChild(testMessage);
        row.appendChild(container);
        row.className = 'row';
        document.body.appendChild(row);

        return {
            testMessage: testMessage
        };
    },
    run: function() {

        var testOnlySpecial = false;

        var modules = Test.Modules;

		// loop through modules
        for(var mod in modules) {
            var tests = modules[mod];
            /*
             * if a test key has a star in front of it, then
             * only run special tests.  This lets us easily run
             * specific tests without running all of them
             */
            for(var key in tests) {
                if(key.charAt(0) === '*') {
                    testOnlySpecial = true;
                    break;
                }
            }
        };

		// loop through modules
        for(var mod in modules) {
        	console.log('=================== ' + mod + ' TESTS ===================');

            var tests = modules[mod];

			// loop through tests
            for(var key in tests) {
                if(key.charAt(0) !== '!' && (!testOnlySpecial || key.charAt(0) === '*')) {
                    var obj = this.addTestContainer(key);
                    this.counter++;
                    console.log(this.counter + ') ' + mod + ' - ' + key);
                    tests[key](key);
                    obj.testMessage.innerHTML = this.counter + ') ' + mod + ' - ' + key + ': PASSED';
                    obj.testMessage.setAttribute('class', 'gray');
                }
            }


        }

        console.log('=================== ASYNC OUTPUT ===================');
    }
};
