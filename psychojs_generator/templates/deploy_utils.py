import subprocess


def check_vm_dns(vm_name, domain_to_check="www.google.com"):
    process = run_command("ssh {0} 'ping {1} -t2000 -c1'".format(vm_name, domain_to_check))
    return process.returncode == 0


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
