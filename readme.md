# Overview

Leveraging the [PsychoJS](https://www.psychopy.org/online/index.html) library, we expose a utility package that can generate nodejs and docker projects to host a custom psychojs project on the web,
allowing CSV file uploads via NodeJS and multer.

# Before Using

You should take some time to read the high-level documentation for psychojs, linked above. At a minimum, check the [compatibility table](https://www.psychopy.org/online/status.html) to make sure that all the psychopy features you need are supported in psychojs. Some things are at the mercy of the framework and others are at the mercy of browser and web limitations. This utility does not try to fix or maintain these frameworks, just make using them easier.

# Usage

Usage of this project is designed with simplicity and ease of use in mind, and requires only a few steps to get started (this guide assumes windows but should be easily translatable to any OS):

## Dependencies

1. [NodeJS](https://nodejs.org/en/)
1. [python](https://www.python.org/downloads/) (3.6+)
1. [git](https://git-scm.com/downloads)

## Install

### Windows

1. [Windows] Launch `git bash` (from start menu or desktop)
1. [Mac/Linux] Launch a terminal window
1. Install this package using pip: `pip install git+https://github.com/iandavis0527/PsychoJSGenerator.git`
1. Generate a template for your project: `create-psychojs-project {project_name}`
1. Run your project (locally) using: `run-psychojs-project` from your project directory
1. Deploy your project to MM using: See [Deploying to MindModeling](#Deploying-to-MindModeling)

# Local Testing

When developing or testing your experiment, it will be extremely useful to run your server project locally. You can run `npm run start` from a terminal or command prompt in your project directory to start the server, then navigate to http://localhost:3000 in your browser to view your experiment.

# Deploying to MindModeling

When you are ready to deploy your experiment to MindModeling, there are a few extra steps you will need to take.
Collect your SSH public key file and email your MM contact with that file requesting a new VM.

## SSH Key Exchange

The `id_rsa` and `id_rsa.pub` files generated within your project are necessary to setup secure communication with MindModeling, and they make up an SSH key pair. `id_rsa` is a private file, and you should *NOT* share this with anyone. `id_rsa.pub` is the public part of your key that you will need to share with your MindModeling admin in order to access MindModeling. 

## Project SSH Configuration

Once you have exchanged request with your MM contact, you should receive a VM name and VM username. You will need to update your project configs with this information.

1. Open `server_config.json` (plain text file).
1. Change the `vm_name` key to your VM name.
1. Change the `vm_username` key to your VM username.
1. Save the file.
1. You are now ready to deploy to MM using the `deploy_experiment.py` python script.
1. Whenever you make changes to your project, simply run `deploy_experiment.py` again.

# Project Overview

The newly created project will have several template and complete files provided for you, in the following structure:

```
project
│   server.js
│   server_config.json
│   package.json
│   package-lock.json
│
└───experiment
│   │   project.js
│   │   wrapper.js
│   │   index.html
│   │
│   └───lib
│       │   psychojs-2021.2.3.js
│       │   psychojs-2021.2.3.css
│       │   ...
│
└───results
    │   ...
```

These are the key files to note (in order of areas that you will likely change):

- `experiment/project.js`: This file will be named after your project, and this should be the file that psychopy builder generates when you hit "build javascript". For ease of use, you can keep all your psychopy project files in the `experiment` folder.
- `server_config.json`: Configuration file for the server, you won't need to edit this except to change the port that the server listens on or where result CSVs that get uploaded get saved.
- `experiment/index.html`: The main HTML file served by the NodeJS server. You should not need to edit this as the main thing it does is include your experiment/project.js file.
- `package.json`: The npm package definition file, you should not need to edit this. It contains required dependencies for your server to run.
- `server.js`: The core NodeJS server file, you should not need to edit this.
- `experiment/wrapper.js`: This script wraps some psychojs functions to allow us to upload experiment results as CSV to the node server. You should not need to edit this file.
- `package-lock.json`: NPM package lock file, you should **NOT** edit this file. It is generated by npm when installing dependencies.
- `deploy_experiment.py`: This script is how you will deploy your experiment to your VM on MindModeling.
- `id_rsa` and `id_rsa.pub`: This is your SSH Private Key File. This is required in order to SSH into your vm for deployment.

# Troubleshooting

One area of uncertainty with this wrapper relies on the version of psychojs that is being targeted.
It seems that the psychojs repository version (currently 2021.2.1) lags behind the main psychopy version (currently 2021.2.3).
For the sake of compatibility, the generator clones the [psychojs github repository](https://github.com/psychopy/psychojs/blob/main/src/data/index.js) and targets a specific revision,
the HEAD of the repo at the time of writing this tool (02/16/2022).
This tool then directly remaps the 2021.2.1 version to 2021.2.3 by default.
In the future, the builder may target newer and newer versions, and this version replacement will no longer work properly.

To account for this in a new project, you can use the {psychojs_version} parameter of the `create-psychojs-project` script.
The call listed in the usage section would then become: `create-psychojs-project {project_name} {psychojs_version}`

In an existing project built with this tool, you will need to do two things:

1. rename all the files inside of `experiment/lib/` -- `psychojs-2021.2.3 -> psychojs-{psychojs_version}`
1. edit `index.html` and again rename all references `psychojs-2021.2.3 -> psychojs-{psychojs_version}`
