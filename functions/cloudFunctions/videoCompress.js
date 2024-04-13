const functions = require("firebase-functions");
const admin = require("firebase-admin");
const ffmpeg = require("fluent-ffmpeg");
const os = require("os");
const path = require("path");
const fs = require('fs').promises; 

admin.initializeApp();
const db = admin.firestore();

// Function to add a marker in Firestore indicating the file has been compressed
const addCompressedFile = async (fileName) => {
    try {
        await db.collection('compressedFiles').doc(fileName).set({});
    } catch (error) {
        console.error(`Error adding file to compressedFiles: ${error}`);
    }
}

// Function to check if a file is already compressed
const isFileCompressed = async (fileName) => {
    try {
        const doc = await db.collection('compressedFiles').doc(fileName).get();
        return doc.exists;
    } catch (error) {
        console.error(`Error checking if file is compressed: ${error}`);
    }
}

const bucket = admin.storage().bucket();

// Cloud Function triggered when a file is uploaded to Firebase Storage
const videoCompress = functions.storage.object().onFinalize(async (object) => {
    const fileBucket = object.bucket;
    const filePath = object.name;
    const fileName = path.basename(filePath);

    // Check if the file is in the 'videos' directory and is a supported video format
    if (!filePath.startsWith("videos/") ||
        !fileName.match(/\.(mp4|mov|avi|mkv|flv|wmv|webm|mpeg|3gp)$/i)) {
        console.log("Not a supported video file.");
        return null;
    }

    // Check if the file has already been compressed
    if (await isFileCompressed(fileName)) {
        console.log("File already compressed.");
        return null;
    }

    const tempLocalFile = path.join(os.tmpdir(), fileName);

    try {
        // Download the video file to a temporary location
        await bucket.file(filePath).download({ destination: tempLocalFile });
        console.log("Video downloaded locally to", tempLocalFile);
    } catch (error) {
        console.error(`Error downloading file: ${error}`);
        return null;
    }

    const outputFileName = `compressed_${Date.now()}_${fileName}`;
    const outputTempFilePath = path.join(os.tmpdir(), outputFileName);

    return new Promise((resolve, reject) => {
        ffmpeg(tempLocalFile)
            .outputOptions('-vf', 'scale=-2:480') // Scale the video to 480p, maintaining aspect ratio
            .outputOptions('-c:v', 'libx264') // Use the libx264 codec
            .outputOptions('-crf', '23') // Set the constant rate factor (lower is higher quality)
            .output(outputTempFilePath) // Set the output file path
            .on("end", async () => {
                console.log("Video compressed successfully");
                try {
                    // Upload the compressed video to Firebase Storage
                    await bucket.upload(outputTempFilePath, { destination: outputFileName });
                    console.log("Compressed video uploaded to", outputFileName);
                    // Mark the file as compressed in Firestore
                    await addCompressedFile(fileName);
                    // Delete the temporary files
                    await fs.unlink(tempLocalFile);
                    await fs.unlink(outputTempFilePath);
                    console.log("Temporary files deleted");
                    resolve();
                } catch (error) {
                    console.error(`Error uploading file or deleting temporary files: ${error}`);
                    reject();
                }
            })
            .on("error", (error) => {
                console.error("Error compressing video:", error);
                reject();
            })
            .run();
    });
});

module.exports = videoCompress;
