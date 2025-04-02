const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = 3000;

app.get('/api/profile/:username', async (req, res) => {
  const { username } = req.params;

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
      return res.status(404).json({ error: 'Profile not found or private' });
    }

    res.json(profileData);
  } catch (error) {
    console.error('Error scraping Instagram profile:', error.message);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});