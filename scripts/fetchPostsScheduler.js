const fetchUserPosts = require('../utils/fetchUserPosts');
require('dotenv').config();

setInterval(fetchUserPosts, 6 * 60 * 60 * 1000);

