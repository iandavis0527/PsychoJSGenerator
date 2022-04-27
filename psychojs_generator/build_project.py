import argparse
import pathlib
import subprocess
import json
import platform
import shutil
import os
import re

from jinja2 import FileSystemLoader, Environment, select_autoescape


def run_command(args, cwd=None):
    return subprocess.run(" ".join(args), cwd=cwd, shell=True)


def delete_git_repo(path):
    clean_path = str(path.absolute().resolve())

    if platform.system().lower() == "windows":
        return run_command(
            [
                "powershell.exe",
                "Remove-Item",
                "-Recurse",
                "-Force",
                clean_path,
            ]
        )
    else:
        return shutil.rmtree(clean_path)


def bundle_psychojs(project_path, psychojs_version, use_latest_git=False):
    temp_dir = pathlib.Path("temp").resolve()

    if temp_dir.exists():
        delete_git_repo(temp_dir)

    cmd = ["git", "clone", "https://github.com/psychopy/psychojs.git", str(temp_dir)]
    print("Cloning psychojs repo: {0}".format(" ".join(cmd)))
    run_command(cmd)

    if not use_latest_git:
        cmd = ["git", "checkout", "4fea70f605859b0984641268a4243c476e01e059"]
        print("checking out psychojs snapshot: {0}".format(" ".join(cmd)))
        # we use a specific commit of the psychojs repo to prevent future breaking changes.
        # If you want the latest changes, remove or comment out this line.
        run_command(cmd, cwd=temp_dir)

    print("Changing version definition in package.json file to match provided psychojs version")
    package_json_filepath = pathlib.Path(temp_dir, "package.json").absolute().resolve()

    with open(package_json_filepath) as psychojs_package_file:
        package_data = json.load(psychojs_package_file)
        package_data["version"] = psychojs_version

    with open(package_json_filepath, "w") as psychojs_package_file:
        json.dump(package_data, psychojs_package_file)

    print("Running npm install inside temp dir at {0}".format(temp_dir))
    run_command(["npm", "install"], cwd=temp_dir)

    print("Running npm build js and css inside temp dir at {0}".format(temp_dir))
    run_command(["npm", "run", "build:js"], cwd=temp_dir)
    run_command(["npm", "run", "build:css"], cwd=temp_dir)

    lib_folder = pathlib.Path(project_path, "lib")

    if not lib_folder.exists():
        lib_folder.mkdir()

    psychojs_dist_pattern = "psychojs-{0}*".format(psychojs_version)

    for dist_file in pathlib.Path(temp_dir, "out").glob(psychojs_dist_pattern):
        destination = pathlib.Path(lib_folder, dist_file.name)
        print("Copying psychojs lib file from {0} to {1}".format(dist_file, destination))
        shutil.copyfile(dist_file, destination)

    delete_git_repo(temp_dir)


def build_npm_repo(project_name, project_path, template_path):
    with open(pathlib.Path(template_path, "package.json")) as package_file:
        package_data = json.load(package_file)

    package_data["name"] = project_name

    with open(pathlib.Path(project_path, "package.json"), "w") as package_file:
        json.dump(package_data, package_file)

    run_command(["npm", "install"], cwd=project_path)


def build_node_server(
    project_path,
    template_path,
    server_port=3000,
    result_directory_name="results",
    vm_name="vm_name",
    vm_username="vm_username",
):
    shutil.copyfile(
        pathlib.Path(template_path, "server.js"),
        pathlib.Path(project_path, "server.js"),
    )

    with open(pathlib.Path(template_path, "server_config.json")) as server_config_file:
        server_config = json.load(server_config_file)

    server_config["result_directory"] = result_directory_name
    server_config["port"] = server_port

    server_config["vm_name"] = vm_name
    server_config["vm_username"] = vm_username

    with open(
        pathlib.Path(project_path, "server_config.json"),
        "w",
    ) as server_config_file:
        json.dump(server_config, server_config_file, indent=4)


def generate_ssh_key(project_path):
    run_command(
        [
            "ssh-keygen",
            "-q",
            "-t rsa",
            "-N ''",
            '-f "{0}"'.format(project_path.joinpath("id_rsa")),
        ],
        cwd=project_path,
    )


def extract_psychojs_version(project_script_filepath):
    psychojs_import_pattern = re.compile(r"import .*? from ['\"]?./lib/psychojs-(.*?).js['\"]?;")

    with open(project_script_filepath) as project_script_file:
        for line in project_script_file:
            match = psychojs_import_pattern.match(line)

            if match:
                return match.group(1)


def build_wrapper(template_path, experiment_path, psychojs_version):
    wrapper_destination = pathlib.Path(experiment_path, "wrapper.js")
    wrapper_source = pathlib.Path(template_path, "wrapper.js")
    wrapper_source_lines = []

    with open(wrapper_source) as wrapper_source_file:
        for line in wrapper_source_file:
            if line.strip() == 'import { core, data } from "./lib/psychojs-{version}.js";':
                line = 'import {{ core, data }} from "./lib/psychojs-{0}.js";'.format(psychojs_version)

            wrapper_source_lines.append(line)

    with open(wrapper_destination, "w") as wrapper_destination_file:
        wrapper_destination_file.writelines(wrapper_source_lines)


def build_template(
    project_script_name,
    use_latest_git=False,
    server_port=8080,
    result_directory_name="results",
    vm_name="vm_name",
    vm_username="vm_username",
):
    project_name = os.path.splitext(pathlib.Path(project_script_name).resolve().name)[0]
    psychojs_version = extract_psychojs_version(project_script_filepath=project_script_name)
    project_path = pathlib.Path(project_name).resolve()
    experiment_path = pathlib.Path(project_path, "experiment").resolve()
    template_path = pathlib.Path(pathlib.Path(__file__).parent.absolute(), "templates")

    print("Determined psychojs version {0} from project script".format(psychojs_version))
    print("Using template directory {0}".format(template_path))

    template_env = Environment(
        loader=FileSystemLoader(template_path),
        autoescape=select_autoescape(),
    )

    if not project_path.exists():
        print("Creating empty project directory at {0}".format(project_path))
        project_path.mkdir()
    else:
        if len(os.listdir(project_path)) > 0:
            raise RuntimeError("Project directory at {0} exists and is not empty!".format(project_path))

    if not experiment_path.exists():
        experiment_path.mkdir()

    bundle_psychojs(
        project_path=experiment_path,
        psychojs_version=psychojs_version,
        use_latest_git=use_latest_git,
    )

    with open(pathlib.Path(experiment_path, "index.html"), "w") as index_file:
        index_file.write(
            template_env.get_template("index.html.j2").render(
                project_name=project_name,
                psychojs_version=psychojs_version,
            )
        )

    shutil.copyfile(
        pathlib.Path(template_path, "login.ejs"),
        pathlib.Path(experiment_path, "login.ejs"),
    )

    shutil.copyfile(
        pathlib.Path(template_path, "Dockerfile"),
        pathlib.Path(project_path, "Dockerfile"),
    )

    shutil.copyfile(
        pathlib.Path(template_path, "deploy_experiment.py"),
        pathlib.Path(project_path, "deploy_experiment.py"),
    )

    shutil.copyfile(
        pathlib.Path(template_path, "run_docker_container.sh"),
        pathlib.Path(project_path, "run_docker_container.sh"),
    )

    build_wrapper(template_path, experiment_path, psychojs_version)

    resource_folder = pathlib.Path(pathlib.Path(project_script_name).parent, "resources")

    if resource_folder.exists():
        shutil.copytree(resource_folder, pathlib.Path(experiment_path, "resources"))

    shutil.copyfile(
        pathlib.Path(template_path, "auth.js"),
        pathlib.Path(project_path, "auth.js"),
    )

    destination_script_file = pathlib.Path(experiment_path, "{0}.js".format(project_name))

    shutil.copyfile(
        pathlib.Path(project_script_name),
        destination_script_file,
    )

    # fix_script_errors(destination_script_file)

    shutil.copyfile(
        pathlib.Path(template_path.parent, "readme.md"),
        pathlib.Path(experiment_path.parent, "readme.md"),
    )

    build_node_server(
        template_path=template_path,
        project_path=project_path,
        server_port=server_port,
        result_directory_name=result_directory_name,
        vm_name=vm_name,
        vm_username=vm_username,
    )

    build_npm_repo(
        project_name=project_name,
        project_path=project_path,
        template_path=template_path,
    )

    generate_ssh_key(project_path=project_path)


def main():
    parser = argparse.ArgumentParser("Utility script to generate a project to host a psychojs project")
    parser.add_argument(
        "project_script", help="The path to the project script to use for generation (.js file generated by PsychoPy)"
    )
    parser.add_argument(
        "--latest_version",
        action="store_true",
        default=True,
        help="Checkout the latest psychojs changes from the git (instead of the stable commit snapshot captured for this template)",
    )
    parser.add_argument(
        "--server_port",
        default=8080,
        type=int,
        help="The port that the project's server will run on",
    )
    parser.add_argument(
        "--result_directory_name",
        default="results",
        help="The name of the directory that results will be stored in (as CSV)",
    )
    parser.add_argument(
        "--vm_name", default="vm_name", help="The name of your MindModeling VM (leave blank if you don't have one yet)"
    )
    parser.add_argument(
        "--vm_username",
        default="vm_username",
        help="Your MM VM username (leave blank if you don't have one yet)",
    )
    args = parser.parse_args()
    build_template(
        project_script_name=args.project_script,
        # psychojs_version=args.psychojs_version,
        use_latest_git=args.latest_version,
        server_port=args.server_port,
        result_directory_name=args.result_directory_name,
        vm_name=args.vm_name,
        vm_username=args.vm_username,
    )


if __name__ == "__main__":
    main()
