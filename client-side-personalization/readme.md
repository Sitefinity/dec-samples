## Overview
The purpose of this application is to demonstrate how the [Progress Sitefinity Digital Experience Cloud JavaScript SDK](http://docs.sitefinity.com/dec/leverage-the-javascript-sdk-to-capture-client-side-behavior) (version [1.2.2](https://decsitefinitycdn.blob.core.windows.net/sdk/telerik-dec-client.min.1.2.2.js)) could be used for personalization in a web application. The UI is developed within the context of Bootstrap (Narrow Jumbotron Template) with simple HTML and Javascript. The application follows a very simple structure. It consists of three major examples for custom personalization - by persona, by campaign and by lead scoring.

## DEC SDK Initialization
The first thing one has to do to start using the DEC JavaScript SDK is to create a instance with options object that contains the following information:
- **source** - represents the data-source that belongs to specific data center. In our case it is set to QuantumDecDemo(only for the sample needs). This value identifies the data collected by this demo application.
- **subjectKey** - represents the subject that is to be used in each data collection call or personalization call. In most of the cases this is the user id. If this is left empty, the SDK will auto-generate the key.
**Note: DEC will recognise and map users together if they have different Ids but same emails and vice versa!**
- **apiKey** - the API key associated with the data-center that is being targeted. 
- **authToken** - passed as Authorization header. This token is intended to be used by an application so it can authorize in from of the personalization end-points. You can create such a token by going to "Authorized application" situated in the Administration tab of your data center. Concatenate "appauth " string with the generated access token for example: "appauth 97e8b2d2-93ce-cd01-b47b-076a201eab11".
- **trackPageVisits** - this indicates whether out-of-the-box tracking of page visits will be used.
- **instrument** - this indicates whether HTML5 instrumentation will be used.

##### Example:
```javascript
var decClient = new sfDataIntell.Client({
    source: 'QuantumDecDemo',
    subjectKey: '89071fdf-baf0-4d7a-80d2-02113b40a08c', // or leave empty to auto-generate id
    apiKey: 'f1b2f31b-eab7-475d-82ba-2135c7ab7a7e',
    authToken: 'appauth 89071fdf-baf0-4d7a-80d2-02113b40a08c',
    trackPageVisits: true,
    instrument: true
});
```
**Note:** _If HTML Instrumentation is turned on (```instrument: true```) the initialization script should be executed after the page's body is rendered!_

#### Additional configuration
The sample contains an object variable "subjectMetadata" in which you can input some sample user-specific data like names and email. This is then embedded in interaction and sent to DEC.

##### Example:
```javascript
var subjectMetadata = {
    'FirstName': 'John',
    'LastName': 'Doe',
    'Email': 'john.doe@demo.com'.
};
decClient.subjectMetadataClient.writeSubjectMetadata(subjectMetadata);
```

## DEC configuration
In order for the application sample to work, specific objects(Persona, Lead scoring, Conversion Tracking, Campaign) must be configured in the DEC Data center.

#### Persona
1. Create "Dev user" Persona with a 50 points threshold.
1. Add rule "Visit Dev documentation page"(If contacts... "Visit" -> exact match "Dev documentation page") and give 50 points "once" to the Persona.
1. Copy the Persona Id, which is visible in the url string and use it later when you want to personalize by specific Persona.

#### Lead scoring
1. Create a lead scoring type with the name "Demo".
1. Add 3 stages.
   1. Stage 1 with name "Cold leads" and Threshold of 1 point.
   1. Stage 2 with name "Engaged leads" and Threshold of 10 point.
   1. Stage 3 with name "Hot leads" and Threshold of 100 point.
1. Define the rules and how many points they will contribute to the lead scoring.
   1. Add rule "Register Account"(If contacts... "Register" -> exact match "Account") and give them 1 point "once".
   1. Add rule "Visit Product page"(If contacts... "Visit" -> exact match "Product page") and give them 10 point "once".
   1. Add rule "Download file Product"(If contacts... "Download file" -> exact match "Product") and give them 100 point "once".
1. Copy the Lead scoring Id, which is visible in the url string and use it later when you want to personalize by specific Lead scoring.

#### Conversion tracking (needed for Campaign)
1. Define a conversion report with the name "Download product demo".
1. Select interaction defining the conversion - "Download file Demo"(created the same way as the rules above).
1. Create the conversion.

#### Campaign
1. Create a campaign with name "Download demo by registered users".
1. Select a conversion for optimization - "Download product demo" conversion.
1. Go to Engage the audience and create "Visit Demo page"(created the same way as the rules above) interaction from advanced menu.
1. Narrow the audience by behaviour, check "Interacted with..." and create "Register User"(created the same way as the rules above) interaction from the advanced menu.
1. Copy the Campaign Id, which is visible in the url string and use it later when you want to personalize by specific Campaign.

## Personalization
The UI has three tabs, in each of them you can test a different kind of personalization. The code can be found at the bottom of the HTML file. It is setup to call the 3 functions every second and update the personalized area. After a successful setup you must be able to simulate different actions/interactions and see the result of those actions in the specified area of the page.
The JavaScript SDK provides a functionality for personalization by:
- [persona](http://docs.sitefinity.com/dec/personas-profile-your-audience) - Use **personalizationClient.isInPersonas(scoringIds, doneCallback, failCallback, subjectKey)** method. Returns a list of ScoringResults describing the threshold, score and scoringId.
- [campaign](http://docs.sitefinity.com/dec/campaigns-define-and-track) - Use **personalizationClient.isInCampaigns(campaignIds, doneCallback, failCallback)** method. Returns a collection of objects indicating whether the client is in the requested campaigns.
- [lead scoring](http://docs.sitefinity.com/dec/lead-scoring-align-marketing-and-sales) - Use the new **v2.personalizationClient.isInLeads(scoringIds, doneCallback, failCallback, subjectKey)** method. Based on a collection of clients data-sources and subjects and collection of leads ids, it return information on whether a given client has scored or passed any level for each of the specified leads.

## How to use the Digital Experience Cloud JS SDK Personalization client
Please refer to [this wiki article](https://github.com/Sitefinity/dec-samples/wiki/DEC-JS-SDK-Personalization-Client) for further information on that topic. 