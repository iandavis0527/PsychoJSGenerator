from setuptools import setup, find_packages

setup(
    name="psychojs_generator",
    version="0.0.2",
    author="Ian Davis",
    author_email="ian.davis.18.ctr@us.af.mil",
    description=(
        "A utility package that can generate nodejs and docker projects to host a custom psychojs project on the web, allowing CSV file uploads via NodeJS and multer."
    ),
    include_package_data=True,
    license="BSD",
    packages=[find_packages()],
    install_requires=["jinja2"],
)
