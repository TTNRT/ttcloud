import {Sequelize, DataTypes, Model} from 'sequelize'
import bcrypt from 'bcrypt'
import type {InferAttributes, InferCreationAttributes, CreationOptional} from 'sequelize'
import passport from 'passport'
import {Strategy} from 'passport-local'
import crypto from 'node:crypto'
import type {Response, Request, NextFunction} from 'express'

const server_env = process.env.NODE_ENV
export const passport_auth = passport
export const cookie_config = {
    name: process.env.COOKIE_NAME || 'ttcloud-cookie-session',
    secret: process.env.COOKIE_SECRET || 'session_key_please_change_me',
    domain: process.env.COOKIE_DOMAIN,
    proxy: server_env === 'production' ? true : false,
    maxAge: 24 * 60 * 60 * 1000,
    secure: server_env === 'production' ? true : false,
    httpOnly: true,
    sameSite: 'lax'
}
export const server_config = {
    enable_gravatar: process.env.ENABLE_GRAVATAR ? true : false,
    server_domain: process.env.SERVER_DOMAIN || 'http://localhost:8000'
}
export const sequelize = new Sequelize({dialect: 'sqlite', storage: './database.db'})
type Session_User = {
    id: number
    username: string
    password: string
    email: string
    full_name: string
    auth_token: string
    avatar?: string
    createdAt: string
}

export class Database {
    static User = class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
        declare id: CreationOptional<number>
        declare username: string
        declare password: string
        declare email: string
        declare full_name: string
        declare disabled: boolean
        declare activated: boolean
        declare auth_token: string
        declare createdAt: CreationOptional<string>
    }
    static Uploads = class Uploads extends Model<InferAttributes<Uploads>, InferCreationAttributes<Uploads>> {
        declare id: CreationOptional<number>
        declare name: string
        declare data: Buffer
        declare mimetype: string
        declare user_id: number
        declare createdAt: CreationOptional<string>
    }
    static Session = class Session extends Model<InferAttributes<Session>, InferCreationAttributes<Session>> {
        declare id: CreationOptional<number>
        declare sid: string
        declare expires: string
        declare data: string
        declare createdAt: CreationOptional<string>
    }
}
export class Helpers {
    static async createPassword(user_password: string) {
        try {
            const compare_pass = await bcrypt.hash(user_password, bcrypt.genSaltSync(12))
            return compare_pass
        } catch(error) {
            const errorMsg = error instanceof Error ? error.message : 'Something unexpected has occurred!'
            return Error(errorMsg)
        }
    }
    static async comparePassword(user_password: string, db_password: string) {
        try {
            const compare_pass = await bcrypt.compare(user_password, db_password)
            return compare_pass
        } catch(error) {
            const errorMsg = error instanceof Error ? error.message : 'Something unexpected has occurred!'
            return Error(errorMsg)
        }
    }
    static getGravatarUrl(email: string) {
        const trimmed_email = email.trim().toLocaleLowerCase()
        const hashed_uri = crypto.createHash('sha256').update(trimmed_email).digest('hex')
        return `https://www.gravatar.com/avatar/${hashed_uri}?s=110&d=identicon`
    }
    static createAuthToken(length: number) {
        return crypto.randomBytes(length).toString('base64').replace(/[^A-Za-z0-9]/g, '').slice(0, length)
    }
    static checkSessionAPI(req: Request, res: Response, next: NextFunction) {
        if (req.isAuthenticated()) {
            return next()
        } else {
            return res.status(401).json({
                message: "You are not authorized to view this page!"
            })
        }
    }
    static checkSessionPage(req: Request, res: Response, next: NextFunction) {
        if (req.isAuthenticated()) {
            return next()
        } else {
            req.flash('error', 'You need to be logged in to access this page!')
            return res.redirect(`/auth/login?origin=${encodeURIComponent(req.originalUrl)}`)
        }
    }
    static async findAPIToken(user_token: string) {
        try {
            const find_user = await Database.User.findOne({
                where: {
                    auth_token: user_token
                }
            })
            if (find_user === null) {
                throw new Error("That user doesn't exist!")
            } else {
                return find_user.toJSON()
            }
        } catch(error) {
            const errorMsg = error instanceof Error ? error.message : 'Something unexpected has occurred!'
            console.error(errorMsg)
            return Error(errorMsg)
        }
    }
}

// Database syncing
Database.User.init({
    id: { type: DataTypes.INTEGER, primaryKey: true },
    username: { type: DataTypes.STRING, allowNull: false },
    password: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false},
    full_name: { type: DataTypes.STRING, allowNull: false },
    disabled: { type: DataTypes.BOOLEAN, allowNull: false },
    activated: { type: DataTypes.BOOLEAN, allowNull: false },
    auth_token: { type: DataTypes.STRING, allowNull: false },
    createdAt: { type: DataTypes.DATE, allowNull: false }
}, { sequelize, tableName: 'Users', updatedAt: false })
Database.Uploads.init({
    id: { type: DataTypes.INTEGER, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    data: { type: DataTypes.BLOB, allowNull: false },
    mimetype: { type: DataTypes.STRING, allowNull: false },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    createdAt: { type: DataTypes.DATE, allowNull: false }
}, { sequelize, updatedAt: false, tableName: 'Uploads' })
Database.Session.init({
    id: { type: DataTypes.INTEGER, primaryKey: true},
    sid: { type: DataTypes.STRING, primaryKey: true},
    expires: { type: DataTypes.DATE},
    data: { type: DataTypes.TEXT},
    createdAt: { type: DataTypes.DATE}
}, { sequelize, tableName: 'Session' })

// Passport functions
passport_auth.use('local', new Strategy(
    { usernameField: 'username' },
    async function (username, password, done) {
        try {
            const find_user = await Database.User.findOne({ where: { username: username } })
            if (find_user === null) {
                throw new Error("That user doesn't exist in the database!")
            } else {
                const compare_pass = await Helpers.comparePassword(password, find_user.password)
                if (!compare_pass || compare_pass instanceof Error) {
                    throw new Error('Incorrect password!')
                } else {
                    return done(null, find_user)
                }
            }
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Something unexpected has occurred!'
            console.error(errorMsg)
            return done(errorMsg, false)
        }
    }
))
passport_auth.serializeUser(function(user, done) {
    return done(null, user)
})
passport_auth.deserializeUser<Session_User>(async function(user, done) {
    try {
        const enable_gravatar = server_config.enable_gravatar
        const find_user = await Database.User.findOne({where: {id: user.id}})
        if (find_user === null) {
            throw new Error("That user doesn't exist in the database!")
        }
        return done(null, {
            id: find_user.id,
            username: find_user.username,
            password: find_user.password,
            email: find_user.email,
            full_name: find_user.full_name,
            auth_token: find_user.auth_token,
            createdAt: find_user.createdAt,
            avatar: enable_gravatar ? Helpers.getGravatarUrl(find_user.email) : ''
        } as Session_User)
    } catch(error) {
        const errorMsg = error instanceof Error ? error.message : 'Something unexpected has occurred!'
        console.error(errorMsg)
        return done(errorMsg, false)
    }
})