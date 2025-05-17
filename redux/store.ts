// redux/store.ts
import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./reducers/userReducer";
import headerReducer from "./reducers/headerReducer";
import footerReducer from "./reducers/footerReducer";
import blogReducer from "./reducers/blogReducer";
import projectReducer from "./reducers/projectReducer";
import glossaryReducer from './reducers/glossaryReducer';
import serviceReducer from './reducers/serviceReducer';

export const store = configureStore({
  reducer: {
    user: userReducer,
    header: headerReducer,
    footer: footerReducer,
    blog: blogReducer,
    project: projectReducer,
    glossary: glossaryReducer,
    service: serviceReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
