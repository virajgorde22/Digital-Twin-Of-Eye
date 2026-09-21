import api from "./api";

export async function getCurrentUser() {
  const { data } = await api.get("/api/users/me");
  return data;
}
