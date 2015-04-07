suite('Global', function() {

    // ======================================================
    test('test Konva version number', function() {
        assert.equal(!!Konva.version, true);
    });

    // ======================================================
    test('getAngle()', function() {
        // test that default angleDeg is true
        assert.equal(Konva.angleDeg, true);
        assert.equal(Konva.getAngle(180), Math.PI);

        Konva.angleDeg = false;
        assert.equal(Konva.getAngle(1), 1);

        // set angleDeg back to true for future tests
        Konva.angleDeg = true;
    });
    
    
    // ======================================================
    test('UA tests', function() {
    
        var ua;
        
        // Chrome 34.0.1847.137 m
        ua = Konva._parseUA('Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/34.0.1847.137 Safari/537.36');
    
        assert.equal(ua.browser, 'chrome');
        assert.equal(ua.mobile, false);
        assert.equal(ua.version, '34.0.1847.137');
        assert.equal(ua.ieMobile, false);
        
        
        // Internet Explorer 9
        ua = Konva._parseUA('Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0)');
        assert.equal(ua.browser, 'msie');
        assert.equal(ua.mobile, false);
        assert.equal(ua.version, '9.0');            
        assert.equal(ua.ieMobile, false);
        
        // Internet Explorer 10
        ua = Konva._parseUA('Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; Trident/6.0)');
        assert.equal(ua.browser, 'msie');
        assert.equal(ua.mobile, false);
        assert.equal(ua.version, '10.0');   
        assert.equal(ua.ieMobile, false);
        
        // Internet Explorer 10 Mobile (Windows Phone 8)
        ua = Konva._parseUA('Mozilla/5.0 (compatible; MSIE 10.0; Windows Phone 8.0; Trident/6.0; IEMobile/10.0; ARM; Touch; NOKIA; Lumia 920)');
        assert.equal(ua.browser, 'msie');
        assert.equal(ua.mobile, true);
        assert.equal(ua.version, '10.0');       
        assert.equal(ua.ieMobile, true); // <-- forces Konva mouse events to be Konva touch events instead
        
        // Internet Explorer 11 Mobile (Windows Phone 8.1)
        ua = Konva._parseUA('Mozilla/5.0 (Windows Phone 8.1; ARM; Trident/7.0; Touch; rv:11; IEMobile/11.0; NOKIA; Lumia 928) like Gecko');
        assert.equal(ua.browser, 'mozilla');
        assert.equal(ua.mobile, true);
        assert.equal(ua.version, '11');
        assert.equal(ua.ieMobile, true); // <-- forces Konva mouse events to be Konva touch events instead
        
        // Internet Explorer 11 on 64-bit Windows 8.1 with Update
        ua = Konva._parseUA('Mozilla/5.0 (Windows NT 6.3; WOW64; Trident/7.0; rv:11.0) like Gecko');
        assert.equal(ua.browser, 'mozilla');
        assert.equal(ua.mobile, false);
        assert.equal(ua.version, '11.0');       
        assert.equal(ua.ieMobile, false);   
        
        // Windows 8.1 with Update HTML/JS appx
        ua = Konva._parseUA('Mozilla/5.0 (Windows NT 6.3; Win64; x64; Trident/7.0; .NET4.0E; .NET4.0C; .NET CLR 3.5.30729; .NET CLR 2.0.50727; .NET CLR 3.0.30729; Tablet PC 2.0; MSAppHost/2.0; rv:11.0) like Gecko');
        assert.equal(ua.browser, 'mozilla');
        assert.equal(ua.mobile, false);
        assert.equal(ua.version, '11.0');
        assert.equal(ua.ieMobile, false);
        
    
    }); 
    

    
    
});
