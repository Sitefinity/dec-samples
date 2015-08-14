var demoApplication = demoApplication || {};

demoApplication.utils = (function(app) {
   
    var dateTime = {
        dateToDaysAgo: function(isoStringDatePart){
            
            var dateTimeIsoString = isoStringDatePart + "T" + new Date().toISOString().split("T")[1];
            var now = moment(new Date().toISOString());
            var dt = moment(dateTimeIsoString);
            
            if( Math.abs(dt.diff(now, "days")) < 1){
                return "Today";
            }
            
            var timesAgo = moment(dateTimeIsoString).fromNow();
            if(timesAgo === "a day ago") {
                return "Yesterday";
                
            } 
            
            return timesAgo;            
        }
    };
    
    return {
        dateTime: dateTime,
        findFirstThat: function(arr, predicate){
            
            for(var i = 0; i < arr.length; i++){
                if(predicate(arr[i])){
                    return arr[i];
                }                
            }
        }
    };
})(demoApplication)