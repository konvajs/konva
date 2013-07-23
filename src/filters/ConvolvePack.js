(function() {

    var convolve_internal = function(imageData,matrix){
        // Input data
        var pixels = imageData.data,
            imageSizeX = imageData.width,
            imageSizeY = imageData.height,
            nPixels = imageSizeX*imageSizeY,
            pixel;

        // An array for storing the result
        var result = [];
        result.length = imageSizeX*imageSizeY*4;

        // Determine the size and demsionality of the matrix
        // Note: it should be square and odd (3,5,7,9 etc...)
        var is2D = (matrix[0].length > 0) || 0,
            matrixSizeX = matrix.length,
            matrixSizeY = matrix.length;

        // Make sure we don't try to access pixels outside the image
        var xMax = Math.floor(imageSizeX - matrixSizeX/2),
            xMin = Math.floor(matrixSizeX/2),
            yMax = Math.floor(imageSizeY - matrixSizeY/2),
            yMin = Math.floor(matrixSizeY/2);

        // Accumlators and positions for iterating
        var r,g,b,a, x, y, pos, i,j;

        // Handle the 2D matrix
        if( is2D ){
            for( y=yMin; y<yMax; y+=1){
                for( x=xMin; x<xMax; x+=1){
    
                    // Perform the convolution
                    r = 0; g = 0; b = 0; a = 0;
                    for( i=0; i<matrixSizeX; i+=1){
                        for( j=0; j<matrixSizeY; j+=1){
                            pos = ((y+j)*imageSizeX+x+i)*4;
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
        }
        // Handle the 1D matrix
        else{

            // Horizontal pass (ie convolving every row of the image)
            for( y=0; y<imageSizeY; y+=1){
                for( x=xMin; x<xMax; x+=1){
                    pos = (y*imageSizeX+x)*4;
    
                    // Perform the convolution
                    r = 0; g = 0; b = 0; a = 0;
                    for( j=0; j<matrixSizeX; j+=1){
                        pos += 4;
                        r += matrix[j]*pixels[pos+0];
                        g += matrix[j]*pixels[pos+1];
                        b += matrix[j]*pixels[pos+2];
                        //a += matrix[j]*pixels[pos+3];
                    }

                    // Multiply by 1/2 because the other 1/2 comes from the vertical pass
                    pos = (y*imageSizeX+x)*4;
                    result[pos+0] = r*0.5;
                    result[pos+1] = g*0.5;
                    result[pos+2] = b*0.5;
                    //result[pos+3] = a*0.5;
                }
            }

            // Vertical pass (ie convolving every column of the image)
            for( x=0; x<imageSizeX; x+=1){
                for( y=yMin; y<yMax; y+=1){
                    pos = (y*imageSizeX+x)*4;
    
                    // Perform the convolution
                    r = 0; g = 0; b = 0; a = 0;
                    for( j=0; j<matrixSizeX; j+=1){
                        pos += 4*imageSizeX;
                        r += matrix[j]*pixels[pos+0];
                        g += matrix[j]*pixels[pos+1];
                        b += matrix[j]*pixels[pos+2];
                        //a += matrix[j]*pixels[pos+3];
                    }
    
                    // Multiply by 1/2 and add to horizontal pass results
                    pos = (y*imageSizeX+x)*4;
                    result[pos+0] += r*0.5;
                    result[pos+1] += g*0.5;
                    result[pos+2] += b*0.5;
                    //result[pos+3] += a*0.5;
                }
            }
        }

        // copy the result to the original canvas
        var lastPos = nPixels*4;
        for( pos=0; pos<lastPos; pos+=4 ){
             pixels[pos+0] = result[pos+0];
             pixels[pos+1] = result[pos+1];
             pixels[pos+2] = result[pos+2];
             //pixels[pos+3] = result[pos+3];
        }
    };

    // Definition of a gaussian function
    var gaussian = function(x,mean,sigma){
        var dx = x - mean;
        return Math.pow(Math.E, -dx*dx / (2*sigma*sigma));
    };

    var make_blur_kernel = function( size, scale ){

        // make sure size is odd:
        if( size % 2 === 0 ){ size += 1; }

        // Generate the kernel, we can just multiply 2 single dimensional
        // gaussians to get a 2D guassian
        var kernel = [], i,j, row;
        for( i=0; i<size; i+=1 ){
            row = [];
            for( j=0; j<size; j+=1 ){
                row.push( scale * gaussian(i,size/2,1) * gaussian(j,size/2,1) );
            }
            kernel.push(row);
        }

        return kernel;
    };

    var make_soft_blur_kernel = function( size, blur_percent ){
        // A soft blur is achieve by blurring the image then
        // merging the blured and unblurred image (ie 60/40).
        // Instead of that we've scaling the blur kernel (ie 60)
        // and adding the identity scaled (ie 40) to the kernel
        var kernel = make_blur_kernel( size, blur_percent / 100 ),
            mid = Math.floor(size/2);
        kernel[mid][mid] += 1 - (blur_percent/100);
        return kernel;
    };

    var make_unsharp_kernel = function( size, unsharp_percent ){
        // An 'unsharp mask' is made by blurring the inverted image
        // and combining it with the original (like a soft blur but
        // with the blur negated). We can achieve this by negating 
        // blur kernel, and adding twice the identity to that kernel.
        var kernel = make_blur_kernel( size, -blur_percent / 100 ),
            mid = Math.floor(size/2);
        kernel[mid][mid] += 2;
        return kernel;
    };

    /**
     * general convolution
     * @function
     * @memberof Kinetic.Filters
     * @param {Object} imageData
     * @author ippo615
     */
    Kinetic.Filters.Convolve = function(imageData) {
        convolve_internal(imageData,this.getFilterConvolutionMatrix());
    };

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
        convolve_internal(imageData,
            make_unsharp_kernel(
                this.getFilterSoftBlurSize(),
                this.getFilterSoftBlurAmount()
            )
        );
    };

    /**
     * soft blur
     * @function
     * @memberof Kinetic.Filters
     * @param {Object} imageData
     */
    Kinetic.Filters.SoftBlur = function(imageData) {
        convolve_internal(imageData,
            make_soft_blur_kernel(
                this.getFilterSoftBlurSize(),
                this.getFilterSoftBlurAmount()
            )
        );
    };

    Kinetic.Node.addFilterGetterSetter(Kinetic.Image, 'filterSoftBlurAmount', 60);
    /**
     * get the soft blur amount
     * @name getFilterSoftBlurAmount
     * @method
     * @memberof Kinetic.Image.prototype
     */

    /**
     * set the soft blur amount. 0 = no blur, 100 = full blur
     * @name setFilterSoftBlurAmount
     * @method
     * @memberof Kinetic.Image.prototype
     */

    Kinetic.Node.addFilterGetterSetter(Kinetic.Image, 'filterSoftBlurSize', 3);
    /**
     * get the soft blur size
     * @name getFilterSoftBlurSize
     * @method
     * @memberof Kinetic.Image.prototype
     */

    /**
     * set the soft blur size in number of pixels
     * @name setFilterSoftBlurSize
     * @method
     * @memberof Kinetic.Image.prototype
     */

    /**
     * sharpening filter, makes edges more pointed
     * @function
     * @memberof Kinetic.Filters
     * @param {Object} imageData
     */
    Kinetic.Filters.Sharpen = function(imageData) {
        convolve_internal(imageData,[
            [ 0,-2, 0],
            [-2, 9,-2],
            [ 0,-2, 0]
        ]);
    };

    /**
     * mean removal
     * @function
     * @memberof Kinetic.Filters
     * @param {Object} imageData
     */
    Kinetic.Filters.RemoveMean = function(imageData) {
        convolve_internal(imageData,[
            [-1,-1,-1],
            [-1, 9,-1],
            [-1,-1,-1]
        ]);
    };

    /**
     * emboss
     * @function
     * @memberof Kinetic.Filters
     * @param {Object} imageData
     */
    Kinetic.Filters.Emboss = function(imageData) {
        convolve_internal(imageData,[
            [-2,-1, 0],
            [-1, 1, 1],
            [ 0, 1, 2]
        ]);
    };

    /**
     * detects horizontal edges 
     * @function
     * @memberof Kinetic.Filters
     * @param {Object} imageData
     */
    Kinetic.Filters.DetectHorizontalEdges = function(imageData) {
        convolve_internal(imageData,[
            [-1,-1,-1],
            [ 2, 2, 2],
            [-1,-1,-1]
        ]);
    };

    /**
     * detects vertical edges 
     * @function
     * @memberof Kinetic.Filters
     * @param {Object} imageData
     */
    Kinetic.Filters.DetectVerticalEdges = function(imageData) {
        convolve_internal(imageData,[
            [-1, 2,-1],
            [-1, 2,-1],
            [-1, 2,-1]
        ]);
    };

    /**
     * detects 45* angle edges 
     * @function
     * @memberof Kinetic.Filters
     * @param {Object} imageData
     */
    Kinetic.Filters.DetectDiagonal45Edges = function(imageData) {
        convolve_internal(imageData,[
            [-1,-1, 2],
            [-1, 2,-1],
            [ 2,-1,-1]
        ]);
    };

    /**
     * detects 135* angle edges 
     * @function
     * @memberof Kinetic.Filters
     * @param {Object} imageData
     */
    Kinetic.Filters.DetectDiagonal135Edges = function(imageData) {
        convolve_internal(imageData,[
            [ 2,-1,-1],
            [-1, 2,-1],
            [-1,-1, 2]
        ]);
    };

    /**
     * detects edges 
     * @function
     * @memberof Kinetic.Filters
     * @param {Object} imageData
     */
    Kinetic.Filters.DetectEdges = function(imageData) {
        convolve_internal(imageData,[
            [-1,-1,-1],
            [-1, 8,-1],
            [-1,-1,-1]
        ]);
    };

})();
