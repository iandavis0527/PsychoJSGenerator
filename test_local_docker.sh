rm -rf project1/

if python -m psychojs_generator.build_project integration-testing-project/project1.js --vm_name vm-online-experiments2 --vm_username iandavis --force_docker_install --server_port 4000; then
    rm -rf project1/id_rsa
    rm -rf project1/id_rsa.pub

    cp ~/.ssh/id_rsa project1/
    cp ~/.ssh/id_rsa.pub project1/

    cd project1
    python deploy_experiment.py
fi

