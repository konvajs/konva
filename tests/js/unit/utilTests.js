Test.Modules.UTIL = {
    'getRGB()': function() {
       var rgb = {};

       // color strings
       rgb = Kinetic.Util.getRGB('red');
       test(rgb.r === 255, 'color string r should be 255');
       test(rgb.g === 0, 'color string g should be 0');
       test(rgb.b === 0, 'color string b should be 0');

       rgb = Kinetic.Util.getRGB('pink');
       test(rgb.r === 255, 'color string r should be 255');
       test(rgb.g === 192, 'color string g should be 192');
       test(rgb.b === 203, 'color string b should be 203');

       // hex
       rgb = Kinetic.Util.getRGB('#00ff00');
       test(rgb.r === 0, 'hex r should be 0');
       test(rgb.g === 255, 'hex g should be 255');
       test(rgb.b === 0, 'hex b should be 0');

       // rgb color string
       rgb = Kinetic.Util.getRGB('rgb(255, 192, 203)');
       test(rgb.r === 255, 'rgb string r should be 255');
       test(rgb.g === 192, 'rgb string g should be 192');
       test(rgb.b === 203, 'rgb string b should be 203');

       // default
       rgb = Kinetic.Util.getRGB('not a color');
       test(rgb.r === 0, 'default r should be 0');
       test(rgb.g === 0, 'default g should be 0');
       test(rgb.b === 0, 'default b should be 0');
    }
};