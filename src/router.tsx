import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });

  return createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    // Warm loaders on link hover/focus so /latest (and others) feel instant.
    defaultPreload: "intent",
    // Let TanStack Query own freshness (staleTime), not the router preload cache.
    defaultPreloadStaleTime: 0,
  });
};
