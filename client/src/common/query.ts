import { QueryCache, QueryClient } from "@tanstack/react-query";

export const queryCache = new QueryCache();

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5,
            refetchOnWindowFocus: false,
        },
    },
    queryCache
})