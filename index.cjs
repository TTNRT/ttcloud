const express = require('express')
const session = require('express-session')
const layouts = require('express-ejs-layouts')

const {pageRoutes, apiRoutes} = require('./routes/index.cjs')

const app = express()
const port = process.env.PORT || 8000

app.set('layout', './layouts/website')
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use(layouts)

// Ensure cookies are only sent over HTTPS in production
const isProduction = process.env.NODE_ENV === 'production';
if (isProduction && process.env.USE_HTTP) {
  console.error('ERROR: Application is running in production mode without HTTPS. Session cookies will not be secure!');
  throw new Error('Refusing to start server in production mode without HTTPS. Set up HTTPS and remove USE_HTTP.');
}
app.use(session({
  name: process.env.COOKIE_NAME || 'ttcloud-cookie-session',
  secret: process.env.COOKIE_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie:{
    maxAge: 24 * 60 * 60 * 1000,
    secure: isProduction, // Always secure in production
    httpOnly: true,
    sameSite: 'lax',
    domain: process.env.COOKIE_DOMAIN || 'localhost'
  }
}))

app.use(pageRoutes)
app.use('/api', apiRoutes)

app.use(function (req, res) { 
  return res.status(404).json({"status": 404, "message": "Cannot find the page or route you're looking for!"})
})

app.listen(port, function() {
  try {
    console.log(`Server has started and is now online! You can use the URL below if you want to see it real-time!`)
    console.log(`http://localhost:${port}`)
  } catch(err) {
    console.error(err)
    console.error(`Something went wrong while attempting to start the server. Check the console log for any errors that might be helpful reguarding this exception!`)
  }
})