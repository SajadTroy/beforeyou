const User = require('../models/user');
const Post = require('../models/post');
const fetchInstagramPosts = require('./fetchInstagramPosts');

async function fetchUserPosts() {
  try {
    const users = await User.find();

    for (const user of users) {
      try {
        const { posts } = await fetchInstagramPosts(user.instagram.username);

        for (const postUrl of posts) {
          const existingPost = await Post.findOne({ username: user.instagram.username, postUrl });
          if (!existingPost) {
            await Post.create({ username: user.instagram.username, postUrl });
          }
        }

        console.log(`Fetched and saved posts for user: ${user.instagram.username}`);
      } catch (error) {
        console.error(`Error fetching posts for user ${user.instagram.username}:`, error.message);
      }
    }
  } catch (error) {
    console.error('Error fetching user posts:', error.message);
  }
}

module.exports = fetchUserPosts;
