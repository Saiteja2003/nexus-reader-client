import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.join(__dirname, "../src/data/discoverFeeds.js");

async function updateFeeds() {
  console.log("Starting Self-Healing Feed Engine...");

  // Dynamically import the current feeds
  const { DISCOVER_CATEGORIES } = await import("file://" + dataPath);

  let totalProcessed = 0;
  let totalDeleted = 0;

  const updatedCategories = await Promise.all(
    DISCOVER_CATEGORIES.map(async (category) => {
      const activeFeeds = [];

      for (const feed of category.feeds) {
        try {
          const response = await fetch(feed.url, {
            signal: AbortSignal.timeout(8000),
          });

          // 1. THE PURGE: If the feed is dead, skip it (effectively deleting it)
          if (!response.ok) {
            console.log(`[DELETED] Unreachable feed: ${feed.title}`);
            totalDeleted++;
            continue;
          }

          const xmlText = await response.text();

          // 2. THE FRESHNESS: Extract the title of the very first <item> (the newest article)
          const itemMatch =
            xmlText.match(
              /<item>[\s\S]*?<title><!\[CDATA\[(.*?)\]\]><\/title>[\s\S]*?<\/item>/,
            ) ||
            xmlText.match(
              /<item>[\s\S]*?<title>(.*?)<\/title>[\s\S]*?<\/item>/,
            ) ||
            xmlText.match(
              /<entry>[\s\S]*?<title>(.*?)<\/title>[\s\S]*?<\/entry>/,
            ); // Fallback for Atom feeds

          const latestHeadline = itemMatch
            ? itemMatch[1].trim()
            : "New updates available";

          // 3. Keep the feed and update its metadata
          activeFeeds.push({
            ...feed,
            latestHeadline: latestHeadline,
            lastVerified: new Date().toISOString(),
          });

          totalProcessed++;
        } catch (error) {
          console.log(`[DELETED] Timeout/Error on feed: ${feed.title}`);
          totalDeleted++;
        }
      }

      // Return the category with ONLY the active, surviving feeds
      return { ...category, feeds: activeFeeds };
    }),
  );

  // Rebuild the JavaScript file content
  const fileContent = `// Automatically cleaned and enriched by GitHub Actions
export const DISCOVER_CATEGORIES = ${JSON.stringify(updatedCategories, null, 2)};
`;

  // Overwrite the file with the clean, updated data
  fs.writeFileSync(dataPath, fileContent, "utf8");
  console.log(
    `Engine Complete: Verified ${totalProcessed} feeds. Purged ${totalDeleted} dead feeds.`,
  );
}

updateFeeds().catch(console.error);
