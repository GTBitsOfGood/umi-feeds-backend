# Umi Feeds backend

Backend server for the [Umi Feeds app](https://github.com/GTBitsOfGood/umi-feeds-app)

## Setup

- Clone this repository to your computer.
- Follow the instructions [here](https://www.notion.so/gtbitsofgood/Getting-Started-56106473076a47eaa8c863741becbf34) to install Git, Node.js (v12.X LTS at least).
  - I recommend also installing MongoDB Compass so you can view the database from MongoDB Atlas, but you can also use the MongoDB Atlas website for that (see Bitwarden for the MongoDB Atlas website credentials).
- Navigate to this project in the terminal and run `npm install`.
- On Mac or Linux, run `npm run secrets` to download development secrets from Bitwarden and save them to the `.env` file locally. Contact a leadership member for the Bitwarden password.
  - **Note**: If you are using the Windows command prompt, enter `npm run secrets:login` (logging in only needs to be done once) and then `npm run secrets:sync`. You may have to enter the Bitwarden password multiple times. You should re-run this whenever the secrets in Bitwarden changes.
- Run the dev version of this project by entering `npm run dev`.
- By default, the Express server will use the cloud MongoDB server on MongoDB Atlas as the database. If you want to use a local MongoDB instance hosted by your computer (which you don't have to), install MongoDB Community Server, and then start your local MongoDB server by running `mongod` (this command will work if you created aliases as recommended in [this](https://zellwk.com/blog/install-mongodb/) article). Edit your local .env file (not on Bitwarden) to use your local MongoDB database URI.

## Development

### Code/PR Workflow

- Assign an issue to yourself and move it to the "In Progress" pipeline. You will have to use ZenHub, either through the [Chrome or Firefox extension](https://www.zenhub.com/extension) or through their [web-app](https://app.zenhub.com/), to do this. **Pro-tip**: ZenHub will let you filter issues by labels and milestones.
- Create a new branch in the format `[NAME]/[ISSUE-NUMBER]-[SHORT-DESCRIPTION]` (issue number is optional) by running `git checkout -b [BRANCH NAME]`.
  - example branch name: `daniel/48-setup-ci`
- Be sure to lint, format, and type-check your code occasionally to catch errors by running `npm run lint`. Reach out to an EM if you are having problems with the type-checker or are blocked by anything else in general.
- You can run the unit and integration test suite with `npm run test`.
- Commit changes and then push your branch by running `git push -u origin [BRANCH NAME]`.
- Create a pull request (PR) on GitHub to merge your branch into `develop`.
- In your PR, briefly describe the changes, link the PR to its corresponding issue, and request a Senior Developer or EM as a reviewer.

### TypeScript

The codebase has been primarily written in TypeScript, which is a superset of JavaScript that adds static typing to the language. This means that if you already know how to write JavaScript, you already know how to write TypeScript! Simply rename your `.js` and `.jsx` files to `.ts` and `.tsx`, respectively.

TypeScript will help you catch bugs early at compile-time and save you significant time from manually debugging your code. If your code compiles, you can be very certain that it will work as expected.

To fully utilize the power of TypeScript, you will have to [learn its type system](https://learnxinyminutes.com/docs/typescript/).

While you are encouraged to use TypeScript, you **don't** have to. Our codebase can be a mix of both TypeScript and JavaScript.

## Deployment

### Azure

Our `main` (production) branch is set to auto-deploy to https://spring21-umifeeds-backend.azurewebsites.net/.

### Heroku

Heroku is set to auto-deploy the `develop` branch of this repo to https://umi-feeds-backend.herokuapp.com/.

If you wanted to create another deployment to Heroku for some reason, here's how you would do it:

Create a Heroku app, and in the Heroku dashboard Deploy tab, set it to deploy from this GitHub repo (or your fork, or whatever).

Under the Heroku dashboard Settings tab, make sure to set additional config vars to match the `.env` file. Add the `heroku/nodejs` buildpack.

Make sure to disable production mode. To do this, create a config var called `NPM_CONFIG_PRODUCTION` which is set to `false`. Otherwise, Heroku will not install the dev dependencies properly, and the build will fail. You can set this config var by running the following command in this repo folder, after logging into Heroku CLI:

```sh
heroku config:set NPM_CONFIG_PRODUCTION=false
```

## License

This project is open source and is licensed under the GPL v3. It is based on the starter template [microsoft/TypeScript-Node-Starter](https://github.com/microsoft/TypeScript-Node-Starter/), which has the following license:

    MIT License

    Copyright (c) Microsoft Corporation. All rights reserved.

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in all
    copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
    SOFTWARE
