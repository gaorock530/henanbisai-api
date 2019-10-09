API

check: 
lsof  -i:5000

kill:
sudo fuser -k -n tcp 80

db.users.find().pretty()
db.users.updateOne({unionid: 'oubKi0vS-Euz7nPp7HrRRpMtfIGA'}, {$set: {'auth_level': 2}})
db.users.dropIndex('baoming_id')