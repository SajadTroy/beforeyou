const express = require('express');
const router = express.Router();
const scrapeInstagramProfile = require('../utils/scrapeInstagramProfile');
const fetchInstagramPosts = require('../utils/fetchInstagramPosts');

router.get('/profile/:username', async (req, res) => {
  const { username } = req.params;

  try {
    const profileData = await scrapeInstagramProfile(username);
    res.json(profileData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/posts/:username', async (req, res) => {
  const { username } = req.params;

  try {
    const posts = await fetchInstagramPosts(username);
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;