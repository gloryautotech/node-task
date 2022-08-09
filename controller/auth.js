const mongoose = require("mongoose");

const UserModel = require("../model/user");

const passwordUtil = require("../utils/password");
const catchAsync = require("../utils/catchAsync");
const ErrorResponse = require("../utils/errorResponse");
const successResponse = require("../utils/successResponse");

exports.getMe = catchAsync(async (req, res, next) => {
  const { _id: id } = req.body;

  const user = await UserModel.findById(id);
  if (!user) return next(new ErrorResponse("User not found", 404));

  res.status(200).json(successResponse(user, 1, "Success"));
});

exports.signup = catchAsync(async (req, res, next) => {
  const isUserExist = await UserModel.findOne({ userName: req.body.userName });

  if (isUserExist) {
    return next(new ErrorResponse("User already registered", 400));
  }

  let userData = new UserModel({
    _id: new mongoose.Types.ObjectId(),
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    userName: req.body.userName,
    password: req.body.password,
    email: req.body.email,
    mobile: req.body.mobile,
    permission: req.body.permission,
  });

  let createdUser = await userData.save();
  //   createdUser = await createdUser
  //     .populate({
  //       path: "",
  //       select: {
  //         _id: 1,
  //         username: 1,
  //         name: 1,
  //       },
  //       populate: {},
  //     })
  //     .execPopulate();
  delete createdUser.password;

  const token = passwordUtil.genJwtToken(
    createdUser._id,
    createdUser.userName,
    createdUser.permission
  );

  res
    .status(201)
    .json(
      successResponse(
        { token, user: createdUser },
        1,
        "User signed up successfully"
      )
    );
});

exports.login = catchAsync(async (req, res, next) => {
  const { userName, password } = req.body;

  if (!userName || !password) {
    return next(new ErrorResponse("Username and Password are required", 400));
  }

  const user = await UserModel.findOne({ userName: userName }).select(
    "+password"
  );

  if (!user) {
    return next(new ErrorResponse("User not found", 401));
  }

  const resData = {};

  if (user && user.password && (await user.comparePassword(password))) {
    resData.token = passwordUtil.genJwtToken(user._id);
    resData.user = user;
  } else {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  return res.status(200).json(successResponse(resData, 1));
});

exports.updateMe = catchAsync(async (req, res, next) => {
  const user = await UserModel.findByIdAndUpdate(req.body._id, req.body, {
    new: true,
  });

  if (!user) return next(new ErrorResponse("User not found", 404));

  return res.status(200).json(successResponse(user, 1));
});
