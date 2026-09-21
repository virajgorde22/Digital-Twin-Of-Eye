export function getFriendlyError(error, fallback = "Something went wrong. Please try again.") {
  if (!error) return fallback;

  if (!error.response) {
    return "Unable to connect to the server.";
  }

  const status = error.response.status;
  const data = error.response.data;
  const message =
    typeof data === "string"
      ? data
      : data?.message || data?.error || "";

  if (status === 401) {
    return "Your session has expired. Please sign in again.";
  }
  if (status === 403) {
    return "You do not have permission to complete this action.";
  }
  if (status === 404) {
    return "The requested record could not be found.";
  }
  if (status === 400) {
    if (/image/i.test(message)) return "This image could not be used. Please upload a JPG or PNG retinal fundus image.";
    return message || "Please check the information you entered and try again.";
  }
  if (status >= 500) {
    if (/AI service|FastAPI|predict/i.test(message)) {
      return "AI analysis service is temporarily unavailable.";
    }
    if (/Health profile not found/i.test(message)) {
      return "NO_PROFILE";
    }
    if (/Digital Twin not found/i.test(message)) {
      return "NO_TWIN";
    }
    if (/Prediction not found/i.test(message)) {
      return "NO_PREDICTION";
    }
    return fallback;
  }

  return message || fallback;
}
