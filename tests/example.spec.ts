import { test, expect } from '@playwright/test';

test('Get Vancouver data', async ({page}) =>{
      // Step 2: Navigate to fref.com
      await page.goto('https://fbref.com/');

      // Step 3: Search for "Vancouver Whitecaps"
      await page.getByPlaceholder('Enter Person, Team, Section, etc').fill('Vancouver Whitecaps');
      await page.keyboard.press('Enter'); // Trigger the search
    
      // // Wait for the search results to load and click on the Vancouver Whitecaps link
      // await page.waitForSelector('a[href*="teams/Vancouver-Whitecaps"]');
      // await page.click('a[href*="teams/Vancouver-Whitecaps"]');
    
      // // Step 4: Navigate to the "Matches" section (you may need to adjust the selector based on the site's structure)
      // await page.waitForSelector('table[class*="matches"]'); // Assuming match stats are in a table
})
