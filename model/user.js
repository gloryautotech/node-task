const mongoose = require("mongoose");
const bcrypt = require('bcrypt');
const passwordUtil = require('../utils/password');

const userSchema = mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
  },
  mobile: {
    type: String,
  },
  permission: {
    type: Object,
    required: true
  },
});


userSchema.pre('save', async function (next) {
	if (this.isModified('password') && this.password) {
		this.password = await passwordUtil.getHash(this.password);
	}

	next();
});

// compare password
userSchema.methods.comparePassword = function (password) {
	return bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
