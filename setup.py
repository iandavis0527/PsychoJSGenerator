from setuptools import setup

setup(
    name="psychojs_generator",
    version="0.0.1",
    author="Ian Davis",
    author_email="ian.davis.18.ctr@us.af.mil",
    description=(
        "A utility package that can generate nodejs and docker projects to host a custom psychojs project on the web, allowing CSV file uploads via NodeJS and multer."
    ),
    license="BSD",
    packages=[],
    install_requires=["jinja2"],
)
