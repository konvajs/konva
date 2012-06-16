var numTests = 0;
var testCounter = null;

function test(condition, message, dataUrlTest) {
    if(!condition) {
        if(dataUrlTest) {
            console.warn(message + ' (NOTE: use Google Chrome for data url comparisons)');
        }
        else {
            throw new Error(message);
        }
    }
    numTests++;

    testCounter.innerHTML = numTests;
}
function log(message) {
    console.log("LOG: " + message);
}
/**
 * Test constructor
 */
function Test() {
    this.counter = 0;
    testCounter = document.createElement('div');
    testCounter.id = 'testCounter';
    document.getElementsByTagName('body')[0].appendChild(testCounter);
}
/**
 * Test methods
 */
Test.prototype = {
    addTestContainer: function(key) {
        var row = document.createElement('div');
        var container = document.createElement('div');
        var testMessage = document.createElement('p');

        container.id = key;

        document.body.appendChild(testMessage);
        row.appendChild(container);
        row.className = "row";
        document.body.appendChild(row);

        return {
            testMessage: testMessage
        };
    },
    run: function() {
        var tests = this.tests;

        var testOnlySpecial = false;

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

        for(var key in tests) {
            if(!testOnlySpecial || key.charAt(0) === '*') {
                var obj = this.addTestContainer(key);
                this.counter++;
                console.log(this.counter + ") " + key);
                tests[key](key);
                obj.testMessage.innerHTML = this.counter + ") " + key + ': PASSED';
                obj.testMessage.setAttribute("class", "green");
            }
        }
    }
};
