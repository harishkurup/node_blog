const express = require('express');
const path = require('path');
const { config, engine } = require('express-edge');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const fileUpload = require("express-fileupload");
const expressSession = require('express-session');
const connectMongo = require('connect-mongo');
const connectFlash = require("connect-flash");
const edge = require("edge.js");
const auth = require("./middleware/auth");
const redirectIfAuthenticated = require('./middleware/redirectIfAuthenticated')


// include controllers
const createPostController = require('./controllers/createPost');
const homePageController = require('./controllers/homePage');
const storePostController = require('./controllers/storePost');
const getPostController = require('./controllers/getPost');
const createUserController = require("./controllers/createUser");
const storeUserController = require('./controllers/storeUser');
const loginController = require("./controllers/login");
const loginUserController = require('./controllers/loginUser');
const logoutController = require("./controllers/logout");

const app = new express();

const port = 4000;

app.use(connectFlash());
// Configure Edge if need to
config({ cache: process.env.NODE_ENV === 'production' });
app.use(fileUpload());
app.use(express.static('public'));
app.use(engine);
app.set('views', __dirname+'/views');
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended: true
}));

const mongoStore = connectMongo(expressSession);
app.use(expressSession({
  secret: 'secret',
  store: new mongoStore({
      mongooseConnection: mongoose.connection
  })
}));

app.use('*', (req, res, next) => {
  edge.global('auth', req.session.userId);
  next();
});

// DB connection
mongoose.connect('mongodb://localhost:27017/node-blog', { useUnifiedTopology: true, useNewUrlParser: true })
    .then(() => console.log('You are now connected to MongoDB!'))
    .catch(err => console.error('Something went wrong', err));

// include models
const Post = require('./database/models/post');   

// validation middlewares
const storePost = require('./middleware/storePost');
app.use('/posts/store', storePost);

app.get("/", homePageController);
app.get("/post/:id", getPostController);
app.get("/posts/new", auth, createPostController);
app.post("/posts/store", storePostController);
app.get("/auth/register", redirectIfAuthenticated, createUserController);
app.post("/users/register", redirectIfAuthenticated, storeUserController);
app.get('/auth/login', redirectIfAuthenticated, loginController);
app.post('/users/login', redirectIfAuthenticated, loginUserController);
app.get("/auth/logout", logoutController);

app.listen(port, () => {
  console.log('App Listening on port '+port);
});