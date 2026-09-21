import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { clearToken, getToken } from "../services/api";
import { login as loginRequest, register as registerRequest } from "../services/authService";
import { getCurrentUser } from "../services/userService";
import { getHealthProfile } from "../services/healthService";
import { getOrCreateDigitalTwin } from "../services/digitalTwinService";
import { getFriendlyError } from "../utils/errors";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [healthProfile, setHealthProfile] = useState(null);
  const [digitalTwin, setDigitalTwin] = useState(null);
  const [loading, setLoading] = useState(true);

  async function bootstrap() {
    setLoading(true);
    if (!getToken()) {
      setLoading(false);
      return;
    }
    try {
      const me = await getCurrentUser();
      setUser(me);
      const twin = await getOrCreateDigitalTwin(me.id);
      setDigitalTwin(twin);
      try {
        const profile = await getHealthProfile();
        setHealthProfile(profile);
      } catch (error) {
        if (getFriendlyError(error) !== "NO_PROFILE") {
          setHealthProfile(null);
        } else {
          setHealthProfile(null);
        }
      }
    } catch {
      clearToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    bootstrap();
  }, []);

  async function refreshAll() {
    if (!getToken()) return;
    const me = await getCurrentUser();
    setUser(me);
    const twin = await getOrCreateDigitalTwin(me.id);
    setDigitalTwin(twin);
    try {
      setHealthProfile(await getHealthProfile());
    } catch {
      setHealthProfile(null);
    }
    return { me, twin };
  }

  const value = useMemo(
    () => ({
      user,
      healthProfile,
      digitalTwin,
      loading,
      setHealthProfile,
      setDigitalTwin,
      async login(email, password) {
        await loginRequest(email, password);
        await bootstrap();
      },
      async register(payload) {
        await registerRequest(payload);
        await bootstrap();
      },
      logout() {
        clearToken();
        setUser(null);
        setHealthProfile(null);
        setDigitalTwin(null);
      },
      refreshAll,
    }),
    [user, healthProfile, digitalTwin, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
