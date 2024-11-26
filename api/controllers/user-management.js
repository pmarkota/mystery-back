import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export const createUser = async (req, res) => {
  const { username, password, email, credits } = req.body;
  const passwordHash = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from("users")
    .insert([
      {
        username,
        password_hash: passwordHash,
        email,
        credits,
      },
    ])
    .select();

  if (error) {
    return res.status(500).json({ error: "Error creating user." });
  }

  res.json({ message: "User created successfully!", data });
};

export const deleteUser = async (req, res) => {
  const { id } = req.body;

  const { data, error } = await supabase.from("users").delete().eq("id", id);

  if (error) {
    return res.status(500).json({ error: "Error deleting user." });
  }

  res.json({ message: "User deleted successfully!", data });
};
// In your controllers/user-management.js
export const getUser = async (req, res) => {
  const { id } = req.body; // Changed back to req.body since we're using POST

  // Add validation
  if (!id) {
    return res.status(400).json({ error: "User ID is required" });
  }

  const parsedId = parseInt(id, 10);
  if (isNaN(parsedId)) {
    return res.status(400).json({ error: "Invalid user ID format" });
  }

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", parsedId);

  if (error) {
    console.error("Supabase error:", error);
    return res.status(500).json({ error: "Error fetching user.", msg: error });
  }

  res.json({ message: "User fetched successfully!", data });
};

export const updateUserCredits = async (req, res) => {
  const { id, credits } = req.body;

  const { data, error } = await supabase
    .from("users")
    .update({ credits })
    .eq("id", id);

  if (error) {
    return res.status(500).json({ error: "Error updating user credits." });
  }

  res.json({ message: "User credits updated successfully!", data });
};

export const getAllUsers = async (req, res) => {
  const { data, error } = await supabase.from("users").select("*");

  if (error) {
    return res.status(500).json({ error: "Error fetching users." });
  }

  res.json({ message: "Users fetched successfully!", data });
};

export const searchUsersByUsername = async (req, res) => {
  const { username } = req.body;

  // Add validation for empty search term
  if (!username) {
    return res.status(400).json({ error: "Search term is required" });
  }

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .ilike("username", `%${username}%`); // Add % wildcards before and after

  if (error) {
    return res.status(500).json({ error: "Error searching users." });
  }

  res.json({ message: "Users fetched successfully!", data });
};
