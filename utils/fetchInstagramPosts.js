const puppeteer = require('puppeteer');

async function fetchInstagramPosts(username) {
    try {
        const browser = await puppeteer.launch({ 
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'] // Better for production environments
        });
        const page = await browser.newPage();

        // Set a user agent to mimic a real browser
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

        // Navigate to the Instagram profile page
        await page.goto(`https://www.instagram.com/${username}/`, {
            waitUntil: 'networkidle2', // Wait for network to settle
        });

        // Wait for initial posts to load
        await page.waitForSelector('article a', { timeout: 10000 }).catch(() => {
            console.log('Initial posts selector timeout');
        });

        // Scroll and collect posts
        const postLinks = new Set(); // Use Set to avoid duplicates
        let previousPostCount = 0;
        const maxScrolls = 50; // Increase this for more posts (e.g., 50 might get 500+ posts)
        let scrollCount = 0;
        const scrollDelay = 2000; // Increased delay to allow content to load

        while (scrollCount < maxScrolls) {
            // Extract post links
            const newLinks = await page.evaluate(() => {
                const links = [];
                const postElements = document.querySelectorAll('article a[href*="/p/"]');
                postElements.forEach((element) => {
                    const href = element.getAttribute('href');
                    if (href) {
                        links.push(`https://www.instagram.com${href}`);
                    }
                });
                return links;
            });

            // Add new links to the Set
            newLinks.forEach((link) => postLinks.add(link));

            // Log progress
            console.log(`Scroll ${scrollCount + 1}: Found ${postLinks.size} posts so far`);

            // Check if we're still getting new posts
            if (postLinks.size === previousPostCount) {
                console.log('No new posts loaded, stopping scroll');
                break;
            }
            previousPostCount = postLinks.size;

            // Scroll to the bottom
            await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
            await new Promise(resolve => setTimeout(resolve, scrollDelay)); // Wait for content to load

            // Wait for new posts to appear (optional, but helps with reliability)
            await page.waitForFunction(
                `document.querySelectorAll('article a[href*="/p/"]').length > ${previousPostCount}`,
                { timeout: 5000 }
            ).catch(() => {
                console.log('No more content to load in this scroll');
            });

            scrollCount++;
        }

        const postLinksArray = Array.from(postLinks);
        console.log(`Total posts fetched: ${postLinksArray.length}`);
        console.log(postLinksArray);

        await browser.close();

        if (!postLinksArray || postLinksArray.length === 0) {
            throw new Error('No posts found or profile is private');
        }

        return { username, posts: postLinksArray };
    } catch (error) {
        console.error('Error fetching Instagram posts:', error.message);
        throw new Error('Failed to fetch posts');
    }
}

module.exports = fetchInstagramPosts;
