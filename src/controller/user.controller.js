const User = require("../model/userModel");
const bcrypt = require("bcryptjs");
const { genOtp } = require("../utils/Otp");
const otpModel = require("../model/otpModel");
const {
  Send_Regiser_Email,
  Send_ForgotPassword_Email,
} = require("../common/emailTemplates/email");
const jwt = require("jsonwebtoken");

const userSignup = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, ...profileData } =
      req.body;
    console.log("rrrrrr", req.body);
    if (!firstName || !lastName || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already in use",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role,
    };

    if (role === "user") {
      userData.traineeProfile = {
        Dob: new Date(profileData.Dob),
        gender: profileData.gender,
        weight: profileData.weight,
        height: profileData.height,
        goalweight: profileData.goalweight,
      };
    } else if (role === "coach") {
      userData.trainerProfile = {
        Dob: new Date(profileData.Dob),
        gender: profileData.gender,
        country: profileData.country,
        city: profileData.city,
        certification: profileData.certification,
        specialization: profileData.specialization || [],
        bio: profileData.bio,
      };
    }

    const newUser = await User.create(userData);
    const userResponse = newUser.toObject();
    delete userResponse.password;

    res.status(201).json({
      status: true,
      user: userResponse,
      message: "Account has been successfully created",
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      status: false,
      message: error.message || "Internal server error",
    });
  }
};

const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const findUser = await User.findOne({ email });
    if (!findUser) {
      return res.status(401).json({
        status: false,
        message: "Invalid email/password",
      });
    }

    const verifyPass = await bcrypt.compare(password, findUser.password);
    if (!verifyPass) {
      return res.status(401).json({
        status: false,
        message: "Invalid email/password",
      });
    }

    if (!findUser.isVerified) {
      const code = genOtp();
      await otpModel.findOneAndUpdate(
        { userId: findUser._id, usedfor: "EMAIL-VERIFICATION" },
        {
          email: findUser.email,
          otpCode: code,
          expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        },
        { upsert: true, new: true }
      );

      await Send_Regiser_Email(findUser._id, code);

      return res.status(403).json({
        status: false,
        message:
          "Profile needs verification. An OTP has been sent to your email.",
        type: "OTP",
      });
    }

    const token = jwt.sign(
      { userID: findUser._id, email },
      process.env.TOKEN_KEY
    );

    const userResponse = findUser.toObject();
    userResponse.isToken = token;
    delete userResponse.password;

    return res.status(200).json({
      status: true,
      data: userResponse,
      message: `${userResponse.role} has been logged in successfully`,
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal server error",
    });
  }
};

const verifyCode = async (req, res) => {
  try {
    const { code, email, usedfor } = req.body;

    const final =
      usedfor === "EMAIL-VERIFICATION"
        ? "EMAIL-VERIFICATION"
        : "FORGOT-USER-PASSWORD";
    const otpData = await otpModel.findOne({
      usedfor: final,
      email: email,
    });

    if (!otpData) {
      return res.status(401).json({
        status: false,
        message: "Otp is expired or invalid",
      });
    }

    if (code !== otpData.otpCode) {
      return res.status(401).json({
        status: false,
        message: "Incorrect OTP code",
      });
    }

    const [updatedUser, _] = await Promise.all([
      User.findOneAndUpdate(
        { _id: otpData.userId, email: email },
        { isVerified: true },
        { new: true }
      ),
      otpModel.deleteOne({ _id: otpData._id }),
    ]);

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found",
        status: false,
      });
    }

    const token = jwt.sign(
      { userID: updatedUser._id, email },
      process.env.TOKEN_KEY
    );

    const userResponse = updatedUser.toObject();
    userResponse.isToken = token;
    delete userResponse.password;

    return res.status(200).json({
      message:
        final === "EMAIL-VERIFICATION"
          ? "Email has been verified successfully"
          : "Otp has been verified successfully",
      status: true,
      data: userResponse,
    });
  } catch (error) {
    console.error("Verification error:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
};

const resendOtp = async (req, res) => {
  try {
    const { email, usedfor } = req.body;

    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(404).json({
        message: "User does not exist",
        status: false,
      });
    }

    const code = genOtp();
    await otpModel.findOneAndUpdate(
      {
        userId: user._id,
        usedfor:
          usedfor === "EMAIL-VERIFICATION"
            ? "EMAIL-VERIFICATION"
            : "FORGOT-USER-PASSWORD",
      },
      {
        email: user.email,
        otpCode: code,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
      { upsert: true, new: true }
    );

    usedfor === "EMAIL-VERIFICATION"
      ? await Send_Regiser_Email(user._id, code)
      : await Send_ForgotPassword_Email(user._id, code);

    return res.status(200).json({
      status: true,
      message: "OTP has been resent successfully",
    });
  } catch (error) {
    console.error("Error in resendOtp:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        message: "User does not exist",
        status: false,
      });
    }

    const code = genOtp();
    await otpModel.findOneAndUpdate(
      { userId: user._id, usedfor: "FORGOT-USER-PASSWORD" },
      {
        email: user.email,
        otpCode: code,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
      { upsert: true, new: true }
    );

    await Send_ForgotPassword_Email(user._id, code);

    return res.status(200).json({
      status: true,
      message: "OTP has been sent successfully",
    });
  } catch (error) {
    console.error("Error in resendOtp:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    const user = await User.findOne({ _id: id });

    if (!user) {
      return res.status(404).json({
        message: "User does not exist",
        status: false,
      });
    }

    const isSamePassword = await bcrypt.compare(password, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        message: "New password cannot be the same as the old password",
        status: false,
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const updatePassword = await User.updateOne(
      { _id: id },
      { password: hashPassword }
    );

    if (!updatePassword) {
      return res.status(500).json({
        message: "Failed to update password",
        status: false,
      });
    }

    return res.status(200).json({
      message: "Password has been changed successfully",
      status: true,
    });
  } catch (error) {
    console.error("Error in resendOtp:", error);
    return res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  userSignup,
  userLogin,
  verifyCode,
  resendOtp,
  forgotPassword,
  resetPassword,
};
