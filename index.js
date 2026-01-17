//@ts-check
// Package imports
import express from 'express'
import { createServer } from 'node:http'
import {scripts} from './handlers/build-assets'

// Server routes
import api_routes from './routes/api'
import page_routes from './routes/pages'

(async function() {
    // Global variables
    const server = express()
    const httpServer = createServer(server)
    const port = process.env.PORT || 8000
    const server_env = process.env.NODE_ENV

    // Server settings
    server.set('layout', './layouts/website')
    server.set('view engine', 'ejs')
    server.use(express.static('public'))
    server.use(express.json())
    server.use(express.urlencoded({extended: false}))
    server.set('trust proxy', server_env === 'production' ? true : false) // Only use this if you are running the server behind a reverse proxy server!

    // Server routes
    server.use(page_routes)
    server.use('/api', api_routes)
    server.get('/default.js', async function(req, res) {
        const scriptData = await scripts()
        res.setHeader('Content-type', 'text/javascript')
        res.send(scriptData)
    })

    // Error handlers
    server.use(function(req, res) {
        return res.status(404).json({status: 404, message: "Cannot find the page or route you're looking for!"})
    })

    // Listen and database function(s)
    httpServer.listen(port, function() {
        console.log(`Server has started and is now online! You can use the URL below if you want to see it real-time!`)
        console.log(`http://localhost:${port}`)
    })
})()