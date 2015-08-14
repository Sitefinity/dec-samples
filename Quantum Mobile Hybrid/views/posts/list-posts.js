var demoApplication = demoApplication || {};

demoApplication.listPosts = (function(app) {
    var dataReadRequired = false;
    
    var postsDataSource = new kendo.data.DataSource({
        transport: {
            read: function(options) {
                app.posts.getAll().then(function(posts) {
                    for (var i = 0; i < posts.length; i++) {
                        posts[i].isPersonalizationBanner = false;
                    }
                    
                    return posts;
                }).then(function(posts) {
                    var personalizationBanner = app.personalizationProvider.getPersonalizationBanner();
                    personalizationBanner.createdOn = posts[0].createdOn;
                    posts.splice(1, 0, personalizationBanner);
                    
                    return posts;                    
                })
                .then(function(posts){
                    for (var i = 0; i < posts.length; i++) {
                        posts[i].date = posts[i].createdOn.split("T")[0];
                    }
                    
                    return posts;
                })
                .then(function(posts) {
                    options.success(posts);
                });
            }
        },
        group: { field: "date", dir: "desc" }
    });
    
    var viewModel = kendo.observable({});
    
    var init = function(e) {
        app.tracking.trackPageOpen("all posts");
        app.devicePage.maintainDeviceUpdatesBadge();
        
        kendo.bind(e.view.element, viewModel);

        if (dataReadRequired === true) {
            var listView = $("#post-list").data('kendoMobileListView');
            postsDataSource.read();
            listView.refresh();
            dataReadRequired = false;
        }
    };
    
    var refreshDataSourceItemAfterLike = function(postId, post) {
        var allPosts = postsDataSource.data();
        for (var i = 0; i < allPosts.length; i++) {
            if (allPosts[i].id == postId) {
                allPosts[i].set("likesCount", post.likesCount);
                allPosts[i].set("likes", post.likes);
            }
        }
    };
    
    var refreshDataSourceCommentsCount = function(postId, commentsCount){
        var allPosts = postsDataSource.data();
        for (var i = 0; i < allPosts.length; i++) {
            if (allPosts[i].id == postId) {
                allPosts[i].set("commentsCount", commentsCount);
            }
        }
    };
    
    var toggleUserLike = function(e) {
        var postId = $(e.button).data("postid")
        app.posts.toggleUserLike(postId).then(function(likeResult) {
            var post = likeResult.post;
            var userLike = likeResult.userLike;
            refreshDataSourceItemAfterLike(post.id, post);
            
            app.tracking.writeSentence(userLike.likes ?  app.tracking.predicates.like : app.tracking.predicates.doNotLike, post.title, [{ V: "Author", post: post.author }]);
        });
    };
    
    var signalDataReloadNeeded = function() {
        dataReadRequired = true;
    };
    
    var showMockCall = function(phoneNumber) {
        demoApplication.tracking.writeSentence(demoApplication.tracking.predicates.call, phoneNumber);
        $(".mock-call-modal .phone-number-span").text(phoneNumber);
        $(".mock-call-modal").data("kendoMobileModalView").open();
    };
    
    var closeMockCall = function() {
        $(".mock-call-modal").data("kendoMobileModalView").close();
    }
        
    return {
        init: init,
        allPosts: postsDataSource,
        toggleUserLike: toggleUserLike,
        refreshDataSourceItemAfterLike: refreshDataSourceItemAfterLike,
        refreshDataSourceCommentsCount: refreshDataSourceCommentsCount,
        signalDataReloadNeeded: signalDataReloadNeeded,
        showMockCall: showMockCall,
        closeMockCall: closeMockCall
    };
})(demoApplication)