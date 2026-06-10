import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";

// Supabase Setup
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runEngine() {
  console.log("Starting Live Database Verification Engine...");

  // 1. Fetch all feeds from Supabase
  const { data: feeds, error } = await supabase
    .from("curated_feeds")
    .select("*");

  if (error) {
    console.error("Error fetching from Supabase:", error);
    process.exit(1);
  }

  let totalProcessed = 0;
  let totalPurged = 0;

  // 2. Ping each URL
  for (const feed of feeds) {
    try {
      const response = await fetch(feed.url, {
        method: "HEAD",
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        console.log(`[PURGE] Dead link detected: ${feed.title}`);
        await supabase.from("curated_feeds").delete().eq("id", feed.id);
        totalPurged++;
      }
      totalProcessed++;
    } catch (e) {
      console.log(`[PURGE] Timeout on: ${feed.title}`);
      await supabase.from("curated_feeds").delete().eq("id", feed.id);
      totalPurged++;
    }
  }

  console.log(
    `Verification complete. Processed: ${totalProcessed}, Purged: ${totalPurged}`,
  );

  // 3. The Streak Preserver: Write to a local log file
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const logPath = path.join(__dirname, "../engine-log.txt");

  const logMessage = `Engine Run: ${new Date().toISOString()} | Active Feeds: ${totalProcessed - totalPurged} | Purged: ${totalPurged}\n`;

  // Overwrite the file to ensure the timestamp changes, triggering a Git commit
  fs.writeFileSync(logPath, logMessage, "utf8");
  console.log("Log updated. Ready for GitHub push.");
}

runEngine().catch(console.error);
