import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./auth/slice";

export default configureStore({
    reducer: {
        auth: authReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
})