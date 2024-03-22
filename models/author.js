const mongoose = require('mongoose');
const Book = require('./book');

const authorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
});

authorSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
    try {
        const hasBook = await Book.exists({ author: this._id });
        if (hasBook) {
            const error = new Error('Author still has books');
            error.name = 'AuthorDeleteError';
            next(error);
        } else {
            next();
        }
    } catch (error) {
        console.error(error);
        next(error);
    }
});

module.exports = mongoose.model('Author', authorSchema);
