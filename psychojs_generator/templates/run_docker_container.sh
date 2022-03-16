mkdir -p $2
docker stop $1
docker rm $1
docker container prune --force
docker image prune --all --force --filter until=700h
docker build --network=host -t $1:$3 .
docker run --mount type=bind,source="$2",target=/psychojs-project/results -p $4:$4 -d --restart always --name $1 $1:$3

