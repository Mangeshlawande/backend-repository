# Only_backend
Img Storage :
    - before useing third party service, store files in our server temporarly, if connection is lost or some error.

### gitignore generator 
- nodejs 

install nodemon -D  
install prettier : need to configure setting project per basis   


src folder structure: 
    - mkdir controllers db middlewares models routes utils
    - touch app.js constants.js server.js

## How To connect database in MERN With Debugging
 * Mongodb atlas gives shared database free   & can upgrade for professional use.

express --:-- app
mongoose --:-- dbConn
npm --> dotenv 


To use Experimental feature for doenv.config : in package.json 
"dev": "nodemon -r dotenv/config --experimental-json-modules src/server.js"


