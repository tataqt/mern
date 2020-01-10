const { Router } = require("express");
const User = require("../modules/User");
const bcryptjs = require("bcryptjs");
const router = Router();

// /api/auth
router.post('/registr', async (req, res) => {
    try {
        const { email, password } = req.body;

        const candidate = await User.findOne({ email });

        if (candidate) {
            return res.status(400).json({ message: "Такой пользователь уже сущестыует" });
        }

        const hashedPassword = await bcryptjs.hash(password, 12);

        const user = new User({ email, password: hashedPassword });

        await user.save();

        res.status(201).json({ message: 'Польователь создан' })
    } catch (e) {
        res.status(500).json({ message: 'Что-то пошло не так, попробуйте снова' });
    }
})

// /api/login
router.post('/login', async (req, res) => {

})

module.exports = router;