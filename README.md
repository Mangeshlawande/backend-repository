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


## Custom api response and error handling 

package required

    - cookie-parser
    - cors

search express req/res --:-- 
    req.params : mostly data comes from 
    req.body : form data, files , json
    req.cookies : get data from cookies 
        * when using cookies parser middleware , this property is an object that contain cookiessend by request,
        if the req contain no cookies, it default to empty.

#### app.use()

- we use middleware through app.use()
- we use for configuration settings or middleware

- cors take object , we can set 

    app.use(cors({
        origin : some_specific_url_from _.env ,
        can allow credentials
    }));

- learn cors whitelisting 

#### data handling security settings
`request comes from urls, body , cookies json `;

1. data with json

- can configure  express with json({
    limit: set limit "16kb"
});

2.  data from url:
app.use(express.urlencoded({
    extended:true,
    limit:"16kb"
}))

extended means we can pass object inside object 

3. express.static("public")
    to store some files, images in  folder like  public assets , 

4. cookie-Parser : app
    from my server to clients browser, i can access and set cookies 

    ways to store cookies securely to client browser,
    only server can read cookies, remove cookies 

* Middleware
   - we can use multiple middlewares sequentially 
   (error, req, res, next )
   next[flag] :: talk about middleware , proceed to next if exist  

    /you-tube ----req---->[check if user logged in],[check for admin] then send response
                <----res-----res.send("Hello")


### Make utility file 
 asyncHandler.js

1. need to standardize api error api response also ,

    - learn nodejs apiError
    : can override the methods to control the errors  
