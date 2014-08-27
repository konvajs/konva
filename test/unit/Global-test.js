suite('Global', function() {

    // ======================================================
    test('test Kinetic version number', function() {
        assert.equal(Kinetic.version, 'dev');
    });

    // ======================================================
    test('_addName', function() {
        Kinetic._addName("node1", "single");
        assert.equal(Kinetic.names.single[0], "node1");

        Kinetic._addName("node2", "double item");
        assert.equal(Kinetic.names.double[0], "node2");
        assert.equal(Kinetic.names.item[0], "node2");

        Kinetic._addName("node3", "  extra   spaces  ");
        assert.equal(Kinetic.names.extra[0], "node3");
        assert.equal(Kinetic.names.spaces[0], "node3");

        Kinetic._addName("node4", "another item");
        assert.equal(Kinetic.names.another[0], "node4");
        assert.equal(Kinetic.names.item.length, 2);
        assert.equal(Kinetic.names.item[0], "node2");
        assert.equal(Kinetic.names.item[1], "node4");
    });

    // ======================================================
    test('getAngle()', function() {
        // test that default angleDeg is true
        assert.equal(Kinetic.angleDeg, true);
        assert.equal(Kinetic.getAngle(180), Math.PI);

        Kinetic.angleDeg = false;
        assert.equal(Kinetic.getAngle(1), 1);

        // set angleDeg back to true for future tests
        Kinetic.angleDeg = true;
    });
    
    
    // ======================================================
    test('UA tests', function() {
    
        var ua;
        
        // Chrome 34.0.1847.137 m
        ua = Kinetic._parseUA('Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/34.0.1847.137 Safari/537.36');
    
        assert.equal(ua.browser, 'chrome');
        assert.equal(ua.mobile, false);
        assert.equal(ua.version, '34.0.1847.137');
        assert.equal(ua.ieMobile, false);
        
        
        // Internet Explorer 9
        ua = Kinetic._parseUA('Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)');
        assert.equal(ua.browser, 'msie');
        assert.equal(ua.mobile, false);
        assert.equal(ua.version, '9.0');            
        assert.equal(ua.ieMobile, false);
        
        // Internet Explorer 10
        ua = Kinetic._parseUA('Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; Trident/6.0)');
        assert.equal(ua.browser, 'msie');
        assert.equal(ua.mobile, false);
        assert.equal(ua.version, '10.0');   
        assert.equal(ua.ieMobile, false);
        
        // Internet Explorer 10 Mobile (Windows Phone 8)
        ua = Kinetic._parseUA('Mozilla/5.0 (compatible; MSIE 10.0; Windows Phone 8.0; Trident/6.0; IEMobile/10.0; ARM; Touch; NOKIA; Lumia 920)');
        assert.equal(ua.browser, 'msie');
        assert.equal(ua.mobile, true);
        assert.equal(ua.version, '10.0');       
        assert.equal(ua.ieMobile, true); // <-- forces Kinetic mouse events to be Kinetic touch events instead
        
        // Internet Explorer 11 Mobile (Windows Phone 8.1)
        ua = Kinetic._parseUA('Mozilla/5.0 (Windows Phone 8.1; ARM; Trident/7.0; Touch; rv:11; IEMobile/11.0; NOKIA; Lumia 928) like Gecko');
        assert.equal(ua.browser, 'mozilla');
        assert.equal(ua.mobile, true);
        assert.equal(ua.version, '11');
        assert.equal(ua.ieMobile, true); // <-- forces Kinetic mouse events to be Kinetic touch events instead
        
        // Internet Explorer 11 on 64-bit Windows 8.1 with Update
        ua = Kinetic._parseUA('Mozilla/5.0 (Windows NT 6.3; WOW64; Trident/7.0; rv:11.0) like Gecko');
        assert.equal(ua.browser, 'mozilla');
        assert.equal(ua.mobile, false);
        assert.equal(ua.version, '11.0');       
        assert.equal(ua.ieMobile, false);   
        
        // Windows 8.1 with Update HTML/JS appx
        ua = Kinetic._parseUA('Mozilla/5.0 (Windows NT 6.3; Win64; x64; Trident/7.0; .NET4.0E; .NET4.0C; .NET CLR 3.5.30729; .NET CLR 2.0.50727; .NET CLR 3.0.30729; Tablet PC 2.0; MSAppHost/2.0; rv:11.0) like Gecko');
        assert.equal(ua.browser, 'mozilla');
        assert.equal(ua.mobile, false);
        assert.equal(ua.version, '11.0');
        assert.equal(ua.ieMobile, false);
        
    
    }); 
    

    
    
});
