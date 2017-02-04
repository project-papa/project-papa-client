# Project Papa Client

###

## Contributing

### Setting up the repo

To get ready to make contributions, you'll need to have your own version of this repository. We use [Git](https://git-scm.com/) for version control, and we're hosting it on GitHub.

This guide will only have a high-level overview of Git. There are plenty of guides you can follow online to get a better idea. You can also ask someone else on the Papa team for help.

Fork this repository from your account by clicking on the "Fork" button at the top right

With Git installed, clone your fork, and configure the repository

```
git clone https://github.com/<<YOUR USERNAME>>/project-papa-client
cd project-papa-client
git remote add upstream https://github.com/project-papa/project-papa-client
```

You will be making changes to your local fork, pushing them, then opening pull requests against the canonical copy (upstream).

If changes have been made to the canonical copy, you can pull them down at any time:

```
git checkout master
git pull upstream master
```

### Building and running

This project uses Yarn for package management and Webpack for building. Both of which depend on Node.

- [Install Node.js](https://nodejs.org/en/)
- [Install Yarn](https://yarnpkg.com/docs/install)

**Please don't use npm.** Yarn gives us deterministic builds, and is much faster for you.

First, install all of the projects dependencies. You will have to do this whenever someone else adds new dependencies, as well

```
yarn
```

When you want to develop, simply start the `serve` script.

```
yarn serve
```

It will give you a URL that you can visit in your browser which has the project.

Changes you make in `src` will automatically be rebuilt, and your browser will automatically refresh.

Yarn is our package manager. Want to add a package to the codebase? [Have a read up online](https://yarnpkg.com/docs).

### Typescript and Linting

Typescript makes sure we are type safe but can also give you a lot of nice editor features such as code completion
and inline errors. We also have a linter for code style (this will be part of our test suite), and you can get warnings on that
in your editor.

[Visual Studio Code](https://code.visualstudio.com/) with the [TSLint extension](https://marketplace.visualstudio.com/items?itemName=eg2.tslint) is recommended. However, there are plugins/extensions for other editors.

### Testing

We aim for 100% test coverage for new code (but this is not mandatory). You can run the tests for the project with

```
yarn test
```

To just test a particular file, you can pass in a test string

```
yarn text mycoollib.ts
```

Tests live in a `__tests__` directory which is in the same directory as the file it is testing. This keeps tests close
to the code they're testing.

We use [Jest](https://facebook.github.io/jest/) for testing, you can read up on all the ins and outs on their website.

### Making Changes

To make changes, you want to check out a new branch

```
git checkout -b BRANCH_NAME
```

Then you want to commit your changes, and push them to your fork

```
git add . # Add all changed files
git commit -m "MY MESSAGE" # Make a commit with a message
git push origin HEAD # Push the newly committed branch to your fork
```

After this, you'll be able to make a pull request by going to the repository home page (this page) and clicking the big "Pull Request" button that should appear

### Code Review

Your changes will need to be approved by another member of the team. Nominate one when you're making a pull request.

Smaller changes are easier to review than larger ones, so it is wise to keep pull requests small. It will also help you as a developer to make focused changes.
