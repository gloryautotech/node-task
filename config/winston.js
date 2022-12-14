const appRoot = require('app-root-path');
const winston = require('winston');

// define the custom settings for each transport (file, console)
const options = {
	file: {
		level: 'info',
		filename: `${appRoot}/logs/app.log`,
		handleExceptions: true,
		json: true,
		maxsize: 5242880, // 5MB
		maxFiles: 15,
		colorize: false,
	},
	errorFile: {
		level: 'error',
		filename: `${appRoot}/logs/error.log`,
		handleExceptions: true,
		json: true,
		maxsize: 5242880, // 5MB
		maxFiles: 15,
		colorize: false,
	},
	console: {
		level: 'debug',
		handleExceptions: true,
		json: false,
		colorize: true,
	},
};

// instantiate a new Winston Logger with the settings defined above
const logger = winston.createLogger({
	transports: [
		new winston.transports.Console(options.console),
		new winston.transports.File(options.errorFile),
		new winston.transports.File(options.file),
	],
	exitOnError: false, // do not exit on handled exceptions
});

// create a stream object with a 'write' function that will be used by `morgan`
logger.stream = {
	write(message, encoding) {
		// use the 'info' log level so the output will be picked up by both transports (file and console)
		logger.info(message);
	},
};

module.exports = logger;
