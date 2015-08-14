var demoApplication = demoApplication || {};

demoApplication.postDetails = (function(app) {
    var viewModel = kendo.observable({
                                         toCommentsPage: function() {
                                             var postId = this.get("details").id;
                                             var commentsUrl = "views/posts/post-comments.html?postId=" + postId;
                                             app.mobileApp.navigate(commentsUrl);
                                         },
                                         toggleLike: function() {
                                             var that = this;
                                             var details = this.get("details"); 
                                             app.posts.toggleUserLike(details.id).then(function(likeResult) {
                                                var post = likeResult.post;
                                                var userLike = likeResult.userLike;
                                                 
                                                 details.likesCount = post.likesCount;
                                                 that.set("details", details);
                                                 that.set("likesCount", post.likesCount);

                                                 var doCurrentUserLikeThePost = app.posts.checkIfCurrentUserLikesPost(post);
                                                 that.set("userLikedClass", doCurrentUserLikeThePost ? "fa fa-heart fa-2x" : "fa fa-heart-o fa-2x"); 
                                                 
                                                 app.listPosts.refreshDataSourceItemAfterLike(post.id, post);
                                                 
                                                 app.tracking.writeSentence(userLike.likes ?  app.tracking.predicates.like : app.tracking.predicates.doNotLike, post.title, [{ V: "Author", post: post.author }]);
                                             });
                                         }
                                     });
    
    var init = function(e) {
        kendo.bind(e.view.element, viewModel);
        
        var postId = e.view.params.postId;
        app.posts.getById(postId).then(function(postDetails) {
            app.tracking.trackPageOpen(postDetails.title);
            
            viewModel.set("details", postDetails);  
            viewModel.set("likesCount", postDetails.likesCount); 
            viewModel.set("commentsCount", postDetails.commentsCount); 
            
            var shareContent = {
                subject: postDetails.title, 
                success: function() {
                    app.tracking.writeSentence(app.tracking.predicates.share, postDetails.title);
                }
            };
        
            app.share.setShareContent(shareContent);
            
            var doCurrentUserLikeThePost = app.posts.checkIfCurrentUserLikesPost(postDetails);
            viewModel.set("userLikedClass", doCurrentUserLikeThePost ? "fa fa-heart fa-2x" : "fa fa-heart-o fa-2x"); 
        }); 
    };
    
    var hide = function(e) {
        demoApplication.share.cancel();
    };

    return {
        init: init,
        hide: hide
    };
})(demoApplication)