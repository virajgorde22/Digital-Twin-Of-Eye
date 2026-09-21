import api from "./api";

export async function analyzeScan(scanId, imageFile) {
  const formData = new FormData();
  formData.append("image", imageFile);
  const { data } = await api.post(
    `/api/predictions/analyze/${scanId}`,
    formData
  );
  return data;
}

export async function getPredictionByScan(scanId) {
  const { data } = await api.get(`/api/predictions/scan/${scanId}`);
  return data;
}
