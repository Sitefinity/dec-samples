var demoApplication = demoApplication || {};

demoApplication.postComments = (function(app) {
    var post;    
    var viewModel = kendo.observable({});
    
    var initDOMElementOnPageEnter = function(e) {
        e.view.footer.find(".add-comment-textarea").val("");
        e.view.footer.find(".add-comment-textarea").show();
    };
    
    var removeDomElementsOnPageLeave = function(e) {
        e.view.footer.find(".add-comment-textarea").hide();
    };
    
    var intialzeCommentsDataSource = function(postId) {
        var commentsDataSource = new kendo.data.DataSource({
            transport: {
                read: function(options) {
                    app.posts.getById(postId).then(function(postDetails) {
                        options.success(postDetails.comments);
                    });
                }
            }
        });
        viewModel.set("allComments", commentsDataSource);
        viewModel.set("postId", postId);
    };
    
    var addComment = function() {
        var userInput = app.mobileApp.view().footer.find(".add-comment-textarea").val();
        app.mobileApp.view().footer.find(".add-comment-textarea").val("");
        var postId = viewModel.get("postId");
        
        app.posts.addComment(postId, userInput).then(function(justAddedComment) {
            var commentsDataSource = viewModel.get("allComments");
            commentsDataSource.insert(0, justAddedComment);            
            app.listPosts.refreshDataSourceCommentsCount(postId, commentsDataSource.data().length);
            
            app.tracking.writeSentence(app.tracking.predicates.commentOn, post.title);
        });
    }
    
    var init = function(e) {
        var postId = e.view.params.postId;
        if(!post){
            app.posts.getById(postId).then(function(postDetails) {
                post = postDetails;
            }).then(function(){
                app.tracking.writeSentence(app.tracking.predicates.viewComments, post.title);
            }); 
        }
        else{
            app.tracking.writeSentence(app.tracking.predicates.viewComments, post.title);
        }
        
        kendo.bind(e.view.element, viewModel);
        intialzeCommentsDataSource(postId);
        initDOMElementOnPageEnter(e);
    };
    
    var hide = function(e) {
        removeDomElementsOnPageLeave(e);
    }
    
    return {
        init: init,
        hide: hide,
        addComment: addComment
    };
})(demoApplication)