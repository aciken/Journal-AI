const User = require('../User/User');

const Signup = async (req, res) => {
    const { name, email, password } = req.body;
    const user = await User.create({ name, email, password });
    res.status(201).json(user);
};

module.exports = Signup;
