import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "@/utils/persistStorage";
import authReducer from "./auth/authSlice";
import projectReducer from "./project/projectSlice";
import taskReducer from "./task/taskSlice";
import socketReducer from "./socket/socketSlice";

/*
 * Redux Toolkit was selected over Context API because this application spans
 * multiple screens with shared auth, projects, tasks, and real-time socket
 * state. RTK provides predictable global updates, built-in async thunks,
 * and easier debugging via Redux DevTools — especially when WebSocket events
 * must update several views at once.
 */

const authPersistConfig = {
  key: "auth",
  storage,
  whitelist: ["user", "accessToken", "refreshToken", "isAuthenticated"],
};

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  project: projectReducer,
  task: taskReducer,
  socket: socketReducer,
});

export const makeStore = () =>
  configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }),
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

export const makePersistor = (store: AppStore) => persistStore(store);
