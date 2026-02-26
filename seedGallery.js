require("dotenv").config();
const mongoose = require("mongoose");
const Gallery = require("./models/Gallery");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function seedGallery() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");

    const result = await cloudinary.search
      .expression("folder:DSC_GALLERY")
      .max_results(100)
      .execute();

    console.log(`Found ${result.resources.length} files in Cloudinary`);

    for (let file of result.resources) {
      await Gallery.create({
        mediaType: file.resource_type === "video" ? "video" : "image",
        media: file.secure_url,
      });
    }

    console.log("✅ Gallery Seeded Successfully");
    process.exit();
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

seedGallery();