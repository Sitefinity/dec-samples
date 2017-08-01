## Overview
The purpose of this application is to demonstrate how the [Progress Sitefinity Digital Experience Cloud JavaScript SDK](http://docs.sitefinity.com/dec/leverage-the-javascript-sdk-to-capture-client-side-behavior) (version [1.2.2](https://decsitefinitycdn.blob.core.windows.net/sdk/telerik-dec-client.min.1.2.2.js)) could be used to personalization for a web application. The UI is developed within the context of Bootstrap (Narrow Jumbotron Template) with simple HTML and Javascript. The application follows a very simple structure. It consists of three major examples for custom personalization - by persona, by campaign and by lead scoring.

## DEC SDK Initialization
The first thing one has to do to start using the DEC JavaScript SDK is to create a instance with options object that contains the following information:
- **source** - represents the data-source that belongs to specific data center. In our case it is set to QuantumDecDemo(only for the sample needs). This value identifies the data collected by this demo application.
- **subjectKey** - represents the subject that is to be used in each data collection call or personalization call.
- **apiKey** - the API key associated with the data-center that is being targeted. 
- **authToken** - passed as Authorization header. This token is intended to be used by an application so it can authorize in from of the personalization end-points. You can get construct such a token by concatenating the "appauth " string with the apiKey of your datacenter, for example: "appauth 97e8b2d2-93ce-cd01-b47b-076a201eab11".
- **autoTracking** - this indicates whether the user interaction data like button presses should be pushed automatically to the server.

## Personalization
The UI has three buttons, if you click someone of them it will send a request for custom personalization by the specific area. You can find the code for that calls are in the bottom of the HTML file in the last script tag. Each of the buttons have some simple logic to visualize the personalization response. 
The JavaScript SDK provides a functionality for personalization by:
- [persona](http://docs.sitefinity.com/dec/personas-profile-your-audience) - Use _isInPersonas(scoringIds, doneCallback, failCallback, subjectKey)_ method. Returns a list of ScoringResults describing the threshold, score and scoringId.
- [campaign](http://docs.sitefinity.com/dec/campaigns-define-and-track) - Use _isInCampaigns(campaignIds, doneCallback, failCallback)_ method. Returns a collection of objects indicating whether the client is in the requested campaigns.
- [lead scoring](http://docs.sitefinity.com/dec/lead-scoring-align-marketing-and-sales) - Use _isInLeads(scoringIds, contactsDetails, doneCallback, failCallback)_ method. Based on a collection of clients data-sources and subjects and collection of leads ids, it return information on whether a given client has scored or passed any level for each of the specified leads.

## How to use the Digital Experience Cloud JS SDK Personalization client
Please refer to [this wiki article](https://github.com/Sitefinity/dec-samples/wiki/DEC-JS-SDK-Personalization-Client) for further information on that topic. 