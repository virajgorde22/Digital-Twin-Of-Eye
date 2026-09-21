import api from "./api";

export async function createScan(imageFile, eyeSide) {
  const formData = new FormData();
  formData.append("image", imageFile);
  formData.append("eyeSide", eyeSide);
  const { data } = await api.post("/api/scans", formData);
  return data;
}

export async function getScans() {
  const { data } = await api.get("/api/scans");
  return data;
}

export async function getScansByEye(eyeSide) {
  const { data } = await api.get(`/api/scans/eye/${eyeSide}`);
  return data;
}

export async function getScan(scanId) {
  const { data } = await api.get(`/api/scans/${scanId}`);
  return data;
}
