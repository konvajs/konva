function test(condition, message) {
    if(!condition) {
        throw new Error(message);
    }
}
function log(message) {
    console.log("LOG: " + message);
}
/**
 * Test constructor
 */
function Test() {
    this.testOnly = 'EVENTS - star pixel detection';
    this.counter = 0;
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
