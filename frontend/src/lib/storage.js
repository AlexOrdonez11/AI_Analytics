export const storage = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem(key)
      return raw ? JSON.parse(raw) : fallback
    } catch (e) { return fallback }
  },
  set(key, val) { localStorage.setItem(key, JSON.stringify(val)) },
  remove(key) { localStorage.removeItem(key) },
}
