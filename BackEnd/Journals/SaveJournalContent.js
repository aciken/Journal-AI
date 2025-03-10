const User = require('../User/User');

const SaveJournalContent = async (req, res) => {
    const { userId, journalId, content } = req.body;
    console.log(userId, journalId, content);
    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    const journal = user.Journal.find(j => j.id.toString() === journalId);
    journal.content = content;
    user.markModified('Journal');
    await user.save();
    res.status(200).json({ message: 'Journal content saved' });
};

module.exports = SaveJournalContent;
