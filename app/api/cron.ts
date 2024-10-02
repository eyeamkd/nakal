import { NextApiRequest, NextApiResponse } from "next";
import { checkForNewMatches } from "../lib/jobHandler";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    try {
      console.log("Executing cron job");
      await checkForNewMatches();
      res.status(200).json({ message: "Cron job executed successfully" });
    } catch (error) {
      console.error("Error in cron job:", error);
      res
        .status(500)
        .json({ error: "An error occurred during cron job execution" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
