from calendar import c
import datetime
import pathlib
import json

import deploy_experiment_local_builds

from deploy_utils import run_scp_command, run_ssh_command, check_vm_dns


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

    dns_available = check_vm_dns(vm_name)

    if not dns_available:
        print(
            "Virtual Machine DNS Check failed, couldn't ping www.google.com. Resorting to local docker image builds instead."
        )
        # Check the VMs DNS by pinging google.com. If we can't hit it, assume the DNS issues are persisting and that we will need to suffice with local builds for now.
        return deploy_experiment_local_builds.main()

    run_ssh_command(
        command="rm -rf psychojs-project; mkdir psychojs-project; mkdir psychojs-project/results",
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
