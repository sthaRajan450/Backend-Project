import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
const registerUser = asyncHandler(async (req, res) => {
  //get user detail from frontend
  const { username, email, fullName, password } = req.body;

  //validation -notEmpty
  if (
    [fullName, email, username, password].some((field) => {
      field?.trim === "";
    })
  ) {
    throw new ApiError(404, "All fields are required");
  }

  //check if user already exist : username or email
  const existedUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existedUser) {
    throw new ApiError(409, "User already exist");
  }

  //check for images , check for avatar
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  //upload them to cloudinary,avatar
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  //create use object - create entry in db

  await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowercase(),
  });

  //remove password and refresh token field from response
  const createdUser = await User.findById(User._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  //return res
  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

const login = asyncHandler(async (req, res) => {
  res.status(200).json({
    message: "login successfully",
  });
});

export { registerUser, login };
