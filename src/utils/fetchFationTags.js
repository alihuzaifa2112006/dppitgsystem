import axios from "axios";

const FASHION_TAGGING_API_URL =
  "https://api.ximilar.com/tagging/fashion/v2/detect_tags";

const ximilarApiKey = "c70761efca0449bd2575f3e558af4298cf4338b6"; // Replace with your actual API key

export const fetchFashionTags = async (imageBase64) => {
  try {
    const response = await axios.post(
      FASHION_TAGGING_API_URL,
      {
        records: [
          {
            _base64: imageBase64, // Base64 string of your image
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${ximilarApiKey}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching fashion tags:", error);
    throw error;
  }
};
