// redux/store.ts
import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./reducers/userReducer";
import headerReducer from "./reducers/headerReducer";
import footerReducer from "./reducers/footerReducer";

const store = configureStore({
  reducer: {
    user: userReducer,
    header: headerReducer,
    footer: footerReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
