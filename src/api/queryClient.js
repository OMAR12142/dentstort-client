import { QueryClient } from '@tanstack/react-query';

const PUBLIC_QUERY_ROOTS = new Set(['publicPortfolio', 'publicCase']);

export const isUserScopedQuery = (query) => {
  const rootKey = query.queryKey?.[0];
  return !PUBLIC_QUERY_ROOTS.has(rootKey);
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * Cancel in-flight authenticated/user-scoped queries and evict their cached
 * entries without discarding public portfolio caches.
 */
export function clearUserQueryCache(client = queryClient) {
  client.cancelQueries({ predicate: isUserScopedQuery });
  client.removeQueries({ predicate: isUserScopedQuery });
}

