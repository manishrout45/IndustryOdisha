import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./slices/authSlice";
import articleReducer from "./slices/articleSlice";
import mediaReducer from "./slices/mediaSlice";
import commentReducer from "./slices/commentSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    articles: articleReducer,
    media: mediaReducer,
    comments: commentReducer,
  },
});

export default store;