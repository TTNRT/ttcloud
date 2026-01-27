//@ts-check
// Package imports
import express from 'express'
import { createServer } from 'node:http'
import {compile_scripts} from './build-assets.js'
import { Database, cookie_config, sequelize, passport_auth } from './handlers/account.ts'
import session from 'express-session'
import flash from 'connect-flash'
import expressLayouts from 'express-ejs-layouts'
import SequelizeStore from 'connect-session-sequelize'

// Server routes
import api_routes from './routes/api.js'
import page_routes from './routes/pages.js'

(async function() {
    // Global variables
    const server = express()
    const httpServer = createServer(server)
    const port = process.env.PORT || 8000
    const server_env = process.env.NODE_ENV
    const sessionStore = SequelizeStore(session.Store)

    // Server settings
    server.set('view engine', 'ejs')
    server.set('layout', './layouts/website')
    server.use(expressLayouts)
    server.use(express.static('public'))
    server.use(express.json())
    server.use(express.urlencoded({extended: false}))
    server.use(session({
        name: cookie_config.name,
        secret: cookie_config.secret,
        resave: false,
        saveUninitialized: false,
        store: new sessionStore({
            db: sequelize,
            checkExpirationInterval: 15 * 60 * 1000,
            expiration: cookie_config.maxAge
        }),
        proxy: cookie_config.proxy,
        cookie: {
            maxAge: cookie_config.maxAge,
            domain: cookie_config.domain || undefined,
            path: '/',
            httpOnly: cookie_config.httpOnly,
            sameSite: 'lax'
        }
    }))
    server.use(flash())
    server.use(passport_auth.initialize())
    server.use(passport_auth.session())
    server.set('trust proxy', server_env === 'production' ? true : false) // Only use this if you are running the server behind a reverse proxy server!

    // Server routes
    server.use(function(req, res, next){
        res.locals.user = req.user
        res.locals.message = req.flash()
        res.locals.originURL = encodeURIComponent(req.originalUrl)
        return next()
    })
    server.use('/fonts/bootstrap-icons.woff', express.static('node_modules/bootstrap-icons/font/fonts/bootstrap-icons.woff'))
    server.use('/fonts/bootstrap-icons.woff2', express.static('node_modules/bootstrap-icons/font/fonts/bootstrap-icons.woff2'))
    server.use('/bootstrap.js', express.static('node_modules/bootstrap/dist/js/bootstrap.bundle.js'))
    server.use('/bootstrap.css', express.static('node_modules/bootstrap/dist/css/bootstrap.css'))
    server.use('/bootstrap-icons.css', express.static('node_modules/bootstrap-icons/font/bootstrap-icons.css'))
    server.use(page_routes)
    server.use('/api', api_routes)

    // Error handlers
    server.use(function(req, res) {
        return res.status(404).json({message: "Cannot find the page or route you're looking for!"})
    })

    // Listen and database function(s)
    await Database.User.sequelize?.sync()
    await Database.Uploads.sequelize?.sync()
    await Database.Session.sequelize?.sync()
    await compile_scripts()
    httpServer.listen(port, function() {
        console.log(`Server has started and is now online! You can use the URL below if you want to see it real-time!`)
        console.log(`http://localhost:${port}`)
    })
})()