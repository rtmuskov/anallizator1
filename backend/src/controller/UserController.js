const ApiError = require('../error/ApiError');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Users, UserInfo } = require('../models/models');

const generateJwt = (id, email, role) => {
    return jwt.sign(
        { id, email, role },
        process.env.SECRET_KEY,
        { expiresIn: '24h' }
    );
};

class UserController {
    async registration(req, res, next) {
        const { email, password, phone, role } = req.body;
        if (!email || !password) {
            return next(ApiError.badRequest('Некорректный email или password'));
        }

        const candidate = await Users.findOne({ where: { email } });
        if (candidate) {
            return next(ApiError.badRequest('Пользователь с таким email уже существует'));
        }

        const hashPassword = await bcrypt.hash(password, 5);
        const user = await Users.create({ email, password: hashPassword, phone, role });
        await UserInfo.create({ userId: user.id });

        const token = generateJwt(user.id, user.email, user.role);
        return res.json({ token });
    }

    async login(req, res, next) {
        const { email, password } = req.body;
        console.log('Попытка входа для email:', email);
        const user = await Users.findOne({ where: { email } });
        if (!user) {
            console.log('Пользователь не найден для email:', email);
            return next(ApiError.internal('Пользователь не найден'));
        }

        const comparePassword = bcrypt.compareSync(password, user.password);
        console.log('Сравнение паролей для email:', email, 'Результат:', comparePassword);
        if (!comparePassword) {
            console.log('Неверный пароль для email:', email);
            return next(ApiError.internal('Указан неверный пароль'));
        }

        const token = generateJwt(user.id, user.email, user.role);
        console.log('Вход успешен для email:', email);
        return res.json({ token });
    }

    async check(req, res) {
        const token = generateJwt(req.user.id, req.user.email, req.user.role);
        return res.json({ token });
    }

    // ✅ Регистрация / авторизация через Telegram
    async telegramLogin(req, res, next) {
        try {
            const {telegramId, firstName, lastName} = req.body;
            if (!telegramId) {
                return next(ApiError.badRequest('telegramId обязателен'));
            }

            let user = await Users.findOne({where: {phone: telegramId}});

            if (!user) {
                user = await Users.create({
                    email: `tg_${telegramId}@example.com`,
                    password: 'telegram_auth', // Можно использовать любой заглушечный пароль
                    phone: telegramId,
                    role: 'user'
                });
                await UserInfo.create({
                    userId: user.id,
                    firstName: firstName || '',
                    lastName: lastName || '',
                });
            }

            const token = generateJwt(user.id, user.email, user.role);
            return res.json({token});
        } catch (e) {
            console.error("Telegram Login Error:", e); // Добавь это
            return next(ApiError.internal('Ошибка при Telegram-входе'));
        }
    }

    // ✅ Авторизация через Google (passport должен быть настроен отдельно)
    async googleCallback(req, res, next) {
        try {
            if (!req.user) {
                return next(ApiError.internal("Ошибка при Google-входе"));
            }

            const user = req.user; // получен через passport-google-oauth20
            const token = generateJwt(user.id, user.email, user.role);
            res.redirect(`${process.env.CLIENT_URL}/auth/success?token=${token}`);
        } catch (error) {
            console.error(error);
            return next(ApiError.internal("Ошибка при Google-авторизации"));
        }
    }
}

module.exports = new UserController();
