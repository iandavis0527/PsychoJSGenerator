rm -rf Mturk_IntExp_Gdn/
python -m psychojs_generator.build_project integration-testing-project/html/Mturk_IntExp_Gdn.js --vm_name vm-online-experiments2 --vm_username iandavis --server_port 4000 --latest_version

rm -rf Mturk_IntExp_Gdn/id_rsa
rm -rf Mturk_IntExp_Gdn/id_rsa.pub

cp ~/.ssh/id_rsa Mturk_IntExp_Gdn/
cp ~/.ssh/id_rsa.pub Mturk_IntExp_Gdn/
