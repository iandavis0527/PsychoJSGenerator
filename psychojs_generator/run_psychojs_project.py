import subprocess
import sys


def main():
    process = subprocess.Popen("npm run start", shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

    while True:
        if process.stdout.readable():
            print(process.stdout.readline().decode("utf-8"), end="")
            process.stdout.flush()

        if process.stderr.readable():
            print(process.stderr.readline().decode("utf-8"), file=sys.stderr, end="")
            process.stderr.flush()


if __name__ == "__main__":
    main()
