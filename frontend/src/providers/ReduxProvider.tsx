"use client";

import { useMemo } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { makeStore, makePersistor } from "@/redux/store";

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  const { store, persistor } = useMemo(() => {
    const store = makeStore();
    const persistor = makePersistor(store);
    return { store, persistor };
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}
