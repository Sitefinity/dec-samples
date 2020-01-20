using System;
using Telerik.DigitalExperienceCloud.Client;

namespace Telerik.DEC.LeadScoringEventClientSample
{
    class Program
    {
        static void Main(string[] args)
        {
            // Please enter your application access key
            string applicationAccessKey = "";
            AppAccessToken token = new AppAccessToken(Guid.Parse(applicationAccessKey));

            // Please enter your API key
            string dataCenterApiKey = "";

            int checkIntervalInSeconds = 120;
            using (ILeadScoringEventClient client = new LeadScoringEventClient(token, dataCenterApiKey, checkIntervalInSeconds))
            {
                // Always use the Subscribe method that allows you to plug in your custom error handling logic.
                client.Subscribe(ProcessLeadScoringThresholdPasses, ErrorHandler);

                int intervalInMinutes = TimeSpan.FromSeconds(checkIntervalInSeconds).Minutes;
                Console.WriteLine($"Waiting for {intervalInMinutes} minutes to receive Lead Scoring Threshold Passes. Pres any key to stop and exit");
                Console.ReadLine();

                Console.WriteLine("Unsubscribing from the LeadScoringEventClient. Waiting for pending operations to complete.");
                client.Unsubscribe();
                Console.WriteLine("Pending operations complete.");
            }
        }

        private static void ProcessLeadScoringThresholdPasses(ILeadScoringEventClient sender, LeadScoringThresholdPassesInfo leadScoringThresholdPassesInfo)
        {
            Console.WriteLine();
            Console.WriteLine($"{DateTime.Now.ToString()} => Receiving Lead Scoring Threshold Passes...");

            foreach (LeadScoringThresholdPass thresholdPass in leadScoringThresholdPassesInfo.ThresholdPasses)
            {
                Console.WriteLine($"Lead '{thresholdPass.LeadName}' for contact '{thresholdPass.ContactEmail}' has passed threshold '{thresholdPass.ThresholdName}' on '{thresholdPass.ThresholdPassedOn}'");
            }
        }

        private static void ErrorHandler(ILeadScoringEventClient client, ThresholdPassCallbackErrorInfo errorInfo)
        {
            // TODO: add your custom code to handle exceptions
            Console.WriteLine($"An error has occurred while checking for new threshold passes: {errorInfo.Exception.ToString()}");

            // Mark the error as handled if you wish for the client to continue working even after an error occurs
            // If you do not do this, the client will stop reporting new threshold passes when after an error.
            errorInfo.Handled = true;

            // In case you deem the error critical and want to stop the threshold passes polling, mark the error as not handled
            // errorInfo.Handled = false;
        }
    }
}
