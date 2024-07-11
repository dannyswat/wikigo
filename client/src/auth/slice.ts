import { createAction, createReducer, Reducer } from "@reduxjs/toolkit";

type AuthState = {
    userToken: string;
    accessToken: string;
    publicKey: string;
    timestamp: string;
    user?: {
        id: string;
        name: string;
        role: string;
    };
    isLoggedIn: boolean;
}

const initialState: AuthState = {
    userToken: '',
    accessToken: '',
    publicKey: '',
    timestamp: '',
    user: undefined,
    isLoggedIn: false,
}

interface UserTokens {
    userToken: string;
    accessToken: string;
}

interface LoginRequest {
    username: string;
    password: string;
    key: string;
}

export const login = createAction<LoginRequest>('auth/login');
export const getPublicKey = createAction('auth/getPublicKey');
export const logout = createAction('auth/logout');

const authReducer: Reducer<AuthState> = createReducer(initialState, (builder) => {
    builder.addCase(logout, (state) => {
        state.userToken = '';
        state.accessToken = '';
        state.user = undefined;
        state.isLoggedIn = false;
    });
});

export default authReducer;