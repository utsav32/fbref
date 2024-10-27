import { Locator } from "playwright";
import * as fs from "fs";
import * as path from "path";

// Function to extract table data and save it to a CSV file
export async function extractTableToCSV(
  tableLocator: Locator,
  fileName: string
): Promise<void> {
  // Extract headers from the first row if available
  const headers = await tableLocator
    .locator("tr")
    .first()
    .evaluate((row) => {
      const headerCells = Array.from(row.querySelectorAll("th"));
      return headerCells.map((cell) => cell.textContent?.trim() || "");
    });

  // Extract data rows from the table
  const rows: string[][] = await tableLocator
    .locator("tr")
    .evaluateAll((rows) => {
      return rows.map((row) => {
        const cells = Array.from(row.querySelectorAll("td, th"));
        return cells.map((cell) => cell.textContent?.trim() || "");
      });
    });

  // Add headers as the first row if they exist and aren’t included in data rows
  const csvRows = headers.length ? [headers, ...rows] : rows;
  const csvContent = csvRows.map((row) => row.join(",")).join("\n");

  // Normalize the file path to ensure it doesn't duplicate any root directory
  const filePath = path.resolve(process.cwd(), fileName);

  // Write CSV data to a file
  fs.writeFileSync(filePath, csvContent, "utf8");
  console.log(`Table data saved to ${filePath}`);
}
