const puppeteer = require('puppeteer');

async function fetchInstagramPosts(username) {
    try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        // Set a user agent to avoid detection
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');

        // Navigate to the Instagram profile page
        await page.goto(`https://www.instagram.com/${username}/`, {
            waitUntil: 'networkidle2', // Wait for the network to be idle
        });

        // Wait for the initial posts to load
        await page.waitForSelector('article a', { timeout: 5000 }).catch(() => {
            console.log('Posts selector timeout');
        });

        // Scroll to load more posts
        let previousHeight;
        const maxScrolls = 10; // Increase this to fetch more posts (e.g., 10 scrolls might get 50-120 posts)
        let scrollCount = 0;
        const postLinks = new Set(); // Use Set to avoid duplicate links

        while (scrollCount < maxScrolls) {
            // Extract post links after each scroll
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

            // Scroll down
            previousHeight = await page.evaluate('document.body.scrollHeight');
            await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
            await page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`, { timeout: 5000 }).catch(() => {
                console.log('No more content to load');
            });

            scrollCount++;
            await new Promise(resolve => setTimeout(resolve, 1000)); // Small delay to allow content to load
        }

        const postLinksArray = Array.from(postLinks);
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
