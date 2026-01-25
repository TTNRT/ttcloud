//@ts-check
// Package imports
import express from 'express'
import multer from 'multer'
import { Helpers, passport_auth, Database, server_config} from '../handlers/account.ts'

// Variables
const router = express()
const file_upload = multer({storage: multer.memoryStorage()}).single('file_data')


// Routes
router.post('/auth/:method', async function(req, res, next) {
    try {
        switch (req.params.method) {
            case 'login':
                passport_auth.authenticate('local', function(/** @type {Error} */ error, /** @type {Express.User} */ user, /** @type {any} */ info) {
                    if (error) {
                        throw new Error(error.message)
                    }
                    if (!user) {
                        throw new Error(info)
                    }
                    req.logIn(user, function(error) {
                        if (error) {
                            throw new Error(error.message)
                        }
                        return res.json({message: "Session has been added to your browser!"})
                    })
                })(req, res, next)
            case 'signup':
                const form_params = {
                    username: req.body.username,
                    password: req.body.password,
                    email: req.body.email,
                    full_name: req.body.full_name
                }
                if (!form_params.username || !form_params.password || !form_params.email || !form_params.full_name) {
                    console.log("Some URL params are required for this route! Please review them and then try again!")
                    return res.status(500).json({
                        message: "Some URL params are required for this route! Please review them and then try again!",
                        required: {
                            username: form_params.username ? true : false,
                            password: form_params.password ? true : false,
                            email: form_params.email ? true : false,
                            full_name: form_params.full_name ? true : false
                        }
                    })
                }
                const check_user = await Database.User.findOne({where: {
                    username: form_params.username,
                    email: form_params.email,
                    full_name: form_params.full_name
                }})
                if (check_user !== null) {
                    throw new Error("That user already exists!")
                } else {
                    const hashed_pass = await Helpers.createPassword(form_params.password)
                    if (hashed_pass instanceof Error) {
                        throw new Error(hashed_pass.message)
                    }
                    await Database.User.create({
                        username: form_params.username,
                        password: hashed_pass,
                        email: form_params.email,
                        full_name: form_params.full_name,
                        disabled: false,
                        activated: true,
                        auth_token: Helpers.createAuthToken(20)
                    })
                    return res.json({
                        message: "Account has been created!"
                    })
                }
        }
    } catch(error) {
        const errorMsg = error instanceof Error ? error.message : 'Something unexpected has occurred!'
        console.error(errorMsg)
        return res.status(500).json({message: errorMsg})
    }
})
router.post('/upload_file', file_upload, async function(req, res) {
    const token_header = req.headers.authorization
    if (token_header === undefined) {
        throw new Error("You need to have your API token in order to use this route!")
    }
    const search_token = await Helpers.findAPIToken(token_header)
    if (search_token instanceof Error) {
        throw new Error(search_token.message)
    }
    try {
        const meta_data = {
            name: req.file?.originalname,
            buffer: req.file?.buffer,
            type: req.file?.mimetype
        }
        if (meta_data.name === undefined || meta_data.type === undefined || meta_data.buffer === undefined) {
            throw new Error("Something went wrong during the uploading process! Check the console logs for any errors and then try again!")
        } else {
            await Database.Uploads.create({
                name: meta_data.name,
                data: meta_data.buffer,
                mimetype: meta_data.type,
                user_id: search_token.id
            })
            return res.json({message: "File has been uploaded to the database!", url: `${server_config.server_domain}/upload/${meta_data.name}`})
        }
    } catch(error) {
        const errorMsg = error instanceof Error ? error.message : 'Something unexpected has occurred!'
        console.error(errorMsg)
        return res.status(500).json({message: errorMsg})
    }
})
router.get('/users', async function(req, res) {
    try {
        const token_header = req.headers.authorization
        if (token_header === undefined) {
            throw new Error("You need to have your API token in order to use this route!")
        }
        const search_token = await Helpers.findAPIToken(token_header)
        if (search_token instanceof Error) {
            throw new Error(search_token.message)
        }
        const grab_users = await Database.User.findAll({
            attributes: ['id', 'username', 'email', 'full_name', 'createdAt']
        })
        return res.json(grab_users)
    } catch(error) {
        const errorMsg = error instanceof Error ? error.message : 'Something unexpected has occurred!'
        console.error(errorMsg)
        return res.status(500).json({message: errorMsg})
    }
})
router.get('/users/:id', async function(req, res) {
    try {
        const token_header = req.headers.authorization
        if (token_header === undefined) {
            throw new Error("You need to have your API token in order to use this route!")
        }
        const search_token = await Helpers.findAPIToken(token_header)
        if (search_token instanceof Error) {
            throw new Error(search_token.message)
        }
        const grab_user = await Database.User.findOne({
            attributes: ['id', 'username', 'email', 'full_name', 'createdAt'],
            where: {
                id: req.params.id
            }
        })
        if (grab_user === null) {
            throw new Error("That user doesn't exist!")
        } else {
            return res.json(grab_user)
        }
    } catch(error) {
        const errorMsg = error instanceof Error ? error.message : 'Something unexpected has occurred!'
        console.error(errorMsg)
        return res.status(500).json({message: errorMsg})
    }
})

export default router