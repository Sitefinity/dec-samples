var demoApplication = demoApplication || {};

demoApplication.posts = (function(app) {
    var posts = [{
            id: 1,
            title: 'Quantum brings the power of touch to businesses with the new tablet "Axion"',
            overview: "A division of Quantum Inc., today announced the general availability of its new business tablet, the Axion, designed for today's innovative, business user in need of added functionality, performance and reliability.",
            text: "A division of Quantum Inc., today announced the general availability of its new business tablet, the Axion, designed for today's innovative, business user in need of added functionality, performance and reliability. Building on the success of its predecessor, the Axion Tablet is full performance including the latest technologies. With its compact design and 7–inch diagonal LED backlit display, the Axion Tablet is easy to carry to and from the classroom and is designed to sustain the typical bumps and spills thanks to Quantum's security technology. The Axion Tablet comes in configurations with Titanium Silver. Multi-Touch and Feature Rich: Axion is equipped to handle any task. A unique finish helps reduce fingerprints and improves grip. Continuing to provide unique organizational tools and easy access to content, Quantums and ReelTime software offer the latest in Toshiba innovation.",
            imageUrl : "images/posts/better-multitasking(p1).png",
            likesCount: 2,
            commentsCount: 3,
            author: "John Doe",
            createdOn: new Date(new Date().setDate(new Date().getDate() - 0)).toISOString(),
            likes: [{
                            userId: 1,
                            likes: true
                        }
            ],
            comments: [{
                            authorName: "Svetla Yankova", 
                            authorImageUrl: 'images/users/anonymous.png',
                            text: "That's great news!",
                            createdOn: new Date(new Date().setHours(new Date().getHours() - 1)).toISOString()
                        },{
                            authorName: "Admin",    
                            authorImageUrl: 'images/users/anonymous.png',
                            text: "I can confirm, we are shipping with Win8",
                            createdOn: new Date(new Date().setHours(new Date().getHours() - 1)).toISOString()
                        },{
                            authorName: "Svetla",    
                            authorImageUrl: 'images/users/anonymous.png',
                            text: "I hope they get to release the Windows 8 version!",
                            createdOn: new Date(new Date().setHours(new Date().getHours() - 1)).toISOString()
                        }
            ]       
        }, {
            id: 2,
            title: "Quantum launches new business notebook 'Gluon'",
            overview: "Quantum today reiterated its commitment to green values with a brand new notebook Gluon that blends the wonders of natural design with cutting edge notebook computing and stylish mobility.",
            text: "Quantum today reiterated its commitment to green values with a brand new notebook Gluon that blends the wonders of natural design with cutting edge notebook computing and stylish mobility. The new Gluon reconciles users’ need for computing power and connectivity with their desire to lead sustainability. Gluon features highly durable aluminum texture covers that offer a personal touch and a unique look in blue. The inclusion of exclusive Quantum ArcticCool technology provides users with an extra-comfortable typing experience, as palm rests remain cool at all times. The premium aluminum textures used on the covers serve a dual purpose. They resist wear and tear to retain their luster even over extended product cycles, while at the same time conveying a business-like but nonetheless stylish attitude with choice of brown and silver. For consumers interested in a classic notebook look, the new Gluon presents a solid balance of design and performance.",
            imageUrl : "",
            likesCount: 1,
            commentsCount: 0,
            author: "John Doe",
            createdOn: new Date(new Date().setDate(new Date().getDate() - 0)).toISOString(),
            likes: [],
            comments: []
        }, {
            id: 3,
            title: "Quantum releases a new gaming laptop 'Magnon'",
            overview: "The new Quantum Magnon is like no other gaming notebook. Eschewing the flash and gimmicks typical of gaming notebooks, the Magnon instead boasts an understated, subtly aggressive design inspired by the magma.",
            text: "The new Quantum Magnon is like no other gaming notebook. Eschewing the flash and gimmicks typical of gaming notebooks, the Magnon instead boasts an understated, subtly aggressive design inspired by the magma. At its heart lies the most powerful components available today, including the latest Intel® Core™ i7 processor and up to 8GB of DDR3 system memory. Far from being merely cosmetic, every facet of the Magnon’s design reflects a conscious effort to improve the user experience. For example, the placement of all the heat and noise-generating components at the rear of the notebook and the implementation of a unique twin rear venting system keep the heat and noise as far away from the user as possible. The innovative placement of components also allows the palm rest to be exceptionally thin, just like a desktop keyboard. Furthermore, the keyboard plane is inclined 5 degrees, improving ergonomics and thus ensuring optimal comfort while gaming and typing.",
            imageUrl : "images/posts/magnon-for-gamers(p3).png",
            likesCount: 1,
            commentsCount: 0,
            author: "John Doe",
            createdOn: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
            likes: [{
                        userId: 1,
                        likes: true
                    }],
            comments: []
        }, {
            id: 4,
            title: "Quantum announces new 'Photon'",
            overview: "The new Quantum Photon is designed for business professionals always on the move. A compact and portable laptop at an affordable price, the Photon provides the performance and functionality for everyday tasks.",
            text: "The new Quantum Photon is designed for business professionals always on the move. A compact and portable laptop at an affordable price, the Photon provides the performance and functionality for everyday tasks. The Photon introduces a 13.3-inch diagonal widescreen display to the Quantum notebook family. It comes equipped with Windows® 7 Professional and Windows XP Professional downgrade media, Intel® Core™ 2 Duo processor T65701, 1GB ultrafast DDR3 memory2 and a wealth of other features that make mobile computing more effective and convenient. It takes advantage of the built-in touch capabilities of the operating system, making everyday interactions simple and intuitive. Now, users can easily scroll through Web pages and documents with the touch of a finger. Instead of pointing and clicking, users can quickly tap to launch programs and open files. The laptops also include various Quantum applications, which help users more easily find and organize information.",
            imageUrl : "images/posts/great-performance(p4).png",
            likesCount: 1,
            commentsCount: 0,
            author: "John Doe",
            createdOn: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
            likes: [],
            comments: []
        }
    ];

    var getAllPosts = function() {
        var promise = new RSVP.Promise(function(resolve, reject) {
            resolve(JSON.parse(JSON.stringify(posts)));
        });
        
        return promise;
    };
    
    var getPostById = function(postId) {
        var post;
        
        var promise = new RSVP.Promise(function(resolve, reject) {
            for (var i = 0; i < posts.length; i++) {
                if (posts[i].id == postId) {
                    post = posts[i];
                    break;
                }
            }
            
            if (post) {
                resolve(post);
            } else {
                reject({error: "No such post"});
            }
        });
        
        return promise;
    };
    
    var addComment = function(postId, text) {
        return getPostById(postId).then(function(post) {
            var comments = post.comments;
            var nextId = comments.length
            var currentUser = demoApplication.users.getLoggedInUser();
            var newComment = {
                id: nextId,
                authorId: currentUser.id,
                authorName: currentUser.firstName + " " + currentUser.lastName,        
                authorImageUrl: currentUser.imageUrl,
                text: text,
                createdOn: new Date().toISOString()
            };
            comments.unshift(newComment);
            post.commentsCount = comments.length;
            
            return newComment;
        });
    };
   
    var toggleUserLike = function(postId) {
        return getPostById(postId).then(function(post) {
            var currentUser = demoApplication.users.getLoggedInUser();
            var likeObj;
            for (var i = 0; i < post.likes.length;i++) {
                if (post.likes[i].userId == currentUser.id) {
                    likeObj = post.likes[i];           
                    break;
                }
            }

            if (likeObj) {
                likeObj.likes = !likeObj.likes;
                
                if (likeObj.likes) {
                    post.likesCount++;
                } else {
                    post.likesCount--;
                }
            } else {
                post.likesCount++;
                likeObj = { userId: currentUser.id, likes: true };
                post.likes.push(likeObj);
            }
           
            return { 
                post: post, 
                userLike: likeObj 
            };
        });      
    };
    
    var checkIfCurrentUserLikesPost = function(post){
        var currentUserId = app.users.getLoggedInUser().id;
        var likeData = app.utils.findFirstThat(post.likes, function(likeObj) { return likeObj.userId == currentUserId }) || {}; 
        
        return likeData && likeData.likes === true;
    }
    
    return {
        getAll: getAllPosts,
        getById: getPostById,
        addComment: addComment,
        toggleUserLike: toggleUserLike,
        checkIfCurrentUserLikesPost: checkIfCurrentUserLikesPost
        
    };
})(demoApplication)