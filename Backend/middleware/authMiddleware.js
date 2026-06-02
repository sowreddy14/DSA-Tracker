const User = require('../models/User');

const protect = async (req, res, next) => {
    try {
        let user = await User.findOne({ username: 'root_user' });
        if (!user) {
            user = await User.create({
                username: 'root_user',
                passwordHash: 'bypassed',
                streakCount: 0,
                lastSolvedDate: null
            });
        }
        req.user = { id: user._id };
        next();
    } catch (error) {
        res.status(500).json({ error: 'Internal single-user authentication bypass failure' });
    }
};

module.exports = protect;