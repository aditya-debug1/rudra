import mongoose from "mongoose";
import { DB_URI, DEV_USERNAME } from "./config/dotenv";
import Role from "./models/role";
import User from "./models/user";
import bcrypt from "bcrypt";
import { defaultRootPermissions } from "./utils/rolePermissions";

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(DB_URI);
    console.log("Connected to MongoDB");

    // Create a temporary system user for created/updated by references
    const systemUserId = new mongoose.Types.ObjectId();

    // Create developer role
    const devRole = await Role.findOneAndUpdate(
      { name: "Developer" },
      {
        name: "Developer",
        precedence: 1, // Highest precedence
        permissions: defaultRootPermissions,
        createdBy: systemUserId,
        updatedBy: systemUserId,
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      },
    );

    if (!devRole) {
      throw new Error("Failed to create developer role");
    }

    const password = "dev123";
    const hashedPassword = await bcrypt.hash(password, 10);

    const devUser = await User.findOneAndUpdate(
      { username: DEV_USERNAME },
      {
        username: DEV_USERNAME,
        password: hashedPassword, // Change password form will appear after first login
        firstName: "Dev",
        lastName: "User",
        roles: ["Developer"],
        isLocked: false,
        permissions: {}, // Individual permissions can be added here if needed
        settings: {
          isPassChange: true,
          isRegistered: false, //This will allow register on login
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      },
    );

    if (!devUser) {
      throw new Error("Failed to create dev user");
    }

    // Update the role's created/updated by fields with the actual developer user
    await Role.findByIdAndUpdate(devRole._id, {
      createdBy: devUser._id,
      updatedBy: devUser._id,
    });

    console.log("Developer role & user created successfully");
    console.log(`Username: ${devUser.username} \nPassword: ${password}`);

    await mongoose.connection.close();
    console.log("Database connection closed");

    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    if (error instanceof Error) {
      console.error(error.message);
    }
    process.exit(1);
  }
};

// Run the seeder
seedDatabase();
