import { createClient } from "@supabase/supabase-js";
import { sendConfirmationEmail } from "../utils/emailService.js";
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export const getBoxes = async (req, res) => {
  const { data, error } = await supabase.from("mystery_boxes").select("*");

  if (error) {
    return res.status(500).json({ error: "Error fetching boxes." });
  }

  res.json({ message: "Boxes fetched successfully!", data });
};

export const getBox = async (req, res) => {
  const { id } = req.body;

  const { data, error } = await supabase
    .from("mystery_boxes")
    .select("*")
    .eq("id", id);

  if (error) {
    return res.status(500).json({ error: "Error fetching box." });
  }

  res.json({ message: "Box fetched successfully!", data });
};

//submit selected boxes, should take an array of box ids and a user id and update the selected_by field for each box
export const submitSelectedBoxes = async (req, res) => {
  const { userId, boxIds } = req.body;

  // First update the boxes
  const { data: selectedBoxes, error } = await supabase
    .from("mystery_boxes")
    .update({ selected_by: userId })
    .in("id", boxIds)
    .select();

  if (error) {
    console.log(error);
    return res.status(500).json({ error: "Error submitting selected boxes." });
  }

  // Get the current user data
  const { data: user, error: fetchUserError } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (fetchUserError) {
    console.log(fetchUserError);
    return res.status(500).json({ error: "Error fetching user data." });
  }

  // Update the user's credits
  const newCredits = user.credits - boxIds.length;
  const { data: updatedUser, error: userError } = await supabase
    .from("users")
    .update({ credits: newCredits })
    .eq("id", userId);

  if (userError) {
    console.log(userError);
    return res
      .status(500)
      .json({ error: "Error deducting credits from user." });
  }

  // Send confirmation email with detailed information
  //await sendConfirmationEmail("petar.markota@gmail.com", {
  //username: user.username,
  //remainingCredits: newCredits,
  //selectedBoxes: selectedBoxes,
  // totalBoxesSelected: boxIds.length,
  // });

  res.json({
    message: "Selected boxes submitted successfully!",
    data: selectedBoxes,
  });
};

export const setAllBoxesToUnselected = async (req, res) => {
  const { data, error } = await supabase
    .from("mystery_boxes")
    .update({ selected_by: null })
    .neq("id", 0)
    .select();

  if (error) {
    return res
      .status(500)
      .json({ error: "Error setting boxes to unselected.", error });
  }

  res.json({ message: "Boxes set to unselected successfully!" });
};

export const setBoxColor = async (req, res) => {
  const { color } = req.body;

  // Validate color input
  const validColors = ["green", "black", "green-black"];
  if (!validColors.includes(color)) {
    return res.status(400).json({
      error: "Invalid color. Must be 'green', 'black', or 'green-black'",
    });
  }

  const { data, error } = await supabase
    .from("global_settings")
    .upsert(
      {
        setting_name: "box_color",
        setting_value: color,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "setting_name",
        ignoreDuplicates: false,
      }
    )
    .select();

  if (error) {
    console.log(error);
    return res.status(500).json({ error: "Error updating box color." });
  }

  res.json({
    message: "Box color updated successfully!",
    data,
  });
};

export const getBoxColor = async (req, res) => {
  const { data, error } = await supabase
    .from("global_settings")
    .select("setting_value")
    .eq("setting_name", "box_color")
    .single();

  if (error) {
    return res.status(500).json({ error: "Error fetching box color." });
  }

  res.json({
    message: "Box color fetched successfully!",
    color: data?.setting_value || "green", // default to green if not set
  });
};

export const getLoginPageText = async (req, res) => {
  const { data, error } = await supabase
    .from("global_settings")
    .select("setting_name, setting_value")
    .in("setting_name", [
      "login_welcome_text",
      "login_username_label",
      "login_password_label",
      "login_button_text",
    ]);

  if (error) {
    return res.status(500).json({ error: "Error fetching login page text." });
  }

  // Convert array to object for easier frontend consumption
  const textSettings = data.reduce((acc, item) => {
    acc[item.setting_name] = item.setting_value;
    return acc;
  }, {});

  res.json({
    message: "Login page text fetched successfully!",
    data: textSettings,
  });
};

export const updateLoginPageText = async (req, res) => {
  const { settings } = req.body;

  // Validate input
  const validSettings = [
    "login_welcome_text",
    "login_username_label",
    "login_password_label",
    "login_button_text",
  ];

  const updates = Object.entries(settings).filter(([key]) =>
    validSettings.includes(key)
  );

  if (updates.length === 0) {
    return res.status(400).json({
      error: "No valid settings provided.",
    });
  }

  // Update each setting
  const promises = updates.map(([setting_name, setting_value]) =>
    supabase.from("global_settings").upsert(
      {
        setting_name,
        setting_value,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "setting_name",
      }
    )
  );

  try {
    await Promise.all(promises);

    // Fetch updated settings
    const { data, error } = await supabase
      .from("global_settings")
      .select("setting_name, setting_value")
      .in("setting_name", validSettings);

    if (error) throw error;

    const textSettings = data.reduce((acc, item) => {
      acc[item.setting_name] = item.setting_value;
      return acc;
    }, {});

    res.json({
      message: "Login page text updated successfully!",
      data: textSettings,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Error updating login page text.",
    });
  }
};
