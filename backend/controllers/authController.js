import crypto from "crypto";
import cloudinary from "../lib/cloudinary.js";
import bcrypt from "bcryptjs";
import { generateTokens, setCookies } from "../helpers/authentication.js";
import { sendPasswordResetEmail } from "../lib/mailer.js";
import User from "../models/userModel.js";
import Teachers from "../models/teachersModel.js";

export const SignUp = async (req, res) => {
  try {
    const { username, password, email, profilePicture, role } = req.body;

    if (!username || !password || !email || !role) {
      return res.status(400).json({ message: "Fadlan buuxi dhammaan meelaha looga baahan yahay" });
    }

    const normalizedEmail = email?.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail }).select("-password");

    if (existingUser) {
      return res.status(400).json({ message: "Isticmaale horey ayuu u diiwaangashanaa" });
    }

    let teacher = null;

    if (role === "teacher") {
      teacher = await Teachers.findOne({ email: normalizedEmail }).populate('assignedClasses', 'name level');
      if (!teacher) {
        return res.status(400).json({ message: "Fadlan lama helin macalin, fadlan la xidhiidh maamulka" });
      }
    }
    
    let cloudinaryResponse = null;

    if (profilePicture) {
      const uploadResponse = await cloudinary.uploader.upload(profilePicture);
      cloudinaryResponse = uploadResponse.secure_url;
    }

    const newUser = new User({
      username,
      password,
      email: normalizedEmail,
      role,
      profilePicture: cloudinaryResponse || "lama keenin sawir",
    });

    const { accessToken } = generateTokens(newUser._id);
    setCookies(res, accessToken);
    newUser.accessToken = accessToken;

    await newUser.save();

    const signedUpUser = {
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      profilePicture: newUser.profilePicture,
    };

    if (teacher) {
      signedUpUser.assignedClasses = teacher.assignedClasses || [];
    }

    res.status(201).json({ 
      message: "Isticmaalaha si guul leh ayaa loo abuuray", 
      user: signedUpUser
    });
  } catch (error) {
    console.error("Error in SignUp function: ", error);
    res.status(500).json({ 
      message: "Khalad server ah",
      error: process.env.NODE_ENV === 'production' ? undefined : error.message 
    });
  }
};

export const SignIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Fadlan geli iimaylka iyo furaha sirta ah" });
    }

    const normalizedEmail = email?.trim().toLowerCase();
    
    // SIMPLE QUERY - no connection logic needed
    let user = await User.findOne({ 
      email: normalizedEmail 
    }).collation({ locale: 'en', strength: 2 });

    if (!user) {
      user = await User.findOne({ 
        email: { $regex: `^${normalizedEmail}$`, $options: 'i' } 
      });
    }

    if (!user) {
      return res.status(400).json({ message: "Xogta lama helin - Iimaylka ama furaha sirta ah waa qalad" });
    }

    let comparePassword = await bcrypt.compare(password, user.password);

    if (!comparePassword && user.password === password) {
      comparePassword = true;
    }

    if (!comparePassword) {
      return res.status(400).json({ message: "Xogta lama helin - Iimaylka ama furaha sirta ah waa qalad" });
    }

    const { accessToken } = generateTokens(user._id);
    setCookies(res, accessToken);

    const userData = {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture,
    };

    if (user.role === "teacher") {
      const teacher = await Teachers.findOne({ email: normalizedEmail }).populate('assignedClasses', 'name level');
      if (teacher) {
        userData.assignedClasses = teacher.assignedClasses || [];
      }
    }

    res.status(200).json({ 
      message: "Si guul leh ayaad u gashay", 
      user: userData 
    });
  } catch (error) {
    console.error("Error in SignIn function: ", error);
    
    // Handle specific database errors
    if (error.name === 'MongoNetworkError' || error.name === 'MongooseError') {
      return res.status(503).json({
        message: "Xiriirka database-ka waa khalad",
        code: "DATABASE_ERROR"
      });
    }
    
    res.status(500).json({
      message: "Khalad server ah",
      code: "SIGNIN_FAILED",
      error: process.env.NODE_ENV === 'production' ? undefined : error.message
    });
  }
};

export const WhoAmI = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Oggolaansho la'aan - Isticmaale lama helin" });
    }

    const userData = {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture,
    };

    if (user.role === "teacher") {
      const teacher = await Teachers.findOne({ email: user.email }).populate('assignedClasses', 'name level');
      if (teacher) {
        userData.assignedClasses = teacher.assignedClasses || [];
      }
    }

    res.status(200).json({ 
      message: "Isticmaale si guul leh ayaa loo helay", 
      user: userData 
    });
  } catch (error) {
    console.error("Error in WhoAmI function: ", error);
    res.status(500).json({ 
      message: "Khalad server ah",
      error: process.env.NODE_ENV === 'production' ? undefined : error.message 
    });
  }
};

export const getAllUser = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({ 
      message: "Users retrieved successfully", 
      users 
    });
  } catch (error) {
    console.error("Error in getAllUser function: ", error);
    res.status(500).json({ 
      message: "Khalad server ah",
      error: process.env.NODE_ENV === 'production' ? undefined : error.message 
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { username, email, profilePicture, role } = req.body;

    if (!username || !email) {
      return res.status(400).json({ message: "Fadlan buuxi dhammaan meelaha looga baahan yahay" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "Isticmaale lama helin" });
    }

    let cloudinaryResponse = null;

    if (profilePicture) {
      const uploadResponse = await cloudinary.uploader.upload(profilePicture);
      cloudinaryResponse = uploadResponse.secure_url;
    }

    user.username = username;
    user.email = email;
    user.role = role;
    user.profilePicture = cloudinaryResponse || user.profilePicture;

    await user.save();

    res.status(200).json({ 
      message: "Isticmaalaha si guul leh ayaa loo cusbooneysiiyay", 
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    console.error("Error in updateUser function: ", error);
    res.status(500).json({ 
      message: "Khalad server ah",
      error: process.env.NODE_ENV === 'production' ? undefined : error.message 
    });
  }
};

export const deleteUser = async (req, res) => {
  const { userId } = req.params;

  try {
    await User.findByIdAndDelete(userId);
    res.status(200).json({ 
      message: "Isticmaalaha si guul leh ayaa loo tirtiray" 
    });
  } catch (error) {
    console.error("Error in deleteUser function: ", error);
    res.status(500).json({ 
      message: "Khalad server ah",
      error: process.env.NODE_ENV === 'production' ? undefined : error.message 
    });
  }
};

export const LogOut = async (req, res) => {
  try {
    const isProduction = process.env.NODE_ENV === 'production';
    
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'None' : 'Lax'
    });

    res.status(200).json({ 
      message: "Waad ka baxday si guul leh" 
    });
  } catch (error) {
    console.error("Error in LogOut function: ", error);
    res.status(500).json({ 
      message: "Khalad server ah",
      error: process.env.NODE_ENV === 'production' ? undefined : error.message 
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Fadlan geli emailkaaga" });
    }

    const normalizedEmail = email?.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(200).json({
        success: true,
        message: "fariinta waxa lagugu diray emailkaaga."
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000;
    await user.save();

    const requestOrigin = req.headers.origin || req.headers.referer || '';
    const rawFrontendOrigin = requestOrigin
      ? requestOrigin.replace(/\/$/, '')
      : (process.env.FRONTEND_URL || process.env.CORS_ORIGIN || 'http://localhost:5173');

    const frontendBaseUrl = rawFrontendOrigin.includes('://')
      ? rawFrontendOrigin.replace(/\/$/, '')
      : `https://${rawFrontendOrigin.replace(/\/$/, '')}`;

    const resetLink = `${frontendBaseUrl}/reset-password?token=${resetToken}`;
    const mailResult = await sendPasswordResetEmail(user.email, resetLink);

    if (!mailResult.sent) {
      return res.status(200).json({
        success: true,
        message: "dib u hagaajinta passwordka waxay la socotaa emailkaaga.",
        resetLink,
        emailDelivery: "not-configured"
      });
    }

    res.status(200).json({
      success: true,
      message: "Tilmaamaha dib u hagaajinta passwordka ayaa loo diray emailkaaga.",
      resetLink,
      emailDelivery: "sent"
    });
  } catch (error) {
    console.error("Error in forgotPassword function:", error);
    res.status(500).json({
      message: "Khalad server ah",
      error: process.env.NODE_ENV === 'production' ? undefined : error.message
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token iyo password cusub ayaa loo baahan yahay" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password cusub wuxuu noqon karaa ugu yaraan 6 xaraf" });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Token-ku waa dhacay ama waa ansax la'aan" });
    }

    user.password = newPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password-kaagu si guul leh ayaa loo cusbooneysiiyay"
    });
  } catch (error) {
    console.error("Error in resetPassword function:", error);
    res.status(500).json({
      message: "Khalad server ah",
      error: process.env.NODE_ENV === 'production' ? undefined : error.message
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Fadlan geli passwordki hore iyo kan cusub" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "Isticmaalaha lama helin" });
    }

    let isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch && user.password === oldPassword) {
      isMatch = true;
    }

    if (!isMatch) {
      return res.status(400).json({ message: "Passwordkii hore waa khalad" });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ 
      message: "Erayga sirta ah si guul leh ayaa loo beddelay" 
    });

  } catch (error) {
    console.error("Error in ChangePassword function:", error);
    res.status(500).json({ 
      message: "Khalad server ah",
      error: process.env.NODE_ENV === 'production' ? undefined : error.message 
    });
  }
};