import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESS_KEY      = 'msaidizi_access';
const REFRESH_KEY     = 'msaidizi_refresh';
const USER_KEY        = 'msaidizi_user';
const LAST_ACTIVE_KEY = 'msaidizi_last_active';

export const Storage = {
  getAccess:    () => AsyncStorage.getItem(ACCESS_KEY),
  getRefresh:   () => AsyncStorage.getItem(REFRESH_KEY),
  getUser:      async () => {
    const raw = await AsyncStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  getLastActive: () => AsyncStorage.getItem(LAST_ACTIVE_KEY),
  setLastActive: () => AsyncStorage.setItem(LAST_ACTIVE_KEY, String(Date.now())),
  setTokens: (access: string, refresh: string) =>
    Promise.all([
      AsyncStorage.setItem(ACCESS_KEY, access),
      AsyncStorage.setItem(REFRESH_KEY, refresh),
    ]),
  setUser: (user: object) =>
    AsyncStorage.setItem(USER_KEY, JSON.stringify(user)),
  clear: () =>
    AsyncStorage.multiRemove([ACCESS_KEY, REFRESH_KEY, USER_KEY, LAST_ACTIVE_KEY]),
};
