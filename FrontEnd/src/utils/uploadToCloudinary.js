import axios from "axios";

export const uploadToCloudinary = async (file) => {
  try {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    const { data } = await axios.post(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      formData
    );

    return data.secure_url;
  } catch (error) {
    // Axios error handling
    throw new Error(
      error.response?.data?.error?.message || error.message || "Upload failed"
    );
  }
};
