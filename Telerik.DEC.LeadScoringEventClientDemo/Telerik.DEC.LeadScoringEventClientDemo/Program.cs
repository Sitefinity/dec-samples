using System;
using System.Linq;
using Telerik.DigitalExperienceCloud.Client;

namespace Telerik.DEC.LeadScoringEventClientDemo
{
    class Program
    {
        //TODO: install the nuget from the official repo
        static void Main(string[] args)
        {
            string yourApplicationKey = "";
            AppAccessToken token = new AppAccessToken(Guid.Parse(yourApplicationKey));

            string yourDecDataCenterApiKey = "";
            int checkOnSeconds = 15;
            int pageSize = 100;
            //TODO: remove the server url after swap so Live is targeted
            string serverAddress = @"https://staging.api.dec.sitefinity.com";
            DateTime defaultFromDate = DateTime.UtcNow.AddMonths(-12);
            using (LeadScoringEventClient client = new LeadScoringEventClient(token, yourDecDataCenterApiKey, serverAddress, checkOnSeconds, pageSize, defaultFromDate))
            {
                client.Subscribe(ProcessLeadScoringThresholdPasses);

                Console.WriteLine("Waiting to receive Lead Scoring Threshold Passes. Pres any key to stop and exit");
                Console.ReadLine();

                Console.WriteLine("Unsubscribing from the LeadScoringEventClient. Waiting for pending operations to complete.");
                client.Unsubscribe();
                Console.WriteLine("Pending operations complete.");
            }
        }

        private static void ProcessLeadScoringThresholdPasses(LeadScoringThresholdPassedInfo obj)
        {
            Console.WriteLine();
            Console.WriteLine(DateTime.Now.ToString() + "=> Receiving Lead Scoring Threshold Passes...");

            foreach (LeadScoringThresholdPass thresholdPass in obj.ThresholdPasses)
            {
                Console.WriteLine("Lead '{0}' for contact '{1}' has passed threshold '{2}' on '{3}'", thresholdPass.LeadName, 
                    thresholdPass.ContactEmail, thresholdPass.ThresholdName, thresholdPass.ThresholdPassedOn);
            }
        }
    }
}
