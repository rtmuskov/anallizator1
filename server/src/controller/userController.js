const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {User, UserInfo} = require('../models/models')

const generateJwt = (id, email, role) => {
    return jwt.sign(
        {id, email, role},
        process.env.JWT_SECRET,
        {expiresIn: '24h'}
    )
}

class UserController {
    async registration(req, res, next) {
        try {
            console.log('Полное тело запроса:', req.body);
            const {email, password, profileData} = req.body;
            console.log('Получены данные для регистрации:', { email, profileData });
            if (!email || !password) {
                return res.status(400).json({message: 'Некорректный email или пароль'})
            }
            const candidate = await User.findOne({where: {email}})
            if (candidate) {
                return res.status(400).json({message: 'Пользователь с таким email уже существует'})
            }
            const hashPassword = await bcrypt.hash(password, 5)
            const user = await User.create({email, password: hashPassword})

            console.log('Данные профиля для UserInfo:', {
                 userId: user.id,
                 name: profileData.name,
                 age: profileData.age,
                 gender: profileData.gender,
                 height: profileData.height,
            });

            await UserInfo.create({
                 userId: user.id,
                 name: profileData.name,
                 age: profileData.age,
                 gender: profileData.gender,
                 height: profileData.height,
            });

            const token = generateJwt(user.id, user.email, user.role)
            return res.json({token})
        } catch (e) {
            console.log(e)
            if (e.errors && e.errors.length > 0) {
                 res.status(400).json({message: e.errors[0].message });
            } else {
                 res.status(400).json({message: 'Ошибка регистрации'})
            }
        }
    }

    async login(req, res, next) {
        try {
            const {email, password} = req.body
            const user = await User.findOne({where: {email}})
            if (!user) {
                return res.status(400).json({message: 'Пользователь не найден'})
            }
            let comparePassword = bcrypt.compareSync(password, user.password)
            if (!comparePassword) {
                return res.status(400).json({message: 'Указан неверный пароль'})
            }
            const token = generateJwt(user.id, user.email, user.role)
            return res.json({token})
        } catch (e) {
            console.log(e)
            res.status(400).json({message: 'Ошибка входа'})
        }
    }

    async check(req, res, next) {
        const token = generateJwt(req.user.id, req.user.email, req.user.role)
        return res.json({ token, user: { id: req.user.id, email: req.user.email, role: req.user.role } });
    }

    async getUserProfile(req, res, next) {
        try {
            const userId = req.user.id;
            
            let userInfo = await UserInfo.findOne({
                where: { userId },
                include: [{ model: User, attributes: ['email'] }]
            });

            if (!userInfo) {
                const user = await User.findByPk(userId);
                
                if (user) {
                    userInfo = await UserInfo.create({ userId: user.id });
                    return res.json({ ...userInfo.get(), User: { email: user.email } });
                } else {
                    return res.status(404).json({ message: 'Пользователь не найден' });
                }
            }

            return res.json(userInfo);
        } catch (e) {
            console.log(e);
            res.status(500).json({ message: 'Ошибка при получении данных профиля' });
        }
    }

    async updateUserProfile(req, res, next) {
        try {
            const userId = req.user.id;
            const { name, age, gender, height } = req.body;

            let userInfo = await UserInfo.findOne({ where: { userId } });

            if (!userInfo) {
                userInfo = await UserInfo.create({ userId });
            }

            userInfo.name = name;
            userInfo.age = age;
            userInfo.gender = gender;
            userInfo.height = height;

            await userInfo.save();

            return res.json(userInfo);
        } catch (e) {
            console.log(e);
            res.status(500).json({ message: 'Ошибка при обновлении данных профиля' });
        }
    }
}

module.exports = new UserController() 