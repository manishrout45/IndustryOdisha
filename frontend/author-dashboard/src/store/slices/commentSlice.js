import { createSlice } from "@reduxjs/toolkit";

const commentSlice = createSlice({
  name: "comments",

  initialState: {
    comments: [],
    loading: false,
  },

  reducers: {
    setComments: (state, action) => {
      state.comments = action.payload;
    },

    approveComment: (state, action) => {
      const comment = state.comments.find(
        (item) => item._id === action.payload
      );

      if (comment) {
        comment.status = "approved";
      }
    },
  },
});

export const {
  setComments,
  approveComment,
} = commentSlice.actions;

export default commentSlice.reducer;