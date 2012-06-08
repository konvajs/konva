var numTests = 0;
var testCounter = null;

function test(condition, message) {
    if(!condition) {
        throw new Error(message);
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
    //this.testOnly = 'EVENTS - mousedown mouseup mouseover mouseout mousemove click dblclick / touchstart touchend touchmove tap dbltap';
    this.testOnly = '';
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

        for(var key in tests) {
            if(!this.testOnly || (this.testOnly && this.testOnly == key)) {
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
