var demoApplication = demoApplication || {};

demoApplication.searchPost = (function(app) {    
    var viewModel = kendo.observable({});
    
    var postsDataSource = new kendo.data.DataSource({
        filter: {
            field: "id",
            operator: "eq",
            value: 0
        },
        transport: {
            read: function(options) {
                app.posts.getAll().then(function(posts) {
                    options.success(posts);
                });
            }
        }
    });
    
    var init = function(e) {
       app.tracking.trackPageOpen("search page");
        kendo.bind(e.view.element, viewModel);
        
        $('.post-search-form').submit(function(e) {
            e.preventDefault(); 
        
            var criteria = $('.post-search-input').val()
            postsDataSource.filter({ field: "title", operator: "contains", value: criteria });
            
           app.tracking.writeSentence(app.tracking.predicates.search, criteria); 
        });
    };
    
    return {
        init: init,
        filteredPosts: postsDataSource
    };
})(demoApplication)