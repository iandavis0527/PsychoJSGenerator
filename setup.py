from setuptools import setup

setup(
    name="psychojs_generator",
    version="0.0.14",
    author="Ian Davis",
    author_email="ian.davis.18.ctr@us.af.mil",
    description="A utility package that can generate nodejs and docker projects to host a custom psychojs project on the web, allowing CSV file uploads via NodeJS and multer.",
    include_package_data=True,
    license="BSD",
    packages=["psychojs_generator"],
    install_requires=["jinja2"],
    # data_files=[
    #     (
    #         "psychojs_generator",
    #         [
    #             "templates/example.js",
    #             "templates/index.html.j2",
    #             "templates/package.json",
    #             "templates/server_config.json",
    #             "templates/server.js",
    #             "templates/wrapper.js",
    #         ],
    #     ),
    # ],
    entry_points={
        "console_scripts": [
            "create-psychojs-project=psychojs_generator.build_project:main",
        ]
    },
)
