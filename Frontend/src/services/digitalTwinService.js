import api from "./api";

export async function getDigitalTwin(userId) {
  const { data } = await api.get(`/api/digital-twin/${userId}`);
  return data;
}

export async function createDigitalTwin(userId) {
  const { data } = await api.post(`/api/digital-twin/${userId}`);
  return data;
}

export async function getOrCreateDigitalTwin(userId) {
  try {
    return await getDigitalTwin(userId);
  } catch {
    return createDigitalTwin(userId);
  }
}
