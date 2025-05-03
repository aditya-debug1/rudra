import mongoose from "mongoose";
import { DB_URI } from "./config/dotenv";
import Role from "./models/role";
import { defaultRootPermissions } from "./utils/rolePermissions";

const updateDeveloperPermissions = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(DB_URI);
    console.log("Connected to MongoDB");

    const devRole = await Role.findOneAndUpdate(
      { name: "Developer" },
      {
        permissions: defaultRootPermissions,
      },
      { new: true },
    );

    if (!devRole) {
      throw new Error("Developer role not found");
    }

    console.log("Developer role permissions updated successfully");

    await mongoose.connection.close();
    console.log("Database connection closed");

    process.exit(0);
  } catch (error) {
    console.error("Updating permissions failed:", error);
    process.exit(1);
  }
};

// Run the script
updateDeveloperPermissions();
