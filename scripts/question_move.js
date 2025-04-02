const mongoose = require('mongoose');
const AptitudeCategory = require('../models/aptitude_test_categories');
const Question = require('../models/aptitude_question');

// MongoDB Connection
const MONGO_URI = 'mongodb://localhost:27017/futuretech';
mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// Function to fetch category questions by stream and category
const fetchCategoryQuestionsByStream = async (stream, categorySlug) => {
    try {
        // Find the category in the given stream
        const category = await AptitudeCategory.findOne({ slug: categorySlug, stream: stream });

        if (!category) {
            console.log(`${categorySlug} Category not found for stream: ${stream}`);
            return [];
        }

        // Fetch questions linked to this category
        const questions = await Question.find({ category: category._id });

        console.log(`${categorySlug} Questions for ${stream} Stream:`, questions);
        return questions;
    } catch (error) {
        console.error(`Error fetching ${categorySlug} questions:`, error);
        return [];
    }
};

// Function to create categories for humanities and commerce if not exists
const createCategoriesForStreams = async () => {
    try {
        const streams = ['commerce', 'humanities'];
        const categories = ['verbal', 'data-structures-'];

        for (const stream of streams) {
            for (const categorySlug of categories) {
                let category = await AptitudeCategory.findOne({ slug: categorySlug, stream: stream });
                if (!category) {
                    category = new AptitudeCategory({ slug: categorySlug, category_name: categorySlug.replace('_', ' '), stream: stream });
                    await category.save();
                    console.log(`${categorySlug} category created for ${stream} stream.`);
                }
            }
        }
    } catch (error) {
        console.error('Error creating categories:', error);
    }
};

// Function to duplicate questions from science to humanities and commerce
const duplicateQuestionsToStreams = async () => {
    try {
        const targetStreams = ['commerce', 'humanities'];
        const categories = ['verbal', 'data-structures-'];

        for (const categorySlug of categories) {
            const scienceQuestions = await fetchCategoryQuestionsByStream('science', categorySlug);

            for (const stream of targetStreams) {
                const targetCategory = await AptitudeCategory.findOne({ slug: categorySlug, stream: stream });

                if (targetCategory) {
                    for (const question of scienceQuestions) {
                        const newQuestion = new Question({
                            question: question.question,
                            options: question.options,
                            answer: question.answer,
                            answer_key: question.answer_key,
                            category: targetCategory._id,
                            stream: stream
                        });
                        await newQuestion.save();
                    }
                    console.log(`Copied ${categorySlug} questions to ${stream} stream.`);
                }
            }
        }
    } catch (error) {
        console.error('Error duplicating questions:', error);
    }
};

// Execute functions
(async () => {
    await createCategoriesForStreams();
    await duplicateQuestionsToStreams();
    await fetchCategoryQuestionsByStream('science', 'verbal');
    await fetchCategoryQuestionsByStream('science', 'data-structures-');
    await fetchCategoryQuestionsByStream('commerce', 'verbal');
    await fetchCategoryQuestionsByStream('commerce', 'data-structures-');
    await fetchCategoryQuestionsByStream('humanities', 'verbal');
    await fetchCategoryQuestionsByStream('humanities', 'data-structures-');
    mongoose.connection.close();
})();
