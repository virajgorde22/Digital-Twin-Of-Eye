import api, { setToken } from "./api";

export async function login(email, password) {
  const { data } = await api.post("/api/auth/login", { email, password });
  if (data?.token) setToken(data.token);
  return data;
}

export async function register({ name, email, password }) {
  const { data } = await api.post("/api/auth/register", {
    name,
    email,
    password,
  });
  if (data?.token) setToken(data.token);
  return data;
}
