const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const User = require('../models/user');
const scrapeInstagramProfile = require('../utils/scrapeInstagramProfile');
const { send } = require('../email');

router.get('/register', (req, res) => {
  res.render('user/register', { title: 'Register' });
});

router.post('/register', async (req, res) => {
  const { email, phone, instagram } = req.body;

  try {
    const profileData = await scrapeInstagramProfile(instagram);

    // Generate a random password
    const password = crypto.randomBytes(8).toString('hex');

    // Encrypt the username
    const hashedUsername = await bcrypt.hash(profileData.username, 10);

    const newUser = new User({
      email,
      phone,
      instagram: {
        profile_name: profileData.name,
        username: hashedUsername,
        profile_url: profileData.profilePhoto,
      },
    });

    await newUser.save();

    // Send the password to the user's email
    const subject = 'Welcome to BeforeYou!';
    const text = `Your account has been created successfully. Your password is: ${password}`;
    const html = `<p>Your account has been created successfully.</p><p><strong>Password:</strong> ${password}</p>`;
    send(email, subject, text, html, (err) => {
      if (err) {
        console.error('Error sending email:', err.message);
        return res.status(500).send('Error sending email. Please try again.');
      }
      res.redirect('/'); // Redirect to the homepage or a success page
    });
  } catch (error) {
    console.error('Error registering user:', error.message);
    res.status(500).send('An error occurred while registering. Please try again.');
  }
});

module.exports = router;