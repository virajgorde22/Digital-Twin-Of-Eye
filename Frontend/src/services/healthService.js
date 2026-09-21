import api from "./api";

export async function getHealthProfile() {
  const { data } = await api.get("/api/health-profile");
  return data;
}

export async function saveHealthProfile(profile) {
  const { data } = await api.post("/api/health-profile", profile);
  return data;
}

export async function deleteHealthProfile() {
  const { data } = await api.delete("/api/health-profile");
  return data;
}
