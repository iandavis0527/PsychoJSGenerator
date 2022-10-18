### This module is the intended deploy script to build docker images locally and upload them to the mind modeling server.
### This is designed to support a workaround for DNS issues on MindModeling taking place as of 10-18-2022.
### Since there is no working DNS server available within the Virtual Machines, docker images can't be built properly.
import pathlib
import datetime
import json

from deploy_utils import run_ssh_command


import os
import pathlib
import datetime


def get_version_number():
    return datetime.datetime.now().strftime("%Y-%m-%d-%H-%M")


def upload_docker_image(image_name, version_number, destination, hostname):
    image_name = image_name.replace("_", "-")

    if os.path.exists("{image_name}.tar".format(image_name=image_name)):
        os.remove("{image_name}.tar".format(image_name=image_name))

    if os.path.exists("{image_name}.tar.xz".format(image_name=image_name)):
        os.remove("{image_name}.tar.xz".format(image_name=image_name))

    print("Archiving docker container locally and uploading to server to circumvent ongoing DNS issues with server.")
    print("Considerable wait time ahead, please wait... This may take up to 30 minutes to complete...")

    # Save the built image file to a tar archive for compression and uploading.
    os.system(
        "docker save {image_name}:{version_number} > {image_name}.tar".format(
            version_number=version_number,
            image_name=image_name,
        )
    )
    # Archive the image file using xzip.
    os.system("xz -0 {image_name}.tar".format(image_name=image_name))
    # Upload the saved image archive into the SSH host.
    os.system(
        "scp {image_name}.tar.xz {hostname}:{destination}/{image_name}.tar.xz".format(
            image_name=image_name,
            destination=destination,
            hostname=hostname,
        )
    )
    # Load the uploaded image archive into the docker image list.
    os.system(
        "ssh {hostname} 'docker load < {destination}/{image_name}.tar.xz'".format(
            image_name=image_name,
            destination=destination,
            hostname=hostname,
        )
    )


def run_docker_container(
    container_name,
    version_number,
    mount=True,
    mount_source="/home/mraUser/online_experiments_data",
    mount_folder="",
    mount_destination="/online_experiments_data",
    restart_policy="always",
    port_mappings=None,
    network_mode=None,
    ssh=False,
    hostname=None,
):
    if ssh and not hostname:
        raise RuntimeError("SSH mode enabled on docker run, but no hostname provided!")

    commands = [
        "docker stop {0}".format(container_name),
        "docker rm {0}".format(container_name),
    ]

    run_args = [
        "docker",
        "run",
        "-d",
        "--restart {0}".format(restart_policy),
        "--name {0}".format(container_name),
        "{1}:{0}".format(version_number, container_name.replace("_", "-")),
    ]

    if mount:
        run_args.insert(
            2,
            '--mount type=bind,source="{0}",target={1}'.format(
                pathlib.Path(mount_source, mount_folder), mount_destination
            ),
        )

    if network_mode:
        run_args.insert(3, "--network {0}".format(network_mode))

    if port_mappings:
        mapping = " ".join(
            [
                "{0}:{1}".format(source_port, destination_port)
                for (source_port, destination_port) in port_mappings.items()
            ]
        )
        run_args.insert(3, "-p {0}".format(mapping))

    print("docker run command:")
    print(run_args)

    commands.append(" ".join(run_args))

    if ssh:
        ssh_command = "ssh {hostname} '{command_string}'".format(hostname=hostname, command_string="; ".join(commands))
        print("ssh command: ")
        print(ssh_command)
        os.system(ssh_command)
    else:
        for command in commands:
            os.system(command)


def build_docker_container(image_name, version_number):
    os.system("docker build -t {1}:{0} .".format(version_number, image_name.replace("_", "-")))


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
        command="rm -rf psychojs-project; mkdir psychojs-project; mkdir psychojs-project/results",
        private_key_file=private_key_file,
        vm_name=vm_name,
        vm_username=vm_username,
        cwd=path,
    )

    build_docker_container(container_name, version_number)
    upload_docker_image(
        container_name,
        version_number,
        "/home/{0}/psychojs-project/".format(vm_username),
        hostname=vm_name,
    )
    run_docker_container(
        container_name,
        version_number,
        mount=True,
        mount_source="/home/{0}/psychojs-project/".format(vm_username),
        mount_folder="results",
        mount_destination="/pyschojs-project/results",
        restart_policy="always",
        port_mappings={server_port: server_port},
        ssh=True,
        hostname=vm_name,
    )


if __name__ == "__main__":
    main()
