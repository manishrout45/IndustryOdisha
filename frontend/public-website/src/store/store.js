import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./authSlice";
import articleReducer from "./articleSlice";
import categoryReducer from "./categorySlice";
import homepageReducer from "./homepageSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    articles: articleReducer,
    categories: categoryReducer,
    homepage: homepageReducer,
  },
});