import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export const loginUser = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required." });
  }

  try {
    // Fetch the user by username (case-insensitive)
    const { data: users, error } = await supabase
      .from("users")
      .select("*")
      .ilike("username", username);

    if (error) {
      return res.status(500).json({ error: "Error fetching user." });
    }

    if (!users.length) {
      return res.status(401).json({ error: "Invalid username or password." });
    }

    const user = users[0];

    // Compare the provided password with the hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid username or password." });
    }
    //generate a token and return it as well
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        email: user.email,
        credits: user.credits,
      },
      process.env.JWT_SECRET
    );

    res.json({ message: "Login successful!", user, token });
  } catch (err) {
    res.status(500).json({ error: "Something went wrong.", msg: err.message });
  }
};

export const loginAdmin = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required." });
  }

  try {
    // Fetch the admin by username (case-insensitive)
    const { data: admins, error } = await supabase
      .from("admins")
      .select("*")
      .ilike("username", username);

    if (error) {
      return res.status(500).json({ error: "Error fetching admin." });
    }

    if (!admins.length) {
      return res.status(401).json({ error: "Invalid username or password." });
    }

    const admin = admins[0];
    console.log(admin);
    // Compare the provided password with the hashed password
    const isPasswordValid = await bcrypt.compare(password, admin.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid username or password." });
    }
    //generate a token and return it as well
    const token = jwt.sign({ adminId: admin.id }, process.env.JWT_SECRET);
    res.json({
      message: "Admin login successful!",
      admin: { adminId: admin.id, adminUsername: admin.username },
      token,
    });
  } catch (err) {
    res.status(500).json({ error: "Something went wrong." });
  }
};

export const createAdmin = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required." });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const { data, error } = await supabase.from("admins").insert({
    username,
    password_hash: hashedPassword,
  });

  if (error) {
    return res.status(500).json({ error: "Error creating admin.", msg: error });
  }

  res.json({ message: "Admin created successfully!", data });
};
