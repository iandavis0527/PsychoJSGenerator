rm -rf project1/
python -m psychojs_generator.build_project project1 --vm_name vm-online-experiments2 --vm_username iandavis --server_port 3000

rm -rf project1/id_rsa
rm -rf project1/id_rsa.pub

cp ~/.ssh/id_rsa project1/
cp ~/.ssh/id_rsa.pub project1/

# cd project1
# npm run debug

python project1/deploy_experiment.py
