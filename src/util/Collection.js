(function() {
    /**
     * Collection constructor.  Collection extends
     *  Array.  This class is used in conjunction with get()
     * @constructor
     */
    Kinetic.Collection = function() {
        var args = [].slice.call(arguments), length = args.length, i = 0;

        this.length = length;
        for(; i < length; i++) {
            this[i] = args[i];
        }
        return this;
    }
    Kinetic.Collection.prototype = new Array();
    /**
     * iterate through node array
     * @name each
     * @methodOf Kinetic.Collection.prototype
     * @param {Function} func
     */
    Kinetic.Collection.prototype.each = function(func) {
        for(var n = 0; n < this.length; n++) {
            func(this[n], n);
        }
    };

    Kinetic.Collection.mapMethods = function(arr) {
        var leng = arr.length,
            n;
            
        for(n = 0; n < leng; n++) {
            // induce scope
            (function(i) {
                var method = arr[i];
                Kinetic.Collection.prototype[method] = function() {
                    var len = this.length,
                        i;
                        
                    args = [].slice.call(arguments);
                    for(i = 0; i < len; i++) {
                        this[i][method].apply(this[i], args);
                    }        
                };
            })(n);
        }
    };
})();
