const fetchUserPosts = require('../utils/fetchUserPosts');
require('dotenv').config();

setInterval(fetchUserPosts, 60 * 1000);
