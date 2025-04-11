
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../config/firebase";
import { v4 as uuidv4 } from "uuid";

/**
 * Uploads an image file to Firebase storage
 * @param file Image file to upload
 * @returns Promise with the download URL
 */
export const uploadImage = async (file: File): Promise<string> => {
  try {
    // Create a unique file name
    const fileName = `${uuidv4()}-${file.name}`;
    const storageRef = ref(storage, `house-images/${fileName}`);
    
    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw new Error("Failed to upload image");
  }
};

/**
 * Uploads multiple image files to Firebase storage
 * @param files Array of image files to upload
 * @returns Promise with array of download URLs
 */
export const uploadMultipleImages = async (files: File[]): Promise<string[]> => {
  try {
    const uploadPromises = files.map(file => uploadImage(file));
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error("Error uploading multiple images:", error);
    throw new Error("Failed to upload one or more images");
  }
};
