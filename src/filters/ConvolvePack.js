(function() {

    var convolve_internal = function(imageData,matrix,result){
        // Input data
        var pixels = imageData.data,
            imageSizeX = imageData.width,
            imageSizeY = imageData.height,
            nPixels = imageSizeX*imageSizeY,
            pixel;

        // An array for storing the result
        // (this should now be passed as the 3rd argument)
        // var result = [];
        // result.length = imageSizeX*imageSizeY*4;

        // Determine the size and demsionality of the matrix
        // Note: it should be square and odd (3,5,7,9 etc...)
        var matrixSizeX = matrix.length,
            matrixSizeY = matrix[0].length,
            matrixMidX = Math.floor(matrix.length/2),
            matrixMidY = Math.floor(matrix[0].length/2);

        // Accumlators and positions for iterating
        var r,g,b,a, x,y, px,py, pos, i,j;

        // Handle the 2D matrix
        for( y=0; y<imageSizeY; y+=1){
            for( x=0; x<imageSizeX; x+=1){

                // Perform the convolution
                r = 0; g = 0; b = 0; a = 0;
                for( i=0; i<matrixSizeX; i+=1){
                    for( j=0; j<matrixSizeY; j+=1){

                        // tile the image to account for pixels past the
                        // edge (and make sure they are positive)
                        px = (x+i-matrixMidX) % imageSizeX;
                        px = (px>0)?px:-px;
                        py = (y+i-matrixMidY) % imageSizeY;
                        py = (py>0)?py:-py;

                        // get the pixel and convolve
                        pos = (py*imageSizeX + px)*4;
                        r += matrix[j][i]*pixels[pos+0];
                        g += matrix[j][i]*pixels[pos+1];
                        b += matrix[j][i]*pixels[pos+2];
                        //a += matrix[j][i]*pixels[pos+3];
                    }
                }

                // Store the result
                pos = (y*imageSizeX+x)*4;
                result[pos+0] = r;
                result[pos+1] = g;
                result[pos+2] = b;
                //result[pos+3] = a;
            }
        }

        // copy the result to the original canvas
        // Should now be handled by the CALLER using the `result` argument
        //var lastPos = nPixels*4;
        //for( pos=0; pos<lastPos; pos+=4 ){
        //     pixels[pos+0] = result[pos+0];
        //     pixels[pos+1] = result[pos+1];
        //     pixels[pos+2] = result[pos+2];
        //     //pixels[pos+3] = result[pos+3];
        //}
    };

    // Definition of a gaussian function
    var gaussian = function(x,mean,sigma){
        var dx = x - mean;
        return Math.pow(Math.E, -dx*dx / (2*sigma*sigma));
    };

    var make_blur_kernel = function( size, scale, sigma ){

        // make sure size is odd:
        if( size % 2 === 0 ){ size += 1; }

        // Generate the kernel, we can just multiply 2 single dimensional
        // gaussians to get a 2D guassian
        var kernel = [], i,j, row;
        for( i=0; i<size; i+=1 ){
            row = [];
            for( j=0; j<size; j+=1 ){
                row.push( scale * gaussian(i,size/2,sigma) * gaussian(j,size/2,sigma) );
            }
            kernel.push(row);
        }

        return kernel;
    };

    var make_edge_detect_kernel = function( size, scale, sigma ){

        // make sure size is odd:
        if( size % 2 === 0 ){ size += 1; }

        // Create a difference-of-gaussians kernel (by subtracting gaussians)
        // 1.6 is a good sigma ratio to approximate a laplacian of gaussian 
        var kernel = [], i,j, row, g;
        for( i=0; i<size; i+=1 ){
            row = [];
            for( j=0; j<size; j+=1 ){
                g1 = gaussian(i,size/2,sigma) * gaussian(j,size/2,sigma);
                g2 = gaussian(i,size/2,sigma*1.6) * gaussian(j,size/2,sigma*1.6);
                row.push( scale * (g2-g1) );
            }
            kernel.push(row);
        }

        return kernel;   
    };

    var make_soft_blur_kernel = function( size, percent ){
        // A soft blur is achieve by blurring the image then
        // merging the blured and unblurred image (ie 60/40).
        // Instead of that we've scaling the blur kernel (ie 60)
        // and adding the identity scaled (ie 40) to the kernel
        var kernel = make_blur_kernel( size, percent, 1 ),
            mid = Math.floor(size/2);
        kernel[mid][mid] += 1-percent;
        return kernel;
    };

    var make_unsharp_kernel = function( size, percent ){
        // An 'unsharp mask' is made by blurring the inverted image
        // and combining it with the original (like a soft blur but
        // with the blur negated). We can achieve this by negating 
        // blur kernel, and adding twice the identity to that kernel.
        var kernel = make_blur_kernel( size, -percent, 1 ),
            mid = Math.floor(size/2);
        kernel[mid][mid] += 1+percent;
        return kernel;
    };

    Kinetic.Node.addFilterGetterSetter(Kinetic.Image, 'filterAmount', 50);
    /**
     * get the current filter amount
     * @name getFilterAmount
     * @method
     * @memberof Kinetic.Image.prototype
     */

    /**
     * set the current filter amount 0 = no filter, 100 = max filter
     * @name setFilterAmount
     * @method
     * @memberof Kinetic.Image.prototype
     */



    Kinetic.Node.addFilterGetterSetter(Kinetic.Image, 'filterConvolutionMatrix', 0);
    /**
     * get the current convolution matrix.
     * @name getFilterConvolutionMatrix
     * @method
     * @memberof Kinetic.Image.prototype
     */

    /**
     * set the current convolution matrix, can be a single dimensional array
     *  or a 2D array. A 1D array will be applied horizontally then flipped
     *  and applied vertically. A 2D array will be applied as-is. The array
     *  dimensions should be odd (ie 3x3, 5x5, 7, etc...)
     * @name setFilterConvolutionMatrix
     * @method
     * @memberof Kinetic.Image.prototype
     */

    /**
     * unsharp mask
     * @function
     * @memberof Kinetic.Filters
     * @param {Object} imageData
     */
    Kinetic.Filters.UnsharpMask = function(imageData) {
        // Create a temporary image for the result, perform the convolution
        // then copy the result back
        var result = this.getCanvas().getContext('2d').createImageData(imageData.width,imageData.height);
        convolve_internal(imageData,
            make_unsharp_kernel(5,this.getFilterAmount()/100),
            result
        );
        this.getCanvas().getContext('2d').putImageData(result,0,0);
    };

    /**
     * soft blur
     * @function
     * @memberof Kinetic.Filters
     * @param {Object} imageData
     */
    Kinetic.Filters.SoftBlur = function(imageData) {
        var result = this.getCanvas().getContext('2d').createImageData(imageData.width,imageData.height);
        convolve_internal(imageData,
            make_soft_blur_kernel(5,this.getFilterAmount()/100),
            result
        );
        this.getCanvas().getContext('2d').putImageData(result,0,0);
    };


    /**
     * edge detection filter, makes edges more noticable
     * @function
     * @memberof Kinetic.Filters
     * @param {Object} imageData
     */
    Kinetic.Filters.Edge = function(imageData) {
        var s = this.getFilterAmount()/100;
        if( s === 0 ){ return; }
        var matrix = [
            [ 0,  -1*s, 0],
            [-1*s,(1-s)+4*s,-1*s],
            [ 0,  -1*s, 0]
        ];
        var result = this.getCanvas().getContext('2d').createImageData(imageData.width,imageData.height);
        convolve_internal(imageData,matrix,result);
        this.getCanvas().getContext('2d').putImageData(result,0,0);
    };

    /**
     * emboss
     * @function
     * @memberof Kinetic.Filters
     * @param {Object} imageData
     */
    Kinetic.Filters.Emboss = function(imageData) {
        var s = this.getFilterAmount()/100;
        if( s === 0 ){ return; }
        var matrix = [
            [-1*s,-0.5*s, 0],
            [-0.5*s,1+0.5*s, 0.5*s],
            [ 0,    0.5*s, 1*s]
        ];
        var result = this.getCanvas().getContext('2d').createImageData(imageData.width,imageData.height);
        convolve_internal(imageData,matrix,result);
        this.getCanvas().getContext('2d').putImageData(result,0,0);
    };

})();
