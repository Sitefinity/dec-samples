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
                client.Subscribe(ProcessLeadScoringThresholdPasses);

                int intervalInMinutes = TimeSpan.FromSeconds(checkIntervalInSeconds).Minutes;
                Console.WriteLine("Waiting for {0} minutes to receive Lead Scoring Threshold Passes. Pres any key to stop and exit", intervalInMinutes);
                Console.ReadLine();

                Console.WriteLine("Unsubscribing from the LeadScoringEventClient. Waiting for pending operations to complete.");
                client.Unsubscribe();
                Console.WriteLine("Pending operations complete.");
            }
        }

        private static void ProcessLeadScoringThresholdPasses(ILeadScoringEventClient sender, LeadScoringThresholdPassesInfo leadScoringThresholdPassesInfo)
        {
            Console.WriteLine();
            Console.WriteLine(DateTime.Now.ToString() + " => Receiving Lead Scoring Threshold Passes...");

            foreach (LeadScoringThresholdPass thresholdPass in leadScoringThresholdPassesInfo.ThresholdPasses)
            {
                Console.WriteLine("Lead '{0}' for contact '{1}' has passed threshold '{2}' on '{3}'", thresholdPass.LeadName, 
                    thresholdPass.ContactEmail, thresholdPass.ThresholdName, thresholdPass.ThresholdPassedOn);
            }
        }
    }
}
