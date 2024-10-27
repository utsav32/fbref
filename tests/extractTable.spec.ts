import { test, expect } from "@playwright/test";
import { extractTableToCSV } from "../src/utils"; // Ensure this path is correct
import * as fs from "fs";
import * as path from "path";

test("Extract data table and save as CSV", async ({ page }) => {
  // Go to the page containing the table
  await page.goto(
    "https://fbref.com/en/squads/ab41cb90/Vancouver-Whitecaps-FC-Stats"
  );

  // Count the number of tables present on the page
  const tableCount = await page.locator(".stats_table").count();
  console.log(`Found ${tableCount} tables on the page.`);

  let tableName: string | null;
  for (let i = 0; i < tableCount; i++) {
    // Locate the specific table's body
    const tableSelector = page.locator(".stats_table").nth(i);

    // Set the table name according to the table caption
    tableName = await page
      .locator(".stats_table")
      .nth(i)
      .locator("caption")
      .textContent();

    // Limit the table name to 10 characters and replace spaces with underscores
    const formattedTableName = tableName
      ? tableName.replace(/\s+/g, "_").substring(0, 10)
      : "default_name"; // Max 10 characters

    // Define the CSV file name
    const fileName = `${formattedTableName}.csv`; // Ensure it ends with .csv
    const filePath = path.join(process.cwd(), fileName);

    // Log the current working directory and the intended file path
    console.log("Current working directory:", process.cwd());
    console.log("Saving CSV file to:", filePath);

    // Delete any existing CSV file with the same name
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Use the utility function to extract the table data to CSV
    await extractTableToCSV(tableSelector, fileName);

    // Verify that the CSV file is created
    expect(fs.existsSync(filePath)).toBeTruthy();

    // Read the CSV content to verify its contents
    const csvContent = fs.readFileSync(filePath, "utf-8");
    console.log("Extracted CSV Content:\n", csvContent);

    // Check if the CSV content is not empty
    expect(csvContent).not.toBe("");
  }
});

test("Extract data table from all the matches and save as CSV", async ({
  page,
}) => {
  await page.route("**/*", (route) => {
    const url = route.request().url();
    if (url.includes("ads.") || url.includes("pa.")) {
      return route.abort();
    }
    return route.continue();
  });

  await page.goto(
    "https://fbref.com/en/squads/ab41cb90/Vancouver-Whitecaps-FC-Stats"
  );

  const matchesCount = await page
    .locator("#all_matchlogs")
    .filter({ hasText: "Scores & Fixtures" })
    .locator(".stats_table")
    .locator("tr")
    .count();

  console.log(`Found ${matchesCount} tables on the page.`);

  let gameName: string | null;
  for (let i = 1; i < matchesCount; i++) {
    const matchReport = await page
      .locator("#all_matchlogs")
      .filter({ hasText: "Scores & Fixtures" })
      .locator(".stats_table")
      .locator("tr")
      .nth(i)
      .getByText("Match Report");

    gameName = await page
      .locator("#all_matchlogs")
      .filter({ hasText: "Scores & Fixtures" })
      .locator(".stats_table")
      .locator("tr")
      .nth(i)
      .locator('[data-stat="opponent"] a')
      .textContent();

    await matchReport.click();
    console.log("Game Opponent:", gameName);

    const formattedGameName = gameName
      ? gameName.replace(/\s+/g, "").substring(0, 10)
      : "default_name";

    const gameFolderPath = path.resolve("game_data", formattedGameName); // Using path.resolve here
    if (!fs.existsSync(gameFolderPath)) {
      fs.mkdirSync(gameFolderPath, { recursive: true });
    }

    await page.waitForTimeout(10000);

    const tableCount = await page.locator(".stats_table").count();
    console.log(`Found ${tableCount} tables on the page.`);

    for (let j = 0; j < tableCount; j++) {
      const tableSelector = page.locator(".stats_table").nth(j);

      const tableName = await page
        .locator(".stats_table")
        .nth(j)
        .locator("caption")
        .textContent();

      const formattedTableName = tableName
        ? tableName.replace(/\s+/g, "").substring(0, 10)
        : "default_name";

      const fileName = `${formattedTableName}.csv`;
      const filePath = path.join(gameFolderPath, fileName);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      await extractTableToCSV(tableSelector, filePath);

      expect(fs.existsSync(filePath)).toBeTruthy();

      const csvContent = fs.readFileSync(filePath, "utf-8");

      expect(csvContent).not.toBe("");
    }
    await page.goBack({ waitUntil: "domcontentloaded" });
  }
});
