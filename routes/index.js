const express = require('express');
const router = express.Router();
const User = require('../models/user');
const scrapeInstagramProfile = require('../utils/scrapeInstagramProfile');

router.get('/register', (req, res) => {
  res.render('user/register', { title: 'Register' });
});

router.post('/register', async (req, res) => {
  const { email, phone, instagram } = req.body;

  try {
    const profileData = await scrapeInstagramProfile(instagram);

    const newUser = new User({
      email,
      phone,
      instagram: {
        profile_name: profileData.name,
        username: profileData.username,
        profile_url: profileData.profilePhoto,
      },
    });

    await newUser.save();
    res.redirect('/'); // Redirect to the homepage or a success page
  } catch (error) {
    console.error('Error registering user:', error.message);
    res.status(500).send('An error occurred while registering. Please try again.');
  }
});

module.exports = router;