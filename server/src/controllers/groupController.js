import Group from "../models/Group.js";

// Create Group
export const createGroup = async (req, res) => {
  try {
    const { name, members = [] } = req.body;
    const uniqueMembers = [...new Set([req.user.username, ...members])];

    if (!name?.trim()) {
      return res.status(400).json({ error: "Group name is required" });
    }

    const group = await Group.create({
      name: name.trim(),
      members: uniqueMembers,
      createdBy: req.user.username,
    });

    res.status(201).json(group);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get Groups
export const getGroups = async (req, res) => {
  try {
    const groups = await Group.find({
      members: req.user.username,
    }).sort({ createdAt: -1 });

    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
