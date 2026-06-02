const express = require('express');
const router = express.Router();
const Module = require('../models/Module');

// 1. FETCH ALL TOPICS (With Sub-topics and nested problem items loaded)
router.get('/', async (req, res) => {
    try {
        const modules = await Module.find({}).sort({ createdAt: 1 });
        res.status(200).json(modules);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. CREATE A NEW PARENT TOPIC (e.g., "Arrays")
router.post('/', async (req, res) => {
    try {
        const { moduleName } = req.body;
        if (!moduleName) return res.status(400).json({ error: 'Topic name is mandatory' });
        const newModule = await Module.create({ moduleName, subTopics: [] });
        res.status(201).json(newModule);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. EDIT A TOPIC NAME
router.put('/:modId', async (req, res) => {
    try {
        const { moduleName } = req.body;
        const updated = await Module.findByIdAndUpdate(req.params.modId, { moduleName }, { new: true });
        res.status(200).json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. PURGE A TOPIC
router.delete('/:modId', async (req, res) => {
    try {
        await Module.findByIdAndDelete(req.params.modId);
        res.status(200).json({ success: true, message: 'Topic cleanly wiped' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. INJECT NEW SUB-TOPIC INSIDE A TOPIC (e.g., "Two Pointers" inside "Arrays")
router.post('/:modId/subtopics', async (req, res) => {
    try {
        const { subTopicName } = req.body;
        if (!subTopicName) return res.status(400).json({ error: 'Sub-topic name required' });
        const parent = await Module.findById(req.params.modId);
        if (!parent) return res.status(404).json({ error: 'Parent topic missing' });

        parent.subTopics.push({ subTopicName, problems: [] });
        await parent.save();
        res.status(201).json(parent);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 6. DELETE A SUB-TOPIC
router.delete('/:modId/subtopics/:subId', async (req, res) => {
    try {
        const parent = await Module.findById(req.params.modId);
        if (!parent) return res.status(404).json({ error: 'Parent topic missing' });
        parent.subTopics.pull({ _id: req.params.subId });
        await parent.save();
        res.status(200).json(parent);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 7. INJECT A PROBLEM INTO A SUB-TOPIC (e.g., "Two Sum" inside "Two Pointers")
router.post('/:modId/subtopics/:subId/problems', async (req, res) => {
    try {
        const { title, difficulty, url } = req.body;
        const parent = await Module.findById(req.params.modId);
        if (!parent) return res.status(404).json({ error: 'Parent topic missing' });

        const sub = parent.subTopics.id(req.params.subId);
        if (!sub) return res.status(404).json({ error: 'Sub-topic missing' });

        sub.problems.push({ title, difficulty, url });
        await parent.save();
        res.status(201).json(parent);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 8. UPDATE PROBLEM METADATA OR TRACKING TOGGLES NATIVELY
router.put('/:modId/subtopics/:subId/problems/:probId', async (req, res) => {
    try {
        const { title, difficulty, url, completed, revisionRequired } = req.body;
        const parent = await Module.findById(req.params.modId);
        if (!parent) return res.status(404).json({ error: 'Parent reference missing' });

        const sub = parent.subTopics.id(req.params.subId);
        if (!sub) return res.status(404).json({ error: 'Sub-topic context missing' });

        const prob = sub.problems.id(req.params.probId);
        if (!prob) return res.status(404).json({ error: 'Problem element missing' });

        if (title !== undefined) prob.title = title;
        // Inside the problem update route
        if (req.body.starred !== undefined) prob.starred = req.body.starred;
        if (difficulty !== undefined) prob.difficulty = difficulty;
        if (url !== undefined) prob.url = url;
        if (revisionRequired !== undefined) prob.revisionRequired = revisionRequired;
        if (completed !== undefined) {
            prob.completed = completed;
            prob.completedAt = completed ? new Date().toISOString().split('T')[0] : null;
        }

        await parent.save();
        res.status(200).json(parent);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 9. DELETE PROBLEM FROM A SUB-TOPIC ARRAY MATCH
router.delete('/:modId/subtopics/:subId/problems/:probId', async (req, res) => {
    try {
        const parent = await Module.findById(req.params.modId);
        if (!parent) return res.status(404).json({ error: 'Parent frame missing' });
        const sub = parent.subTopics.id(req.params.subId);
        if (!sub) return res.status(404).json({ error: 'Sub-topic missing' });

        sub.problems.pull({ _id: req.params.probId });
        await parent.save();
        res.status(200).json(parent);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;