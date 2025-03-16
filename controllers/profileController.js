const User = require('../models/User');

exports.getProfile = (req, res) => {
    res.render('profile/index', { 
        message: req.query.message ? {
            type: req.query.type || 'info',
            text: req.query.message
        } : null
    });
};

exports.updateProfile = async (req, res) => {
    try {
        const { name, password, confirmPassword } = req.body;
        const userId = req.user.id;

        // Validate password match if provided
        if (password || confirmPassword) {
            if (password !== confirmPassword) {
                return res.redirect('/profile?type=danger&message=Passwords do not match');
            }
        }

        // Update user info
        if (password) {
            await User.updateProfile(userId, name, password);
        } else {
            await User.updateProfile(userId, name);
        }

        res.redirect('/profile?type=success&message=Profile updated successfully');
    } catch (error) {
        console.error('Error updating profile:', error);
        res.redirect('/profile?type=danger&message=Error updating profile');
    }
}; 