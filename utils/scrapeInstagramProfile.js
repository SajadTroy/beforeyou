const puppeteer = require('puppeteer');

async function scrapeInstagramProfile(username) {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto(`https://www.instagram.com/${username}/`, {
      waitUntil: 'networkidle2',
    });

    await page.waitForSelector('img', { timeout: 5000 }).catch(() => {
      console.log('Profile image selector timeout');
    });

    const profileData = await page.evaluate(() => {
      const title = document.querySelector('title')?.textContent;

      if (!title) return null;

      const [name, usernameWithAt] = title.split('(');
      const username = usernameWithAt?.replace('@', '').split(')')[0];

      const profilePhotoElement = document.querySelector(`img[alt="${username}'s profile picture"]`);

      return {
        name: name?.trim(),
        username: username?.trim(),
        profilePhoto: profilePhotoElement ? profilePhotoElement.src : null,
      };
    });

    await browser.close();

    if (!profileData || !profileData.username) {
      throw new Error('Profile not found or private');
    }

    return profileData;
  } catch (error) {
    console.error('Error scraping Instagram profile:', error.message);
    throw new Error('Failed to fetch profile');
  }
}

module.exports = scrapeInstagramProfile;
