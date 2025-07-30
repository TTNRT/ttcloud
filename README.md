# TTCloud
A user-friendly cloud service for uploading and sharing files

> [!NOTE]
> Parts of this project, including the files in it, may have some information that require you to have an environment file in order to use them. This is only for privacy reasons, and you need to have your own information. See below for you should have in your environment file.

## Configuration settings
Let's go over what you need to have in your configuration file. Make sure that you have filled out the required ones (if they have bolded text) so that you can run the server correctly.

- **Secure cookie**
    - Make sure that the server is running in `production` mode and that you have a proxy web server that can forward the traffic over and provide a bit of SSL security
    - If you don't have this set in your configuration file, it will be running without a secure cookie session. We recommend that you run the server on your production-based server and not on your development machine
- **Domain-based cookie**
    - Make sure that you have set the `COOKIE_DOMAIN` variable to whatever domain you are using to host the server.
    - If you don't have this set in your configuration file, it will only use the `localhost` domain.
- **Session secret**
    - Make sure that you have a perfectly generated session secret and that it's set with the `COOKIE_SECRET` variable in your configuration file.
    - This is a important requirement as we don't provide any secrets to the server. If you don't have this set in your configuration file, the server will fail to start up until you have added the variable with the session secret you've created.
- Cookie name
    - This is not a general requirement that you need to add, but it's only optional if you want to have a different name for your cookie session. To set a name for it, add the `COOKIE_NAME` variable to your configuration file and you can add anything you want to it.
    - If you don't have this set in your configuration file, it will only use the fallback one and nothing will change with it.

## Helpful resources
If you need some help regarding the settings above or it's something else, check out these links below that might be helpful in your issue case.

- [Generating a session secret](https://dev.to/tkirwa/generate-a-random-jwt-secret-key-39j4)
- [API references](https://expressjs.com/en/5x/api.html)

## Contributing to this project
We need your help on building this so that we can move it to it's pre-release. You can help us out by contributing to this project if you want! See our documentation website on how you can do that! Your help will be greatly appreciated.