var demoApplication = demoApplication || {};

app.localStorage = (function(a) {
    function setObject(key, obj) {
        var jsonObj = JSON.stringify(obj);
        window.localStorage.setItem(key, jsonObj);
    };
    
    function getObject(key) {
        var jsonObj = window.localStorage.getItem(key);
        var obj = JSON.parse(jsonObj);
        return obj;
    };
    
    return {
        setObject: setObject,
        getObject: getObject
    }
})(demoApplication);