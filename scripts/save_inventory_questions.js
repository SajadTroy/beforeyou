const fs = require('fs');
const path = require('path');
const InventoryQuestion = require('../models/inventory_question');
const mongoose = require('mongoose');

async function saveInventoryQuestions() {
    try {
        const questionsFilePath = path.join(__dirname, '../data/inventory_test/questions.json');
        const questionsData = fs.readFileSync(questionsFilePath, 'utf8');
        const questions = JSON.parse(questionsData);

        for (const question of questions) {
            const newQuestion = new InventoryQuestion({
                sl_no: question.id,
                question: question.question,
                category: question.category
            });
            await newQuestion.save();
        }

        console.log("All inventory questions saved successfully.");
    } catch (err) {
        console.error(err);
    }
}

module.exports = saveInventoryQuestions;
