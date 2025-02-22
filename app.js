const express = require('express')
const session = require('express-session')
const layouts = require('express-ejs-layouts')

const pageRoutes = require('./routes/pages')
const apiRoutes = require('./routes/api')

const app = express()
const port = process.env.PORT || 8000
const cookieSettings = {name: 'ttcloud-cookie-session', secret: process.env.COOKIE_SECRET, resave: false, saveUninitialized: false, cookie: {maxAge: 24 * 60 * 60 * 1000}}

app.set('layout', './layouts/website')
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(layouts)

app.use(session(cookieSettings))

app.use(pageRoutes)
app.use('/api', apiRoutes)

app.use((req, res, next) => { 
  res.status(404).json({"status": 404, "message": "Cannot find the page or route you're looking for!"})
})

app.listen(port, function() {
    console.log(`Server is now running! See it in action here: http://localhost:${port}`)
})