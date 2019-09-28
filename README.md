API

check: 
lsof  -i:5000

kill:
sudo fuser -k -n tcp 80

db.users.find().pretty()
