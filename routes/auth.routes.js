const { Router } = require("express");
const { check, validationResult } = require("express-validator");
const jwt = require('jsonwebtoken')
const User = require("../model/User");
const bcryptjs = require("bcryptjs");
const config = require("config");
const router = Router();

// /api/auth/registr
router.post(
    '/registr',
    [
        check('email', 'Некорректный email').isEmail(),
        check('password', 'Минимальная длина пароля 6 символов').isLength({ min: 6 })
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    errors: errors.array(),
                    message: 'Некорректные даные при регистрации'
                })
            }

            const { email, password } = req.body;

            const candidate = await User.findOne({ email });

            if (candidate) {
                return res.status(400).json({ message: "Такой пользователь уже существует" });
            }

            const hashedPassword = await bcryptjs.hash(password, 12);

            const user = new User({ email, password: hashedPassword });

            await user.save();

            res.status(201).json({ message: 'Польователь создан' })
        } catch (e) {
            res.status(500).json({ message: 'Что-то пошло не так, попробуйте снова' });
        }
    })

// /api/auth/login
router.post(
    '/login',
    [
        check('email', 'Введите корректный email').normalizeEmail().isEmail(),
        check('password', 'Введите папроль').exists()

    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(400).json({
                    errors: errors.array(),
                    message: 'Некорректные даные при входе в систему'
                })
            }

            const { email, password } = req.body;

            const user = await User.findOne({ email });

            if (!user) {
                return res.status(400).json({ message: 'Пользователь не найден' });
            }

            const isMatch = await bcryptjs.compare(password, user.password);

            if (!isMatch) {
                return res.status(400).json({ message: 'Не верный пароль' });
            }

            const token = jwt.sign(
                { userId: user.id },
                config.get('jwtSecret'),
                { expiresIn: '1h' }
            )

            res.json({ token, userId: user.id });
        } catch (e) {
            res.status(500).json({ message: 'Что-то пошло не так, попробуйте снова' });
        }
    })

module.exports = router;