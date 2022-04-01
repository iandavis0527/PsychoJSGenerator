from calendar import c
import datetime
import pathlib
import json
import subprocess


def run_command(args, cwd=None):
    return subprocess.run(" ".join(args), cwd=cwd, shell=True)


def run_scp_command(source, destination, private_key_file, vm_name, vm_username, cwd, recursive=True):
    args = [
        "scp",
        "-i {0}".format(private_key_file),
        '-o ProxyCommand="ssh {0}@udri.mindmodeling.org -W %h:%p"'.format(vm_username),
        source,
        "{0}:{1}".format(vm_name, destination),
    ]

    if recursive:
        args.insert(3, "-r")

    return run_command(args, cwd=cwd)


def run_ssh_command(command, private_key_file, vm_name, vm_username, cwd):
    return run_command(
        [
            "ssh",
            "-i {0}".format(private_key_file),
            '-o ProxyCommand="ssh {0}@udri.mindmodeling.org -W %h:%p"'.format(vm_username),
            vm_name,
            "'{0}'".format(command),
        ],
        cwd=cwd,
    )


def main():
    path = pathlib.Path(__file__).parent.resolve()
    private_key_file = path.joinpath("id_rsa").resolve()

    with open(path.joinpath("server_config.json")) as json_file:
        server_config = json.load(json_file)

    server_port = server_config["port"]
    vm_name = server_config["vm_name"]
    vm_username = server_config["vm_username"]
    container_name = server_config["container_name"]
    version_number = server_config["version_number"]
    today = datetime.datetime.now()
    version_number = ".".join((str(today.year), str(today.month), str(today.day), str(today.hour), str(today.minute)))
    server_config["version_number"] = version_number

    with open(path.joinpath("server_config.json"), "w") as json_file:
        json.dump(server_config, json_file)

    run_ssh_command(
        command="mkdir psychojs-project; mkdir psychojs-project/results",
        private_key_file=private_key_file,
        vm_name=vm_name,
        vm_username=vm_username,
        cwd=path,
    )
    run_scp_command(
        str(path.joinpath("experiment")),
        "~/psychojs-project/experiment",
        private_key_file=private_key_file,
        vm_name=vm_name,
        vm_username=vm_username,
        cwd=path,
        recursive=True,
    )
    run_scp_command(
        " ".join(
            [
                str(path.joinpath("server_config.json")),
                str(path.joinpath("package.json")),
                str(path.joinpath("Dockerfile")),
                str(path.joinpath("server.js")),
                str(path.joinpath("run_docker_container.sh")),
                str(path.joinpath("auth.js")),
            ]
        ),
        "~/psychojs-project/",
        private_key_file=private_key_file,
        vm_name=vm_name,
        vm_username=vm_username,
        cwd=path,
    )
    run_ssh_command(
        "cd ~/psychojs-project/; chmod +x run_docker_container.sh; ./run_docker_container.sh {0} {1} {2} {3}".format(
            container_name,
            "/home/{0}/psychojs-project/results/".format(vm_username),
            version_number,
            server_port,
        ),
        private_key_file=private_key_file,
        vm_name=vm_name,
        vm_username=vm_username,
        cwd=path,
    )


if __name__ == "__main__":
    # parser = argparse.ArgumentParser("Utility script to deploy an experiment to a MindModeling Virtual Machine")
    # parser.add_argument("vm_name", help="The name of your MindModeling Virtual Machine")
    # parser.add_argument("vm_username", help="Your username on the MindModeling Virtual Machine")

    # args = parser.parse_args()
    # main(args.vm_name, args.vm_username)
    main()
