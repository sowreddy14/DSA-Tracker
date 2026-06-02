const mongoose = require('mongoose');

const ProblemSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
    url: { type: String, default: "" },
    starred: { type: Boolean, default: false },
    completed: { type: Boolean, default: false },
    revisionRequired: { type: Boolean, default: false },
    completedAt: { type: String, default: null }
});

const SubTopicSchema = new mongoose.Schema({
    subTopicName: { type: String, required: true, trim: true },
    problems: [ProblemSchema]
});

const ModuleSchema = new mongoose.Schema({
    moduleName: { type: String, required: true, unique: true, trim: true },
    subTopics: [SubTopicSchema]
}, { timestamps: true });

module.exports = mongoose.model('Module', ModuleSchema);