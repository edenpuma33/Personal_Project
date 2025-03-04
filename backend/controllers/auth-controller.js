const validator = require("validator");
const bcrypt = require("bcryptjs");
const prisma = require("../models");
const jwt = require("jsonwebtoken");

// Route for user register
module.exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  // validation
  if (!(name.trim() && email.trim() && password.trim())) {
    res.status(400).json({ success: false, message: "Please fill all data" });
  }

  // checking user already exists or not
  const exists = await prisma.user.findUnique({
    where: { email },
  });
  if (exists) {
    res.status(400).json({ success: false, message: "User already exists" });
  }

  //  validating email format & strong password
  if (!validator.isEmail(email)) {
    res
      .status(400)
      .json({ success: false, message: "Please enter a valid email" });
  }
  if (password.length < 8) {
    res
      .status(400)
      .json({ success: false, message: "Please enter a strong password" });
  }

  // create jwt token
  const payload = { email };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "15d" });

  //   hashing user password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // เตรียมข้อมูล new user + hash password
  const newUser = {
    email,
    password: hashedPassword,
    name,
  };

  // สร้าง new user ใน database
  const result = await prisma.user.create({ data: newUser });
  res.json({ success: true, msg: "Register successful", result, token });
};

module.exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email.trim() || !password.trim()) {
    res.status(400).json({ success: false, message: "Please fill all data" });
    return;
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    res.status(401).json({ success: false, message: "User doesn't exist" });
    return;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    res.status(401).json({ success: false, message: "Invalid Login" });
    return;
  }

  const payload = { id: user.id };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "15d" });

  const { password: pw, ...userData } = user;
  res.json({ msg: "Login Successful", token, userData });
};

// Route for admin login
module.exports.adminLogin = async (req, res) => {
  const { email, password } = req.body;
  const payload = { email };
  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: "Email and Password required" });
  }
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "15d" });
  if (
    email === process.env.ADMIN_EMAIL &&
    password === process.env.ADMIN_PASSWORD
  ) {
    res.json({ success: true, token });
  } else {
    res.status(401).json({ success: false, message: "Invalid credentials" });
  }
};
