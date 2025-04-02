const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const AptitudeQuestion = require('../models/aptitude_question');
const AptitudeCategory = require('../models/aptitude_test_categories');

const saveQuestions = async (stream, categorySlug) => {
    try {
        // First find the category by slug and stream
        const category = await AptitudeCategory.findOne({
            slug: categorySlug,
            stream: stream
        });

        if (!category) {
            console.error(`Category not found for slug: ${categorySlug} and stream: ${stream}`);
            return;
        }

        const filePath = path.join(__dirname, `../data/aptitude_test/${stream}/${categorySlug}.json`);
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        for (const item of data) {
            // Check if question already exists
            const existingQuestion = await AptitudeQuestion.findOne({
                question: item.question,
                category: category._id
            });

            if (!existingQuestion) {
                const question = new AptitudeQuestion({
                    sl_no: item.sl_no,
                    question: item.question,
                    options: item.options,
                    answer: item.answer,
                    answer_key: item.answer_key,
                    category: category._id, // Using the found category's ID
                    stream: stream
                });

                const savedQuestion = await question.save();

                // Add question reference to category
                await AptitudeCategory.findByIdAndUpdate(
                    category._id,
                    {
                        $push: { 
                            questions: { 
                                q_id: savedQuestion._id 
                            }
                        }
                    }
                );

                console.log(`Saved question: ${item.question}`);
            } else {
                console.log(`Question already exists: ${item.question}`);
            }
        }
    } catch (error) {
        console.error(`Error in saveQuestions:`, error);
    }
};

// Example usage
const initializeQuestions = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/your_database', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        // Example: save questions for numerical ability in science stream
        await saveQuestions('science', 'numerical-ability');
        
        await mongoose.connection.close();
    } catch (error) {
        console.error('Database connection error:', error);
    }
};

// Uncomment to run
// initializeQuestions();

module.exports = saveQuestions;
