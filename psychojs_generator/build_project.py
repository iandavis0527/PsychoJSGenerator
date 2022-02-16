import argparse
import pathlib
from re import L, template
import subprocess
import json
import platform
import shutil
import os
from jinja2 import FileSystemLoader, Environment, select_autoescape


def delete_git_repo(path):
    clean_path = str(path.absolute().resolve())
    if platform.system().lower() == "windows":
        return subprocess.run(
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

    print("Cloning psychojs repo")
    subprocess.run(
        ["git", "clone", "https://github.com/psychopy/psychojs.git", str(temp_dir)],
        shell=True,
    )

    if not use_latest_git:
        subprocess.run(
            ["git", "checkout", "4fea70f605859b0984641268a4243c476e01e059"],
            shell=True,
            cwd=temp_dir,
        )  # we use a specific commit of the psychojs repo to prevent future breaking changes. If you want the latest changes, remove or comment out this line.

    print(
        "Changing version definition in package.json file to match provided psychojs version"
    )
    package_json_filepath = pathlib.Path(temp_dir, "package.json").absolute().resolve()

    with open(package_json_filepath) as psychojs_package_file:
        package_data = json.load(psychojs_package_file)
        package_data["version"] = psychojs_version

    with open(package_json_filepath, "w") as psychojs_package_file:
        json.dump(package_data, psychojs_package_file)

    print("Running npm install inside temp dir at {0}".format(temp_dir))
    subprocess.run(["npm", "install"], cwd=temp_dir, shell=True)
    print("Running npm build js and css inside temp dir at {0}".format(temp_dir))
    subprocess.run(["npm", "run", "build:js"], cwd=temp_dir, shell=True)
    subprocess.run(["npm", "run", "build:css"], cwd=temp_dir, shell=True)

    lib_folder = pathlib.Path(project_path, "lib")

    if not lib_folder.exists():
        lib_folder.mkdir()

    psychojs_dist_pattern = "psychojs-{0}*".format(psychojs_version)

    for dist_file in pathlib.Path(temp_dir, "out").glob(psychojs_dist_pattern):
        destination = pathlib.Path(lib_folder, dist_file.name)
        print(
            "Copying psychojs lib file from {0} to {1}".format(dist_file, destination)
        )
        shutil.copyfile(dist_file, destination)

    delete_git_repo(temp_dir)


def build_npm_repo(project_name, project_path, template_path):
    with open(pathlib.Path(template_path, "package.json")) as package_file:
        package_data = json.load(package_file)

    package_data["name"] = project_name

    with open(pathlib.Path(project_path, "package.json"), "w") as package_file:
        json.dump(package_data, package_file)

    subprocess.run(["npm", "install"], cwd=project_path, shell=True)


def build_node_server(
    project_path,
    template_path,
    server_port=3000,
    result_directory_name="results",
):
    shutil.copyfile(
        pathlib.Path(template_path, "server.js"),
        pathlib.Path(project_path, "server.js"),
    )

    with open(pathlib.Path(template_path, "server_config.json")) as server_config_file:
        server_config = json.load(server_config_file)

    server_config["result_directory"] = result_directory_name
    server_config["port"] = server_port

    with open(
        pathlib.Path(project_path, "server_config.json"),
        "w",
    ) as server_config_file:
        json.dump(server_config, server_config_file)


def build_template(
    project_name,
    psychojs_version,
    use_latest_git=False,
    server_port=3000,
    result_directory_name="results",
):
    project_path = pathlib.Path(project_name).resolve()
    experiment_path = pathlib.Path(project_path, "experiment").resolve()
    template_path = pathlib.Path(pathlib.Path(__file__).parent, "templates")
    template_env = Environment(
        loader=FileSystemLoader(template_path),
        autoescape=select_autoescape(),
    )

    if not project_path.exists():
        print("Creating empty project directory at {0}".format(project_path))
        project_path.mkdir()
    else:
        if len(os.listdir(project_path)) > 0:
            raise RuntimeError(
                "Project directory at {0} exists and is not empty!".format(project_path)
            )

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
        pathlib.Path(template_path, "wrapper.js"),
        pathlib.Path(experiment_path, "wrapper.js"),
    )

    shutil.copyfile(
        pathlib.Path(template_path, "example.js"),
        pathlib.Path(experiment_path, "{0}.js".format(project_name)),
    )

    build_node_server(
        template_path=template_path,
        project_path=project_path,
        server_port=server_port,
        result_directory_name=result_directory_name,
    )

    build_npm_repo(
        project_name=project_name,
        project_path=project_path,
        template_path=template_path,
    )


def main():
    parser = argparse.ArgumentParser(
        "Utility script to generate a project to host a psychojs project"
    )
    parser.add_argument("project_name", help="The name of the project to generate")
    parser.add_argument(
        "psychojs_version",
        default="2021.2.3",
        help="The version of psychojs used by your script (found inside generated JS script)",
    )
    parser.add_argument(
        "--latest_version",
        action="store_true",
        help="Checkout the latest psychojs changes from the git (instead of the stable commit snapshot captured for this template)",
    )
    parser.add_argument(
        "--server_port",
        default=3000,
        type=int,
        help="The port that the project's server will run on",
    )
    parser.add_argument(
        "--result_directory_name",
        default="results",
        help="The name of the directory that results will be stored in (as CSV)",
    )
    args = parser.parse_args()
    build_template(
        project_name=args.project_name,
        psychojs_version=args.psychojs_version,
        use_latest_git=args.latest_version,
        server_port=args.server_port,
        result_directory_name=args.result_directory_name,
    )


if __name__ == "__main__":
    main()
