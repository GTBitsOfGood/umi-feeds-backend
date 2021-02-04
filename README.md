# Umi Feeds backend

Backend server for the [Umi Feeds app](https://github.com/GTBitsOfGood/umi-feeds-app)

## Setup

- Clone this repository to your computer.
- Follow the instructions [here](https://www.notion.so/gtbitsofgood/Getting-Started-56106473076a47eaa8c863741becbf34) to install Git, Node.js (v12.X LTS at least) and the MongoDB Community Server.
- Create a MongoDB database, perhaps on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas). Remember to whitelist your connection IP address. Copy `.env.example` into a new `.env` file and replace the MongoDB <password> in `MONGODB_URI` with your actual one.
- Navigate to this project in the terminal and run `npm install`.
- Run `npm secrets` to sync development secrets from Bitwarden and save them to `.env.local` file locally. Contact a leadership member for the Bitwarden password.
  - **Note**: If you are using the Windows command prompt, enter `npm secrets:login` and then `npm secrets:sync`.
- Start your local MongoDB server by running `mongod` (this command will work if you created aliases as recommended in [this](https://zellwk.com/blog/install-mongodb/) article).
- Next, perform migrations on your local database: `npm db:migrate up`. You should run this command whenever a new migration is added to the codebase; you can run `npm db:migrate status` to check if your local database is up to date.
- Run the dev version of this project by entering `npm start`.
- In production, if you end up using cookies, you should change the `SESSION_SECRET` environment variable.

## Code/PR Workflow

- Assign an issue to yourself and move it to the "In Progress" pipeline. You will have to use ZenHub, either through the [Chrome extension](https://chrome.google.com/webstore/detail/zenhub-for-github/ogcgkffhplmphkaahpmffcafajaocjbd) or through their [web-app](https://app.zenhub.com/), to do this. **Pro-tip**: ZenHub will let you filter issues by labels and milestones. Depending on your sub-team, you may want to filter by the "CORE", "DMS" or "VMS" labels and select the current sprint under milestones.
- Create a new branch in the format `[NAME]/[ISSUE-NUMBER]-[SHORT_DESCRIPTION]` (issue number is optional) by running `git checkout -b [BRANCH NAME]`.
  - example branch name: `daniel/48-setup-ci`
- Be sure to lint, format, and type-check your code occasionally to catch errors by running `npm lint`. Reach out to an EM if you are having problems with the type-checker or are blocked by anything else in general.
- Commit changes and then push your branch by running `git push -u origin [BRANCH NAME]`.
- Create a pull request (PR) on GitHub to merge your branch into `develop`.
- In your PR, briefly describe the changes, link the PR to its corresponding issue, and request a Senior Developer or EM as a reviewer.

## TypeScript

The codebase has been primarily written in TypeScript, which is a superset of JavaScript that adds static typing to the language. This means that if you already know how to write JavaScript, you already know how to write TypeScript! Simply rename your `.js` and `.jsx` files to `.ts` and `.tsx`, respectively.

TypeScript will help you catch bugs early at compile-time and save you significant time from manually debugging your code. If your code compiles, you can be very certain that it will work as expected.

To fully utilize the power of TypeScript, you will have to [learn its type system](https://learnxinyminutes.com/docs/typescript/). Use [this](https://github.com/typescript-cheatsheets/react-typescript-cheatsheet/blob/master/README.md#section-2-getting-started) as a cheat sheet for using TypeScript with React.

While you are encouraged to use TypeScript, you **don't** have to. Our codebase can be a mix of both TypeScript and JavaScript.

## Migrations

TODO: Add a note about migrations, why we are using them, and how to create and run them.

## License

This project is licensed under the GPL v3. It is based on the starter template [microsoft/TypeScript-Node-Starter](https://github.com/microsoft/TypeScript-Node-Starter/), which has the following license:

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
