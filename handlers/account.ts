import {Sequelize, DataTypes, Model} from 'sequelize'
import jwtKey from 'jsonwebtoken'
import type {InferAttributes, InferCreationAttributes, CreationOptional} from 'sequelize'

const server_env = process.env.NODE_ENV
export const cookie_config = {
    nane: process.env.COOKIE_NAME || 'ttcloud-cookie-session',
    secret: process.env.COOKIE_SECRET || 'session_key_please_change_me',
    domain: process.env.COOKIE_DOMAIN || 'localhost',
    proxy: server_env === 'production' ? true : false,
    maxAge: 24 * 60 * 60 * 1000,
    secure: server_env === 'production' ? true : false,
    httpOnly: true,
    sameSite: 'lax'
}
export const sequelize = new Sequelize({dialect: 'sqlite', storage: '../database.db'})

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
        declare data: Blob
        declare mimetype: string
        declare createdAt: CreationOptional<string>
    }
    static syncDatabase() {
        this.User.init({
            id: {type: DataTypes.INTEGER.UNSIGNED,autoIncrement: true,primaryKey: true},
            username: {type: DataTypes.STRING,allowNull: false},
            password: {type: DataTypes.STRING,allowNull: false},
            email: {type: DataTypes.STRING, allowNull: false, unique: true, validate: {isEmail: true}},
            full_name: {type: DataTypes.STRING,allowNull: false},
            disabled: {type: DataTypes.BOOLEAN,allowNull: false},
            activated: {type: DataTypes.BOOLEAN,allowNull: false},
            auth_token: {type: DataTypes.STRING,allowNull: false},
            createdAt: {type: DataTypes.DATE, allowNull: false}
        }, {sequelize, tableName: 'User'})
        this.Uploads.init({
            id: {type: DataTypes.INTEGER.UNSIGNED,autoIncrement: true,primaryKey: true},
            name: {type: DataTypes.STRING,allowNull: false},
            data: {type: DataTypes.BLOB('long'), allowNull: false},
            mimetype: {type: DataTypes.STRING, allowNull: false},
            createdAt: {type: DataTypes.DATE, allowNull: false}
        }, {sequelize, updatedAt: false, tableName: 'Uploads'})
    }
}
export class Helpers {

}