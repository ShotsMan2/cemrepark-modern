import { analyticsService } from "./src/services/analyticsService.js";

async function test() {
  try {
    const data = await analyticsService.getAnalytics();
    console.log("Success:", data);
  } catch (error) {
    console.error("Error:", error);
  }
  process.exit();
}

test();
