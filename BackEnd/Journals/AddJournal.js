const User = require('../User/User');

const AddJournal = async (req, res) => {
    console.log("asd");
    const { userId, journal } = req.body;
    console.log(userId, journal);
    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    user.Journal.push(journal);
    await user.save();
    res.status(200).json(user);
};

module.exports = AddJournal;
