const SuccessResponse = (data = null, records = 0, message = 'Completed') => ({
	isSuccess: true,
	message,
	records, // data count
	data, // data
});

module.exports = SuccessResponse;
