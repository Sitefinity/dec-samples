using System;
using System.Linq;
using Telerik.DigitalExperienceCloud.Client;

namespace Telerik.DEC.LeadScoringEventClientSample
{
    class Program
    {
        static void Main(string[] args)
        {
            string yourApplicationKey = "";
            AppAccessToken token = new AppAccessToken(Guid.Parse(yourApplicationKey));

            string yourDecDataCenterApiKey = "";

            int checkIntervalInSeconds = 120;
            using (LeadScoringEventClient client = new LeadScoringEventClient(token, yourDecDataCenterApiKey, checkIntervalInSeconds))
            {
                client.Subscribe(ProcessLeadScoringThresholdPasses);

                int intervalInMinutes = client.TimerIntervalInSeconds / 60;
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
