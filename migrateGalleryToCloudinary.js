const mongoose = require("mongoose");
const cloudinary = require("./config/cloudinary");
const Gallery = require("./models/Gallery");
const path = require("path");
const fs = require("fs");

mongoose.connect("mongodb+srv://hafeezthehacker_db_user:Hafeezthegamer07@dsa.wekec4k.mongodb.net/dsc_mobile_app");

async function migrate() {
  try {
    const mediaItems = await Gallery.find();

    for (const item of mediaItems) {
      if (!item.media.startsWith("http")) {
        const filePath = path.join(__dirname, item.media);

        if (fs.existsSync(filePath)) {
          console.log("Uploading:", filePath);

          const result = await cloudinary.uploader.upload(filePath, {
            folder: "DSC_GALLERY",
            resource_type:
              item.mediaType === "video" ? "video" : "image",
          });

          item.media = result.secure_url;
          await item.save();

          console.log("Updated:", result.secure_url);
        } else {
          console.log("File not found:", filePath);
        }
      }
    }

    console.log("✅ Migration completed");
    process.exit();
  } catch (error) {
    console.error("Migration error:", error);
    process.exit(1);
  }
}

migrate();