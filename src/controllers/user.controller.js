import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

const generateAccessTokenAndRefreshToken = async (userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access token")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    // Get user details from frontend
    // validation - not empty
    // check if user is already exist : email, username
    // Check for images , check for avtar
    // upload them on cloundinary, avtar 
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for the user creation
    // return response
    
    
    const {fullName, username, email, password} = req.body
    // console.log("email : ", email);

    // if (fullname === "") {
    //     throw new ApiError(400, "fullname is required");
    // }

    if (
        [fullName, username, email, password].some( (field) => field?.trim() === "" )
    ) {
        throw new ApiError(400, "All fields are required");
    }


    const existedUser = await User.findOne({
        $or : [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with username or email already exist");
    }

    const avtarLocalPath = req.files?.avtar[0]?.path;
    // console.log("avtarLocalPath : ", avtarLocalPath);
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0];
    }

    if (!avtarLocalPath) {
        throw new ApiError(400, "Avtar file is required");
    }

    const avtar = await uploadOnCloudinary(avtarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!avtar) {
        throw new ApiError(400, "Avtar file is required");
    }

    const user = await User.create({
        fullName,
        avtar: avtar.url,
        coverImage: coverImage?.url || "",
        username: username.toLowerCase(),
        email,
        password
    })

    const createdUser = await User.findById(user._id).select(
        // Which we don't  include
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    // return response

    return res.status(201).json(
        new ApiResponse(
            200,
            createdUser,
            "User registered successfully"
        )
    )

});

const loginUser = asyncHandler(async (req, res) => {
    // req body -> data
    // username or email
    // find the user
    // check for password
    // access and refresh token
    // send cookie

    const { username, email, password } = req.body

    if (!username && !email) {
        throw new ApiError(400, "Username or email is required");
    }

    // Alternative code of above code

    // if (!(username || email)) {
    //     throw new ApiError(400, "Username or email is required");
    // }

    const user = await User.findOne({
        $or:[{username}, {email}]
    })

    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid credentials");
    }

    const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user._id)

    const logedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: logedInUser, accessToken, refreshToken
                },
                "User loged In successfully"
            )
    )
})

const logOutUser = asyncHandler(async (req, res) => {
    User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true,
        }
    )

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unathorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedToken?._id)
    
        if (!user) {
            throw new ApiError(401, "Invalid refresh Token")
        }
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token has expired or used")
        }
    
        const options = {
            httpOnly: true,
            secure: true,
        }
    
        const { accessToken, newRefreshToken } = await generateAccessTokenAndRefreshToken(user._id)
    
        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    {
                        accessToken,
                        refreshToken: newRefreshToken
                    },
                    "Access Token refreshed"
                )
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword , confPassword} = req.body

    if (oldPassword !== newPassword) {
        throw new ApiError(400, "New password and confirm password should be same")
    }
    
    const user = await findById(req.user?._id)

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Incorrect Old Password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Password changed successfully"
        )
    )
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(200, req.user, "Current user fetch successfully")
})

const updateAccountDetails = asyncHandler(async (req, res) => {
    const {fullName, email} = req.body

    if (!fullName || !email) {
        throw new ApiError(400, "All fields are required")
    }

    const user = User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName: fullName,
                email: email,
            }
        },
        // return information after update
        {new: true}
    ).select("-password")

    return res.status(200).json(
        new ApiResponse(
            200,
            user,
            "Account details updated successfully"
        )
    )
})


const upadateUserAvtar = asyncHandler(async (req, res) => {
    const avtarLocalPath = req.file?.path;

    if (!avtarLocalPath) {
        throw new ApiError(400, "Avtar file is missing")
    }

    const avtar = await uploadOnCloudinary(avtarLocalPath);

    if (!avtar.url) {
        throw new ApiError(400, "Error while uploading avtar")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,

        {
            $set: {
                avtar: avtar.url
            }
        },

        {new: true}
    ).select("-password")

    return res.status(200).json(
        new ApiResponse(
            200,
            user,
            "Avtar updated successfully"
        )
    )
})

const upadateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path;

    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover Image file is missing")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if (!coverImage.url) {
        throw new ApiError(400, "Error while uploading cover image")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,

        {
            $set: {
                coverImage: coverImage.url
            }
        },

        {new: true}
    ).select("-password")

    return res.status(200).json(
        new ApiResponse(
            200,
            user,
            "Cover Image updated successfully"
        )
    )
})






export {
    registerUser,
    loginUser,
    logOutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    upadateUserAvtar,
    upadateUserCoverImage,
};
