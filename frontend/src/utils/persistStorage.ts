import createWebStorage from "redux-persist/lib/storage/createWebStorage";

function createNoopStorage() {
  return {
    getItem(_key: string) {
      return Promise.resolve(null);
    },
    setItem(_key: string, value: string) {
      return Promise.resolve(value);
    },
    removeItem(_key: string) {
      return Promise.resolve();
    },
  };
}

const persistStorage =
  typeof window !== "undefined" ? createWebStorage("local") : createNoopStorage();

export default persistStorage;
