require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const swaggerUi = require('swagger-ui-express');
const jwt = require("jsonwebtoken");
const cors = require('cors');
const swaggerDocument = require('./docs/swagger.json');
const ErrorResponse = require('./utils/errorResponse');
const errorHandler = require('./utils/errorHandler');
const authorize = require('./middleware/authorize');
const { NODE_ENV } = process.env;

const app = express();

process.env.TZ = 'Asia/Kolkata';

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));
let db = process.env.mongoConnectionString || 'mongodb+srv://admin:1234@cluster0.u1a2b.mongodb.net/HRBuddy'
mongoose
	.connect(db, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => {
		console.log('connected to database');
	})
	.catch(() => {
		console.log('Mongodb connection error');
	});
// mongoose.set('useCreateIndex', true);

// enable cors
app.use(cors());
app.options('*', cors());

app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header(
		'Access-Control-Allow-Headers',
		'Origin, X-Requested-With, Content-Type, Accept, Authorization'
	);
	if (req.method === 'OPTIONS') {
		res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
		return res.status(200).json({});
	}
	next();
});

app.use(express.json());


// swagger docs
app.use(`/api/v1/docs`, swaggerUi.serve, swaggerUi.setup(swaggerDocument));

//middleware
app.use(authorize);

//api routes
app.use('/api/v1/auth', require('./router/auth'));


// send back a 404 error for any unknown api request
app.all('*', (req, res, next) => {
	next(new ErrorResponse(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use((err, req, res, next) => {
	errorHandler(err, req, res, next);
});


// handle error
app.use(errorHandler);

const port = process.env.PORT || 8008;

app.listen(port, () =>
	console.log(`server in running on PORT: ${port} - ENV: ${NODE_ENV}`)
);

module.exports = app;