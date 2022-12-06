import os
import pathlib
import subprocess
import sys


def is_mac():
    return sys.platform == "darwin"


def is_docker_installed():
    if is_mac():
        return os.path.exists("/usr/local/bin/docker")
    else:
        return (
            pathlib.Path("C", "Program Files", "Docker", "Docker", "Docker Desktop.exe").exists()
            or pathlib.Path("C", "Program Files (x86)", "Docker", "Docker", "Docker Desktop.exe").exists()
        )


def find_docker_installer():
    if is_mac():
        # Mac installation uses brew, so we don't need to worry about a bunch of details.
        return True
    else:
        filepath = pathlib.Path("docker.exe")

    print("Checking for existance of docker installer downloaded at {0}".format(filepath))

    if filepath.exists():
        print("docker installer is already downloaded")
        return filepath


def download_docker_installer():
    download_link = "https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe"
    filename = "docker.exe"
    script_dir = os.path.realpath(os.path.dirname(__file__))
    print("using script filepath: {0}".format(script_dir))
    command = [
        str(pathlib.Path(script_dir, "templates", "wget")),
        download_link,
        "-O",
        "{0}".format(filename),
    ]
    print("Downloading docker installer with command: {0}".format(" ".join(command)))
    process = subprocess.run(command, capture_output=True)
    return filename, process.returncode, process.stderr


def execute_docker_installer(docker_installer_filepath):
    print("Installing Docker to your local machine, you may be asked for your password one or more times...")

    if is_mac():
        command = ["brew", "install", "docker", "--force"]
    else:
        command = [
            [
                docker_installer_filepath,
                "install",
                "--accept-license",
            ]
        ]

    process = subprocess.run(command)

    if not process.returncode == 0:
        print("Failed to execute command {0} while installing docker".format(" ".join(command)))
        print(
            "Please install docker manually using the executable {0} and rerun this script".format(
                docker_installer_filepath
            )
        )
        raise RuntimeError("Failed to install docker automatically: {0}".format(process.stderr))


def install_docker(force_reinstall=False):
    print("Installing docker on local system, please wait...")

    if is_docker_installed() and not force_reinstall:
        print("Docker already installed, nothing to do")
        return

    docker_installer_filepath = find_docker_installer()

    if not docker_installer_filepath:
        docker_installer_filepath, status, stderr = download_docker_installer()

        if not status == 0:
            print(
                "Failed to install docker automatically, please install manually at https://www.docker.com/products/docker-desktop/ and rerun this script."
            )
            raise RuntimeError("Failed to download docker automatically: {0}".format(stderr))

    execute_docker_installer(docker_installer_filepath=docker_installer_filepath)
