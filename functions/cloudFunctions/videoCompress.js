const functions = require("firebase-functions");
const admin = require("firebase-admin");
const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg");
const ffmpeg = require("fluent-ffmpeg");
const path = require("path");
const fs = require("fs");

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const videoCompress = functions.storage.object().onFinalize(async (object) => {
  try {
    const filePath = object.name;

    // Check if the file has already been compressed
    if (filePath.includes("_compressed")) {
      console.log("File has already been compressed.");
      return;
    }

    console.log(`Processing file: ${filePath}`);

    const bucket = admin.storage().bucket(object.bucket);
    const tempFilePath = `/tmp/${path.basename(filePath)}`;
    const tempOutputPath = `/tmp/compressed_${path.basename(filePath)}`;

    // Check if the video is in the correct folder


    if (!filePath.startsWith("pb-communities/") &&
    !filePath.startsWith("pb-fashion/") &&
    !filePath.startsWith("pb-gaming/") &&
    !filePath.startsWith("pb-mall/") &&
    !filePath.startsWith("pb-music/") && !filePath.startsWith("pb-radio/") &&
    !filePath.startsWith("pb-tv/") && !filePath.startsWith("pb-zine/")) {
      console.log("Failed. The video is not in the correct folder.");
      return;
    }

    // Download the video file to the temporary directory
    console.log("Downloading video file...");
    await bucket.file(filePath).download({destination: tempFilePath});
    console.log("Video file downloaded.");

    // Compress the video file
    console.log("Compressing video file...");

    await new Promise((resolve, reject) => {
      ffmpeg(tempFilePath)
          .outputOptions("-vf", "scale=480:-1") // Change the scale as needed
          .output(tempOutputPath)
          .on("end", resolve)
          .on("error", reject)
          .run();
    });
    console.log("Video file compressed.");


    // Define the destination path for the compressed video
    const destinationPath =
     `${path.dirname(filePath)}/${path.basename(filePath,
         path.extname(filePath))}_compressed${path.extname(filePath)}`;

    // Upload the compressed video file back to Firebase Storage
    console.log("Uploading compressed video file...");
    await bucket.upload(tempOutputPath, {destination: destinationPath});
    console.log("Compressed video file uploaded.");

    console.log("Deleting original file...");
    await bucket.file(filePath).delete();
    console.log("Original file deleted.");

    // Clean up the temporary directory
    console.log("Cleaning up temporary files...");
    fs.unlinkSync(tempFilePath);
    fs.unlinkSync(tempOutputPath);
    console.log("Temporary files cleaned up.");
  } catch (error) {
    console.error(`Error processing file: ${error}`);
  }
});

module.exports = videoCompress;
