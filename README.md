## Template - something to remember

openssl req -x509 -sha256 -days 356 -nodes -newkey rsa:2048 -subj "/CN=demo.mlopshub.com/C=US/L=San Fransisco" -keyout rootCA.key -out rootCA.crt

##

npm install --only=dev