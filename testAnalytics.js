import { analyticsService } from "./src/services/analyticsService.js";

async function run() {
  try {
    console.log("Fetching analytics...");
    const data = await analyticsService.getAnalytics();
    console.log("Analytics Data:");
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error fetching analytics:", err);
  } finally {
    process.exit(0);
  }
}

run();
