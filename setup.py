import shutil
import pathlib

from setuptools import setup


shutil.copyfile(
    pathlib.Path(pathlib.Path(__file__).parent, "readme.md"),
    pathlib.Path(pathlib.Path(__file__).parent, "psychojs_generator", "readme.md"),
)


setup(
    name="psychojs_generator",
    version="0.0.26",
    author="Ian Davis",
    author_email="iandavis0527@gmail.com",
    description="A utility package that can generate nodejs and docker projects to host a custom psychojs project on the web, allowing CSV file uploads via NodeJS and multer.",
    include_package_data=True,
    license="BSD",
    packages=["psychojs_generator"],
    install_requires=["jinja2"],
    entry_points={
        "console_scripts": [
            "create-psychojs-project=psychojs_generator.build_project:main",
        ]
    },
)
