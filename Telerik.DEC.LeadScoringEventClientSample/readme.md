# Overview

The purpose of this application is to demonstrate how the [Progress Sitefinity Digital Experience Cloud .Net SDK](https://docs.sitefinity.com/dec/api-v1/for-developers-leverage-the-net-sdk-to-capture-server-side-data-input)(version 2.0.0) could be used for subscribing to Lead Scoring Threshold passes.

## DEC SDK Initialization

In order to successfully run the sample the following variables should be filled.

- **dataCenterApiKey** - the API key associated with the data-center that is being targeted. It can be find in the Administration part of your data center under API key tab.
- **applicationAccessKey** - the access key is part of the authentication token needed for the application to authorize itself when calling DEC endpoints. Created in the Administration part of your data center under Authorized application page.
