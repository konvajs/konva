(function () {
  Kinetic.Util._FilterWrapDoubleBuffer = function(filter,defaultOpt){
    return function(src,dst,opt) {
      // If no dst imageData is provided: make an imitation
      // blank one, the same size as the src image data
      var isOnlySrc = ! dst;
      var data = [],
        srcData = src.data,
        l = srcData.length, i;
      if( isOnlySrc ){
        dst = {
          width: src.width,
          height: src.height
        };
        for( i=0; i<l; i+=1 ){
          data.push(0);
        }
        dst.data = data;
      }

      filter.call(this, src, dst, opt || defaultOpt);

      // Copy the dst to the src if this was called the old way
      if( isOnlySrc ){
        var dstData = dst.data;
        for( i=0; i<l; i+=1 ){
          srcData[i] = dstData[i];
        }
      }
    };
  };

  Kinetic.Util._FilterWrapSingleBuffer = function(filter,defaultOpt){
    return function(src,dst,opt) {
      // If no dst imageData is provided: use the src imageData
      filter.call(this, src, dst||src, opt || defaultOpt);
    };
  };

  Kinetic.Util._FilterReplaceBuffer = function(src,dst){
    var i, l = src.length;
    for( i=0; i<l;  ){
      dst[i] = src[i]; i++;
      dst[i] = src[i]; i++;
      dst[i] = src[i]; i++;
      dst[i] = src[i]; i++;
    }
  };

})();
