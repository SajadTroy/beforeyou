const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const AptitudeCategory = require('../models/aptitude_test_categories');

const saveCategories = async () => {
    try {
        const filePath = path.join(__dirname, '../data/aptitude_test/science/categories.json');
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        for (const item of data) {
            // Check if category already exists
            const existingCategory = await AptitudeCategory.findOne({
                slug: item.slug,
                stream: item.stream
            });

            if (!existingCategory) {
                const category = new AptitudeCategory({
                    category_name: item.category_name,
                    stream: item.stream,
                    slug: item.slug,
                    questions: [] // Initially empty, will be populated when questions are added
                });

                await category.save();
                console.log(`Saved category: ${item.category_name}`);
            } else {
                console.log(`Category already exists: ${item.category_name}`);
            }
        }

        console.log('Categories import completed');
    } catch (error) {
        console.error('Error saving categories:', error);
    }
};

setTimeout(() => {
    // saveCategories();
}, 5000); 
