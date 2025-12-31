// Package imports
import {Sequelize, DataTypes, Model} from 'sequelize'
import type {InferAttributes, InferCreationAttributes, CreationOptional} from 'sequelize'

// Connect to the database
// For the time being, the database will be using the sqlite3 libary. More information will be explained in the README file!
export const sequelize = new Sequelize({dialect: 'sqlite', storage: '../database.db'})

export class Models {
    static Session = class Session extends Model<InferAttributes<Session>, InferCreationAttributes<Session>> {
        declare id: CreationOptional<number>
        declare sid: string
        declare expires: string
        declare data: string
        declare createdAt: CreationOptional<string>
    }
}

Models.Session.init({
    id: {type: DataTypes.INTEGER.UNSIGNED,autoIncrement: true,primaryKey: true},
    sid: {type: DataTypes.STRING, primaryKey: true},
    expires: {type: DataTypes.DATE},
    data: {type: DataTypes.TEXT},
    createdAt: {type: DataTypes.DATE, allowNull: false}
}, {sequelize, tableName: 'Sessions'})