# Overview

Leveraging the [PsychoJS](https://www.psychopy.org/online/index.html) library, provide a utility tool which helps host these experiments using the MindModeling server architecture.

# Before Using

You should take some time to read the high-level documentation for PsychoJS, linked above. At a minimum, check the [compatibility table](https://www.psychopy.org/online/status.html) to make sure that all the psychopy features you need are supported in PsychoJS. Some things are at the mercy of the framework and others are at the mercy of browser and web limitations. This utility does not try to fix or maintain these frameworks, just make using them easier.

Also please take note that if using custom code blocks in the psychopy builder, the Auto->JS feature is a crude translator that should not be trusted for complex tasks. If you find yourself relying on or importing any python standard libraries in code you write, note that the javascript translation is *extremely unlikely* to work. To deal with this, you have one of two options:

* maintain two versions of your code, one in python and one in javascript, and set the code type to "both" instead of "auto->js"
* avoid using any libraries (including python standard libraries) and instead write your own python functions for any functionality you need. Note that even this method may still have translation issues in specific scenarios.

# Usage

This project is designed with simplicity and ease of use in mind, and requires only a few steps to get started (this guide assumes windows but should be easily translatable to any OS):

## Dependencies

1. [NodeJS](https://nodejs.org/en/) (version 16.14.0 on MacOS at the time of writing this, 04/18/2022)
1. [python](https://www.python.org/downloads/) (3.6+)
1. [git](https://git-scm.com/downloads) (version 2.23.0 on MacOS at the time of writing this, 04/18/2022)
1. [Docker](https://www.docker.com/) `(NOTE: the script will attempt to auto download and install this!)`

## Install

1. Build the Javascript version of your experiment (from the Builder interface, you can use the ![javascript-build-button](https://user-images.githubusercontent.com/99781049/165622217-4e81a0cf-6f92-4d57-b1de-4626773b306c.png) button)
1. [Windows] Launch `git bash` (from start menu or desktop)
1. [Mac/Linux] Launch a terminal window
   1. All the steps below should be run within this terminal window. You can simply copy and paste the commands, and replace name where relevant.
1. Install this package using pip: `pip install git+https://github.com/iandavis0527/PsychoJSGenerator.git`
1. Generate a template for your project: `create-psychojs-project /path/to/project_script.js`. Replace the path with the path to your PsychoJS generated .js file. This will usually be located within an 'html' folder next to your psychopy experiment file, after building the javascript version.
1. Run your project (locally) using: See [Local Testing](#Local-Testing)
1. Deploy your project to MindModeling using: See [Deploying to MindModeling](#Deploying-to-MindModeling)

# Local Testing

When developing or testing your experiment, it will be extremely useful to run your server project locally.
You can run `run-psychojs-project` from a terminal or command prompt in your project directory to start the server, then navigate to http://localhost:8080 in your browser to view your experiment.

# Deploying to MindModeling

When you are ready to deploy your experiment to MindModeling, you will need to acquire a virtual machine by contacting the MindModeling administrators.
You should get contact information for these individuals from your original contact about MindModeling.

## Secure Shell (SSH) Key Exchange

The `id_rsa` and `id_rsa.pub` files generated within your project are necessary to setup secure communication with MindModeling, and they make up an SSH key pair.

- `id_rsa` is a private file, and you should **NOT** share this with anyone.
- `id_rsa.pub` is the public part of your key that you will need to share with your MindModeling admin in order to access MindModeling.

You will need to pick out a few names:

- The `machine_name` of your virtual machine. This will be an internal name only used by you and your team, and can be anything you like. You will use it to connect to your machine via the internet and configure files. Depending on the needs of the administrator, this may be prepended with the letters `vm-`.
- Your `vm_username` on your virtual machine. By default, this will be your name (firstnamelastname) with no spaces or caps, but you may request a specific username if desired. This is also internal and will be used to connect your machine for hosting and configuring.
- The `sub-url` that you will reach your experiment at. Once hosted, your experiment will be accessible from a browser at https://sub-url.mindmodeling.org

Collect your `id_rsa.pub` file and attach it to an email to your MindModeling administrator. Here is a template email to use (replace using the names you decided in the checklist above):

```
--- Subject: MindModeling Virtual Machine Request ---
Hello MindModeling administrators,
I would like to request a virtual machine on MindModeling to host an experiment for data collection.
I will be using the PsychoJS Generator tool developed by Ian Davis.
I have an existing MindModeling account {account name}, and have permission to use MindModeling from {contact name}.
I would like my virtual machine to be named {machine_name}.
I would like my virtual machine username to be {vm_username}.
I would like to redirect internet traffic to the url https://sub_url.mindmodeling.org to my virtual machine at port 8080.
I have attached my id_rsa.pub file for SSH access.
I would also like to know the local network IP Address of my Virtual Machine, in order to work around any DNS issues.
```

## Project SSH Configuration

Once you have received confirmation of your virtual machine setup from the MindModeling adminstrator, you will need to update your project configuration with the relevant information. The contact should also provide a `Local IP Address (e.g. 192.168.1.1)` in their response. You will need this in the steps below.

1. Open `server_config.json` (plain text file).
1. Change the `vm_name` key to the `Local IP Address` provided to you, as mentioned above.
1. Change the `vm_username` key to your virtual machine username.
1. Save the file.
1. You are now ready to deploy to MindModeling using the `deploy_experiment.py` python script.
1. Whenever you make changes to your project, simply run `deploy_experiment.py` again. This will ensure the changes are propagated on your MindModeling virtual machine.

For example, a filled in `server_config.json` file might look like this:

```
{
  "result_directory": "results",
  "port": 8080,
  "vm_name": "my-virtual-machine",
  "vm_username": "iandavis",
  "container_name": "PsychoJS-project",
  "version_number": "2020.01.01.00.00",
  "resource_directory": "./experiment/resources"
}

```

# Project Overview

The newly created project will have several template files and complete files provided for you, in the following structure:

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
│       │   PsychoJS-2021.2.3.js
│       │   PsychoJS-2021.2.3.css
│       │   ...
│
└───results
    │   ...
```

These are the key files to note (in order of areas that you will likely change):

- `experiment/project.js`: This file will be named after your project, and this should be the file that PsychoPy builder generates when you hit "build javascript". For ease of use, you can keep all your PsychoPy project files in the `experiment` folder.
- `server_config.json`: Configuration file for the server. You won't need to edit this except to change the port that the server listens on, or where uploaded result CSVs are saved.
- `experiment/index.html`: The main HTML file served by the NodeJS server. You should not need to edit this as its main purpose is to include your experiment/project.js file.
- `package.json`: The NPM package definition file. You should not need to edit this as it contains required dependencies for your server to run.
- `server.js`: The core NodeJS server file. You should not need to edit this.
- `experiment/wrapper.js`: This script wraps some PsychoJS functions to allow the tool to upload experiment results as CSV to the node server. You should not need to edit this file.
- `package-lock.json`: NPM package lock file. You should **NOT** edit this file. It is generated by npm when installing dependencies.
- `deploy_experiment.py`: This script is how you will deploy your experiment to your virtual machine on MindModeling.
- `id_rsa` and `id_rsa.pub`: This is your SSH Private Key File. This is required in order to SSH into your virtual machine for deployment.

# Troubleshooting

## Docker Workarounds
Due to the potential for DNS and network issues, or limited network connectivity in production environments, this tool has been modified as of 10/22 to support building docker containers locally and deploying the prebuilt image, rather than building the containers on the production environment.
Currently, this feature is enabled automatically by testing the deploy server's dns capabilities by pinging google before building. It then decides whether or not a local build will be required, and proceeds accordingly.

## Windows Script Execution Errors
On windows, you may encounter errors when trying to run `create-psychojs-project` along the lines of: `script cannot be loaded because running scripts is disabled on this system.` If you run into this error, follow these steps (requires administrative rights):

1. Open a powershell window as admin. To do this, type "powershell" into the start menu, right click and run as administrator.
1. Run this command: `Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope CurrentUser`
1. When prompted: Enter 'A'

## Update 04/18/2022

The tool was updated to extrapolate the required PsychoJS version from your project by requiring you to provide your PsychoJS Javascript generated file when creating the project.
Once we've determined what version your code expects, we target the latest version and then rename the generated PsychoJS lib files to match that version.
Unlike previously mentioned, the candidate version 2021.2.1 is NOT a good idea, as it missing important features for projects, notably the MultiStairHandler.

## Browser Caching

During development of your project, you may occasionally run into issues where your recent changes don't show up when deploying to MindModeling, or even when running locally (this should be rare).
This can be caused by browser caches storing older versions of your experiment and not recognizing that there are newer changes available.
If this happens, always try to clear your browser cache first (it should be sufficient to clear images/files, keep cookies and everything else to prevent being signed out of other sites).

## OUT OF DATE See update above

<s>One area of uncertainty with this wrapper relies on the version of PsychoJS that is being targeted.
It seems that the PsychoJS repository version (currently 2021.2.1) lags behind the main psychopy version (currently 2021.2.3).
For the sake of compatibility, the generator clones the [PsychoJS github repository](https://github.com/psychopy/PsychoJS/blob/main/src/data/index.js) and targets a specific revision,
the HEAD of the repo at the time of writing this tool (02/16/2022).
This tool then directly remaps the 2021.2.1 version to 2021.2.3 by default.
In the future, the builder may target newer and newer versions, and this version replacement will no longer work properly.

To account for this in a new project, you can use the {PsychoJS_version} parameter of the `create-PsychoJS-project` script.
The call listed in the usage section would then become: `create-PsychoJS-project {project_name} {PsychoJS_version}`

In an existing project built with this tool, you will need to do two things:

1. Inside the newly generated project folder, the `experiment` folder should contain any additional files necessary. The `resources` directory should be found and copied over by the create-PsychoJS-project tool automatically, but if anything is missing, you can copy them over manually to fix this problem.
1. rename all the files inside of `experiment/lib/` -- `PsychoJS-2021.2.3 -> PsychoJS-{PsychoJS_version}`
1. edit `index.html` and again rename all references `PsychoJS-2021.2.3 -> PsychoJS-{PsychoJS_version}`</s>
