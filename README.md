# baseapis
docker build -t mynode ./node \n
docker run -p 4000:4000 -v $PWD/db.json:/app/db.json mynode
