# TTCloud
A user-friendly cloud service for uploading and sharing files

> [!NOTE]
> Parts of this project, including the files in it, may have some information that requires you to have an environment variables file. Refer to this [section](#configuration-settings) for more information!

> [!IMPORTANT]
> The database will be using the Sqlite library as it's main purpose for gathering, editing, and creating data from the server. As of the latest commit, we've added the database models, but will be using the SQlite3 library until we can find a way to detect the user's database and what dialect they will be using for this application
>
> Note that SQlite3 is able to handle a large number of requests, but you should be aware that it's not really recommended for your production server, and it only should be used for your development needs. Further changes will be made soon once we come up with something to this issue!

## Configuration settings
Let's go over on what you need to have in your environment variables file. Make sure that you have filled out the required ones (if they have bolded text) so that you can run the server correctly without any errors!

- **Secure cookie**
    - Make sure that the server is running in `production` mode and that you have a proxy web server that can forward the traffic over and provide a bit of SSL security with it. To do this, add the `NODE_ENV` variable to your environment variables file, and the value is set to `production`.
    - If you don't have this set in your environment variables file, it will be running without a secure cookie session. We recommend that you've set this only for your production server and nothing else!
    - If you are running the server in a Docker container, you don't need to set this variable as the compose file that is included with the source code has it set for you.
- **Domain-based cookie**
    - Make sure that you have set the `COOKIE_DOMAIN` variable to whatever domain you are using to host the server.
    - If you don't have this set in your configuration file, it will only use the `localhost` domain.
- **Session secret**
    - Make sure that you have a perfectly generated session secret and that it's set with the `COOKIE_SECRET` variable in your configuration file.
    - This is a important requirement as we don't provide any secrets to the server. If you don't have this set in your configuration file, the server will fail to start up until you have added the variable with the session secret you've created.
    - Even though that this is a requirement, by default, there is a secret added if you don't add this to your environment variables. Regardless, **you should still add this variable** to prevent any incidents or attacks that may come your way.
- Cookie name
    - This is not a general requirement that you need to add, but it's only optional if you want to have a different name for your cookie session. To set a name for it, add the `COOKIE_NAME` variable to your configuration file and you can add anything you want to it. You should only have dashes for when you are adding spaces to your cookie name to prevent any errors that come up from the server!
    - If you don't have this set in your configuration file, it will only use the fallback one and nothing will change with it.
- Enable Gravatar
    - This is not a general requirement that you need to add, but it's only optional if you want to use the Gravatar API and use an avatar that you've uploaded to your account from their website! This requires you to have an email here and an account on their website, along with the email that you want to use here linked to your account as well!
    - To enable it, add the `ENABLE_GRAVATAR` variable to your configuration file and set the value to `true`.
- Server domain
    - This is very similar to the Domain-based cookie setting, but this one helps out in creating URL's for some routes, such as the file upload route that is located in the API routes file. It is recommended that you set this to match with your cookie domain, expect it should have `https` at the start of the value.
    - To set this, add the `SERVER_DOMAIN` variable to your configuration file and set the value to your cookie domain. If you are using SSL from a proxy server, you should consider adding `https://` at the start.

Once you've added these configuration settings to your `.env` file, here's an example of what it will look like.

```bash
PORT="8000"
NODE_ENV="production"
COOKIE_DOMAIN="example.com"
COOKIE_SECRET="this_is_not_a_secret"
COOKIE_NAME="ttcloud-cookie-session"
ENABLE_GRAVATAR="true"
SERVER_DOMAIN="https://example.com"
```

## Helpful resources
If you need some help regarding the settings above or it's something else, check out these links below that might be helpful in your issue case.

- [Generating a session secret](https://dev.to/tkirwa/generate-a-random-jwt-secret-key-39j4)
- [API references](https://expressjs.com/en/5x/api.html)

## Contributing to this project
We need your help on building this so that we can move it to it's pre-release. You can help us out by contributing to this project if you want! See our documentation website on how you can do that! Your help will be greatly appreciated.

## To-do list
- [ ] Install the Bootstrap library for the website design
- [ ] Add the Docker files for building and running the server inside a container
- [ ] Construct the website layout and add in the pages
- [ ] Add the required API routes
- [x] Build the login system using the `passport` library
- [x] Add in the other required database models
