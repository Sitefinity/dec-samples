# Overview #
The purpose of this application is to demonstrate how the Sitefinity Insight JavaScript SDK could be used to instrument data tracking and personalization for a hybrid mobile application developed within the context of the Telerik Platform.

# Application Structure #
The application follows a simple structure. It consists of 4 major area – the Login form, the Feeds page (along with the detailed feed view, a social share view, search view, comments view), Devices page (along with details view), and a Profile page. The view and view-models for those pages are located in a folder named views and are further separated by folders depending with which major area they belong. 

You will also notice there is a scripts folder.  The most interesting file there is the *tracking.js* which is actually a very simple wrapper around the Sitefinity Insight JavaScript SDK to make it more easily accessible where it is needed within the application. We will discuss it more thoroughly later on.

In the scripts folder you could also find the *devices.js*, *the posts.js*, the *users.js* and the *personalization-provider.js* files which represent a mocked data access layer. Normally those could be actual service calls that access a remove service to retrieve and manipulate the data used by the application. In our case they are much simplified to serve the purposes of the demo scenarios. There is also the *share.js* file which is a mocked substitute for a social sharing functionality. 

# Sitefinity Insight SDK Initialization #
The first thing one has to do to start using the Sitefinity Insight JavaScript SDK is to initialize it properly. The code that actually demonstrate that part is located in the *script/tracking.js* file in a function named *initialize()*. Please notice that a new *sfDataIntell.Client(options)* object is created (which is the actual Sitefinity Insight JavaScript SDK client). The options object contains the following information:


1. a *source* property - represents the data-source the data belongs to. In our case it is set to QuantumInsightDemo. This value identifies the data collected by this demo application.
2. a *subjectKey* property - represents the subject that is to be used in each data collection call or personalization call. If this is not set, the JavaScript SDK will generate and use a guid-like string in stead.
3. *authToken* - passed as *Authorization* header. This token is intended to be used by an application so it can authorize in from of the personalization end-points. You can get construct such a token by concatenating the "appauth " string with the apiKey of your datacenter, for example: "appauth 97e8b2d2-93ce-cd01-b47b-076a201eab11".
4. *apiKey* - the API key associated with the data-center that is being targeted.
5. *autoTracking* - this indicates whether the collected data should be buffered in the local storage and pushed to the server each 5th second. Alternatively, the collected data is to be pushed immediately.

The *initialize()* function we discussed so far is invoked when a user actually logs in the application (*views/loging/log-in.js* in the *submit()* function). Once the user is logged in we may use some piece of information the log-in service provides us with as a subject. Alternatively when speaking in the context of hybrid apps an idea could be to use the core Cordova Device Plug-in to get the user's device id and use that as a subject. In our case though we use a couple of predefined subjects - that's done as those subject actually represent contacts identified as certain personas in the test data-center making it easier to demonstrate that functionality as well. If no *subjectKey* is specified then a guid-like string will be used.

# Personalization #
Once a user has logged in successfully we could take advantage of our knowledge for that user. For example in order to target the audience better we could check if that user is identified as a given persona and if so we could personalize the content seen by that user.
 
Immediately after a user logs in the application, the just initialized JavaScript SDK is used to get the user’s persona information (*app.tracking.getClient().[personalizationClient](https://github.com/Sitefinity/dec-samples/wiki/Sitefinity-Insight-JS-SDK-Personalization-Client).isInPersonas* method is called) - that is again located in the *views/login/log-in.js* file in the *submit()* function. The first parameter passed to the *isInPersonas* method is an array of integer ids. Those are the ids of the personas being processed in the demo datacenter. The result is a JSON that contains information for each persona for which a given user has scored any points – not necessarily meaning that the user has passed the threshold for that persona. That information consists of the amount of points the user has scored within that persona and the amount of points the user needs to score in total to be identified as that persona (to pass the threshold). In order to make sure that a user is identified as the persona you have to compare the user’s score and the personas threshold score. Also, have in mind that multiple personas could be returned for a given user – that is the case the user has scored some points for multiple persona scorings – then what you could do is to find the best one (the one that has best user score to threshold ratio) and use that one. In both case – the personalization behavior is up to you. 

Once this information is available to us we attach it to the object that represent the currently logged in user in the demo application. Knowing that allows us to visualize specific content that may best interest the current user.

Generally speaking the user’s persona information could be used to personalize any element of the demo application. The personalization scenario demonstrated in this mobile app can be seen on the Feeds page (the first page to be displayed after a successful log in) where between the first and the second feed record a personalization banner specific to the currently log-in user is displayed. Please notice that if you log in with the username that is by default populated in the log-in form (username: joe@black.com) that user is going to be identified as the Business persona and a specific banner will appear for that user. Also you could then logout and log-in with a username john@doe.com and notice that the user will be recognized as the Gamer persona and a different banner will be presented targeting that audience. 

Tracking and personalizing a mobile application give us some opportunities. You will notice that the personalization banners display a call button so the user could directly give you a call.

Implementation-wise, you will notice that in the *views/posts/list-posts.js* file creates a new Kendo datasource. In its read method a personalization provider is used (*app.personalizationProvider.getPersonalizationBanner()*) to determine what personalized information should be displayed for the currently logged in user.  The personalized information in our case is the banner that appears as a second element in listed feeds. Once we have it, we insert in the correct place in the Kendo datasource.
The personalization provider (*scripts/personalization-provider.js*) itself, in its *getPersonalizationBanner()* method does the following:


1. it gets the currently log-in user
2. it gets the user’s personas – in our demo scenario the users does not actually change personas so  those are resolved once the user is logged in but if you expect users to change personas more often you could make additional calls to the *isInPersonas()* method more often. Additionally, the Sitefinity Insight JavaScript SDK could return multiple personas for a given user – then what you could do is to find the best one (the one that has best user score to threshold ratio) and use that one if it makes sentence to you.
3. It returns a personalization banner information – this is done based on the user’s personas. Currently we chose from a set of predefined banners but we could also utilize some other means to get dynamically changing content.

# Data Collection #
As mentioned before the Sitefinity Insight JavaScript SDK related code is wrapped in the *scripts/tracking.js* file. You will notice that it contains a method that is named *writeSentence()*. A sentence actually consists of a subject, a predicate and an object. For example:  {"S":533,"P":"open","O":"Quantum releases a new gaming laptop 'Magnon'"}. It also may contain subject metadata and/or object metadata that provides further information on the subject or the object. The *writeSentence()* method is executed in various places in the application to track the user behavior in that format.

Please note that the *autoTracking* is set to true – you could see that in the *initialze()* method. This means that the Sitefinity Insight JavaScript SDK is going to buffered the data in local storage, aggregate it and push it to the server with a single call. Given that the demo application could run on an actual device it could happen that the application is put into the background. We could decide to react on that situation. Taking advantage of the pause event (http://cordova.apache.org/docs/en/2.5.0/cordova_events_events.md.html#pause) provided by Cordova, we could instruct the Sitefinity Insight JavaScript SDK to try push the data it has collection so far (as shown in the app.js).

## Tracking user log-ins ##
You could see the related code in the *views/login/log-in.js* and the *scripts/tracking.js* files - the *trackLogin()* method. At the point we call that method the initialization has already happened so we have successfully resolved a subject for that user – be it a device id, a piece of information provided by the login service or a new guid. In our case, the login service actually provide us with some more interesting information as well such as the user first and last names, phone number and gender. The *trackLogin()* method also attaches that information to the data it tracks providing you with more detailed and useful information on your users ending up in a service call with a body similar to the following:

[{
	"S": 533,
	"P": "login",
	"O": "hybrid-demo-application",
	"SM": [{
		"K": "Email",
		"V": "joe@black.com"
	},
	{
		"K": "FirstName",
		"V": "Joe"
	},
	{
		"K": "LastName",
		"V": "Black"
	},
	{
		"K": "Phone",
		"V": "8569-523-963"
	},
	{
		"K": "Gender",
		"V": "female"
	}]
}]

## Tracking phone calls ##
As mentioned we give the user the opportunity to directly contact you through a call. Tracking that is easy. In a *views/posts/list-posts.html* you will notice that is a div element with class *sf-insightbanner*. Clicking on the a element within that div (regardless of whether the application runs on an actual device or in a simulator) we will end-up calling the *writeSentence()* from the scripts/tracking.js file which results in the following sentence {"S":533,"P":"call","O":"+1 855 QUANTUM"}.

## Tracking opening pages ##
There is a *trackPageOpen()* method in the *scripts/tracking.js* file. Each time a view is displayed it calls an init method – that is defined in the view elements themselves by specifying a data-show attribute, for example: *data-show="demoApplication.listPosts.init"*. That pattern is followed in all the views. In those *init* methods you will notice that the *trackPageOpen()* is invoked – for example - *app.tracking.trackPageOpen(postDetails.title)*. In up to 5 seconds that will result in the following sentence being tracked: {"S":533,"P":"open","O":"Quantum brings the power of touch to businesses with the new tablet \"Axion\""}.

## Tracking search ##
Please notice that from the Feeds page you could navigate to the Search page through a button located in the top right corner. Once there you could fill the search box and press enter (if you are in the simulator) or the device specific search button (if the application is running on a device). Doing that will result in the following service call: {"S":533,"P":"search","O":"axi"}. That is again done through the *writeSentence()* method - *app.tracking.writeSentence*(*app.tracking.predicates.search, criteria);*. You could see the exact code in the *views/posts/search-post.js*.

## Tracking social sharing ##
Sharing functionality is available to the page related with each individual feed (*views/posts/post-details.js*). For the demonstration purposes the social sharing implementation is mocked (located in the *scripts/share.js* file) but you could easily enough utilize the SocialSharing Cordova plugin (https://github.com/Telerik-Verified-Plugins/SocialSharing). What is interesting here though is that we could track that user interaction with the same ease – we just need to call the *writeSentence()* method - *app.tracking.writeSentence(app.tracking.predicates.share, postDetails.title)*.

## Tracking like/dislike ##
Liking and disliking a feed is again just a matter of calling the *writeSentence()*. This functionality is available through the Feeds (*views/posts/list-post.js*) page and though the page related with each individual Feed page (*views/posts/post-details.js*) where you should be able to find a line similar to that one:  *app.tracking.writeSentence(userLike.likes ?  app.tracking.predicates.like : app.tracking.predicates.doNotLike, post.title, [{ V: "Author", post: post.author }]);*.

## Tracking comments ##
Much like the liking functionality, a button linking to the comments page is available from the Feeds page and from the page related with each individual feed. Once a user navigates to that page we track that interaction: {"S":533,"P":"view comments","O":"Quantum brings the power of touch to businesses with the new tablet \"Axion\""}. If a user actually posts a comment then the following sentence is posted to Sitefinity Insight: {"S":533,"P":"comment on","O":"Quantum brings the power of touch to businesses with the new tablet \"Axion\""}. Implementation-wise, nothing different here – if you open the comments page (*views/posts/post-comments.js*) you will notice that *writeSentence()* method is called here as well. 

## Tests ##
At this point of time two tests scenarios are covered using the Mobile Testing. Those tests aim to assure that a connection to the Sitefinity Insight services is established and personalization takes place. The following test cases are available:

1. Log-in with the default user -> assert that the Business personalization banner is present on the Feeds page.
2. Log-in with random user -> assert that a Default personalization banner is present on the Feeds page.
 
# Summary #
Looking through this sample should give you an idea how you could use the Sitefinity Insight JavaScript SDK for hybrid app development.  It should clarify how to initialize the SDK with the correct set of options. Content personalization based on the Persona Profiling feature is also covered. It also demonstrates how to plug tracking code in various places that could be interesting for you – for example – tracking phone calls shown in the personalization banners, social sharing tracking and various events in the pages. 

---

###### Copyright © 2020 Progress Software Corporation and/or one of its subsidiaries or affiliates. All rights reserved.

---