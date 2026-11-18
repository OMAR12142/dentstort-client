import assert from 'node:assert/strict';
import test, { after, afterEach } from 'node:test';
import { registerHooks } from 'node:module';
import { pathToFileURL, fileURLToPath } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientRoot = path.resolve(__dirname, '..');
const clientSrc = path.join(clientRoot, 'src');

// Resolve Vite-style extensionless relative imports AND resolve bare packages from dentstort-client
registerHooks({
  resolve(specifier, context, nextResolve) {
    if ((specifier.startsWith('./') || specifier.startsWith('../')) && !path.extname(specifier) && context.parentURL) {
      const parentDir = path.dirname(fileURLToPath(context.parentURL));
      const candidate = path.resolve(parentDir, `${specifier}.js`);
      if (fs.existsSync(candidate)) {
        return { url: pathToFileURL(candidate).href, shortCircuit: true };
      }
    }
    if (!specifier.startsWith('.') && !specifier.startsWith('/') && !specifier.startsWith('node:') && !specifier.startsWith('file:')) {
      const fakeParent = pathToFileURL(path.join(clientSrc, 'main.jsx')).href;
      return nextResolve(specifier, { ...context, parentURL: fakeParent });
    }
    return nextResolve(specifier, context);
  },
});

const DENTIST_A = { _id: 'dentist-a-id', name: 'Dr. Alice', email: 'a@test.com', role: 'dentist' };
const DENTIST_B = { _id: 'dentist-b-id', name: 'Dr. Bob', email: 'b@test.com', role: 'dentist' };
const ADMIN = { _id: 'admin-id', name: 'Super Admin', email: 'admin@test.com', role: 'admin' };

// ── Minimal browser globals (with storage event support) for importing real client modules in Node ──
const storage = new Map();
const windowListeners = new Map();

globalThis.localStorage = {
  getItem: (k) => (storage.has(k) ? storage.get(k) : null),
  setItem: (k, v) => storage.set(k, String(v)),
  removeItem: (k) => storage.delete(k),
  clear: () => storage.clear(),
};

globalThis.window = {
  location: { href: 'http://localhost:5173/' },
  addEventListener: (type, fn) => {
    if (!windowListeners.has(type)) windowListeners.set(type, new Set());
    windowListeners.get(type).add(fn);
  },
  removeEventListener: (type, fn) => {
    windowListeners.get(type)?.delete(fn);
  },
  dispatchEvent: (evt) => {
    const handlers = windowListeners.get(evt.type);
    if (!handlers) return;
    for (const fn of handlers) fn(evt);
  },
};
globalThis.alert = () => {};

function dispatchStorageEvent(key) {
  globalThis.window.dispatchEvent({ type: 'storage', key });
}

// Seed Dentist A in localStorage BEFORE importing authStore so Zustand SSR snapshot reflects Dentist A for Test 1
localStorage.setItem('gd_user', JSON.stringify(DENTIST_A));
localStorage.setItem('gd_token', 'token-a');

const importSrc = (rel) => import(pathToFileURL(path.join(clientSrc, rel)).href);

const { queryClient, isUserScopedQuery, clearUserQueryCache } = await importSrc('api/queryClient.js');
const { useAuthStore } = await importSrc('store/authStore.js');
const { default: api } = await importSrc('api/axios.js');
const portfolioHooks = await importSrc('hooks/usePortfolio.js');
const authHooks = await importSrc('hooks/useAuth.js');
const axios = (await import('axios')).default;
const React = (await import('react')).default;
const { renderToStaticMarkup } = await import('react-dom/server');
const { QueryClientProvider } = await import('@tanstack/react-query');
const { MemoryRouter } = await import('react-router-dom');

// Disable 5-minute background GC timers in Node test runner so process exits cleanly
const origDefaults = queryClient.getDefaultOptions();
queryClient.setDefaultOptions({
  ...origDefaults,
  queries: { ...origDefaults.queries, gcTime: 0 },
});

const fetchMyPortfolio = (dentistId, page = 1, limit = 6) =>
  queryClient.fetchQuery({
    queryKey: ['myPortfolio', dentistId, page, limit],
    queryFn: async ({ signal }) => {
      const { data } = await api.get(`/api/portfolio/me/portfolio?page=${page}&limit=${limit}`, { signal });
      return data;
    },
  });

const fetchMediaLibrary = (dentistId) =>
  queryClient.fetchQuery({
    queryKey: ['mediaLibrary', dentistId],
    queryFn: async ({ signal }) => {
      const { data } = await api.get('/api/portfolio/me/media-library', { signal });
      return data;
    },
  });

function resetState() {
  storage.clear();
  queryClient.clear();
  queryClient.setDefaultOptions({
    ...origDefaults,
    queries: { ...origDefaults.queries, gcTime: 0 },
  });
  useAuthStore.setState({
    user: null,
    accessToken: null,
    isShadowMode: false,
    authSessionVersion: 0,
  });
  globalThis.window.location.href = 'http://localhost:5173/';
}

afterEach(() => {
  queryClient.clear();
});

after(() => {
  queryClient.clear();
  queryClient.unmount();
});

test('1. Real useMyPortfolio and useMediaLibrary hooks read dentist-scoped keys and never read another dentist or legacy unscoped key', () => {
  queryClient.setQueryData(['myPortfolio', DENTIST_A._id, 1, 6], { slug: 'dr-alice' });
  queryClient.setQueryData(['mediaLibrary', DENTIST_A._id], [{ patientName: 'Alice Patient' }]);
  queryClient.setQueryData(['myPortfolio', DENTIST_B._id, 1, 6], { slug: 'dr-bob' });
  queryClient.setQueryData(['mediaLibrary', DENTIST_B._id], [{ patientName: 'Bob Patient' }]);
  queryClient.setQueryData(['myPortfolio', 1, 6], { slug: 'LEGACY-UNSCOPED' });
  queryClient.setQueryData(['mediaLibrary'], [{ patientName: 'LEGACY-UNSCOPED' }]);

  let readPort = null;
  let readMedia = null;
  function Probe() {
    readPort = portfolioHooks.useMyPortfolio(1, 6);
    readMedia = portfolioHooks.useMediaLibrary();
    return null;
  }

  renderToStaticMarkup(
    React.createElement(QueryClientProvider, { client: queryClient }, React.createElement(Probe))
  );

  assert.equal(readPort.data?.slug, 'dr-alice');
  assert.equal(readMedia.data?.[0]?.patientName, 'Alice Patient');
});

test('2. Dentist A portfolio & media library are isolated from Dentist B across logout/login, while public caches are preserved', async () => {
  resetState();

  queryClient.setQueryData(['publicPortfolio', 'dr-demo', 1, 6, 'All'], { slug: 'dr-demo', cases: [] });
  queryClient.setQueryData(['publicCase', 'dr-demo', 'case-1'], { case: { _id: 'case-1' } });

  api.defaults.adapter = async (config) => {
    const auth = config.headers?.Authorization || config.headers?.get?.('Authorization');
    if (config.url.startsWith('/api/portfolio/me/portfolio')) {
      if (auth === 'Bearer token-a') {
        return { data: { slug: 'dr-alice', bio: 'Alice Bio', publishedCases: [{ _id: 'a1' }] }, status: 200, statusText: 'OK', headers: {}, config };
      }
      if (auth === 'Bearer token-b') {
        return { data: { slug: 'dr-bob', bio: 'Bob Bio', publishedCases: [{ _id: 'b1' }] }, status: 200, statusText: 'OK', headers: {}, config };
      }
    }
    if (config.url === '/api/portfolio/me/media-library') {
      if (auth === 'Bearer token-a') {
        return { data: [{ sessionId: 'sA', patientName: 'Alice Secret Patient', images: ['https://cld/a.jpg'] }], status: 200, statusText: 'OK', headers: {}, config };
      }
      if (auth === 'Bearer token-b') {
        return { data: [{ sessionId: 'sB', patientName: 'Bob Patient', images: ['https://cld/b.jpg'] }], status: 200, statusText: 'OK', headers: {}, config };
      }
    }
    throw new Error(`Unexpected request: ${config.url} (${auth})`);
  };

  useAuthStore.getState().setAuth(DENTIST_A, 'token-a');
  const portA = await fetchMyPortfolio(DENTIST_A._id, 1, 6);
  const mediaA = await fetchMediaLibrary(DENTIST_A._id);
  assert.equal(portA.slug, 'dr-alice');
  assert.equal(mediaA[0].patientName, 'Alice Secret Patient');

  useAuthStore.getState().logout();

  assert.equal(queryClient.getQueryData(['myPortfolio', DENTIST_A._id, 1, 6]), undefined);
  assert.equal(queryClient.getQueryData(['mediaLibrary', DENTIST_A._id]), undefined);
  assert.equal(queryClient.getQueryCache().findAll({ predicate: isUserScopedQuery }).length, 0);

  // Public caches preserved
  assert.deepEqual(queryClient.getQueryData(['publicPortfolio', 'dr-demo', 1, 6, 'All']), { slug: 'dr-demo', cases: [] });
  assert.deepEqual(queryClient.getQueryData(['publicCase', 'dr-demo', 'case-1']), { case: { _id: 'case-1' } });

  useAuthStore.getState().setAuth(DENTIST_B, 'token-b');
  assert.equal(queryClient.getQueryData(['myPortfolio', DENTIST_B._id, 1, 6]), undefined);
  assert.equal(queryClient.getQueryData(['mediaLibrary', DENTIST_B._id]), undefined);

  const portB = await fetchMyPortfolio(DENTIST_B._id, 1, 6);
  const mediaB = await fetchMediaLibrary(DENTIST_B._id);
  assert.equal(portB.slug, 'dr-bob');
  assert.equal(mediaB[0].patientName, 'Bob Patient');
});

test('3. Shadow Access preserves/restores original admin credentials across dentist switches, and normal login clears stale shadow state', async () => {
  resetState();

  api.defaults.adapter = async (config) => {
    const auth = config.headers?.Authorization || config.headers?.get?.('Authorization');
    if (config.url.startsWith('/api/portfolio/me/portfolio')) {
      return {
        data: { slug: auth === 'Bearer shadow-a' ? 'dr-alice' : 'dr-bob' },
        status: 200, statusText: 'OK', headers: {}, config,
      };
    }
    if (config.url === '/api/portfolio/me/media-library') {
      return {
        data: [{ patientName: auth === 'Bearer shadow-a' ? 'Patient of A' : 'Patient of B' }],
        status: 200, statusText: 'OK', headers: {}, config,
      };
    }
    throw new Error(`Unexpected: ${config.url}`);
  };

  useAuthStore.getState().setAuth(ADMIN, 'admin-token');
  queryClient.setQueryData(['admin', 'dentists', {}], { dentists: [DENTIST_A, DENTIST_B] });
  queryClient.setQueryData(['publicPortfolio', 'dr-public', 1, 6, 'All'], { slug: 'dr-public' });

  // Enter Shadow Access as Dentist A
  useAuthStore.getState().setAuth(DENTIST_A, 'shadow-a', true);
  assert.equal(useAuthStore.getState().isShadowMode, true);
  assert.equal(useAuthStore.getState().user._id, DENTIST_A._id);
  assert.equal(localStorage.getItem('gd_admin_token'), 'admin-token');
  assert.equal(queryClient.getQueryData(['admin', 'dentists', {}]), undefined);
  assert.deepEqual(queryClient.getQueryData(['publicPortfolio', 'dr-public', 1, 6, 'All']), { slug: 'dr-public' });

  const portA = await fetchMyPortfolio(DENTIST_A._id);
  const mediaA = await fetchMediaLibrary(DENTIST_A._id);
  assert.equal(portA.slug, 'dr-alice');
  assert.equal(mediaA[0].patientName, 'Patient of A');

  // Switch directly in Shadow Access to Dentist B -> original admin credentials MUST stay intact
  useAuthStore.getState().setAuth(DENTIST_B, 'shadow-b', true);
  assert.equal(useAuthStore.getState().isShadowMode, true);
  assert.equal(localStorage.getItem('gd_admin_token'), 'admin-token');
  assert.equal(JSON.parse(localStorage.getItem('gd_admin_user'))._id, ADMIN._id);
  assert.equal(queryClient.getQueryData(['myPortfolio', DENTIST_A._id, 1, 6]), undefined);
  assert.equal(queryClient.getQueryData(['mediaLibrary', DENTIST_A._id]), undefined);

  const portB = await fetchMyPortfolio(DENTIST_B._id);
  assert.equal(portB.slug, 'dr-bob');

  // Exit Shadow Access -> restores original admin user & token, clears Dentist B cache
  const exited = useAuthStore.getState().exitShadowMode();
  assert.equal(exited, true);
  assert.equal(useAuthStore.getState().isShadowMode, false);
  assert.equal(useAuthStore.getState().user._id, ADMIN._id);
  assert.equal(useAuthStore.getState().accessToken, 'admin-token');
  assert.equal(localStorage.getItem('gd_admin_token'), null);
  assert.equal(queryClient.getQueryData(['myPortfolio', DENTIST_B._id, 1, 6]), undefined);

  // Calling exitShadowMode when not in shadow mode safely returns false
  assert.equal(useAuthStore.getState().exitShadowMode(), false);

  // Edge case: normal login while stale shadow credentials exist MUST clear shadow state
  useAuthStore.getState().setAuth(DENTIST_A, 'shadow-a', true);
  assert.equal(useAuthStore.getState().isShadowMode, true);
  useAuthStore.getState().setAuth(DENTIST_B, 'normal-token-b', false);
  assert.equal(useAuthStore.getState().isShadowMode, false);
  assert.equal(localStorage.getItem('gd_admin_token'), null);
  assert.equal(localStorage.getItem('gd_admin_user'), null);
});

test('4. In-flight requests started under Dentist A are cancelled & discarded after identity switch (200, 403, 401 refresh failure)', async () => {
  resetState();
  useAuthStore.getState().setAuth(DENTIST_A, 'token-a');

  let resolveSlowQuery;
  let resolveSlowDirect;
  let rejectSlowSuspended;
  let rejectSlowRefresh;
  let signalAborted = false;

  const origPost = axios.post;
  axios.post = () => new Promise((_resolve, reject) => {
    rejectSlowRefresh = () => reject(new Error('Refresh failed'));
  });

  api.defaults.adapter = (config) => {
    if (config.signal) {
      config.signal.addEventListener('abort', () => {
        signalAborted = true;
      });
    }
    if (config.url === '/api/portfolio/me/media-library' && config.signal) {
      return new Promise((resolve) => {
        resolveSlowQuery = () => resolve({
          data: [{ patientName: 'STALE ALICE QUERY DATA' }],
          status: 200, statusText: 'OK', headers: {}, config,
        });
      });
    }
    if (config.url === '/api/portfolio/me/media-library' && !config.signal) {
      return new Promise((resolve) => {
        resolveSlowDirect = () => resolve({
          data: [{ patientName: 'STALE ALICE DIRECT DATA' }],
          status: 200, statusText: 'OK', headers: {}, config,
        });
      });
    }
    if (config.url === '/api/stale-suspended') {
      return new Promise((_resolve, reject) => {
        rejectSlowSuspended = () => {
          const err = new Error('Suspended');
          err.config = config;
          err.response = { status: 403, data: { code: 'ACCOUNT_SUSPENDED' } };
          reject(err);
        };
      });
    }
    if (config.url === '/api/stale-401-fail') {
      const err = new Error('Unauthorized');
      err.config = config;
      err.response = { status: 401, data: { message: 'Token expired' } };
      return Promise.reject(err);
    }
    return Promise.resolve({ data: { slug: 'dr-bob' }, status: 200, statusText: 'OK', headers: {}, config });
  };

  try {
    const inFlightQuery = fetchMediaLibrary(DENTIST_A._id).catch((e) => e);
    const inFlightDirect200 = api.get('/api/portfolio/me/media-library').catch((e) => e);
    const inFlightStale403 = api.get('/api/stale-suspended').catch((e) => e);
    const inFlightStale401Fail = api.get('/api/stale-401-fail').catch((e) => e);

    await new Promise((r) => setTimeout(r, 15));

    useAuthStore.getState().logout();
    useAuthStore.getState().setAuth(DENTIST_B, 'token-b');

    assert.equal(signalAborted, true);

    resolveSlowQuery();
    resolveSlowDirect();
    rejectSlowSuspended();
    rejectSlowRefresh();

    const [queryResult, direct200Result, stale403Result, stale401FailResult] = await Promise.all([
      inFlightQuery,
      inFlightDirect200,
      inFlightStale403,
      inFlightStale401Fail,
    ]);

    assert.equal(axios.isCancel(direct200Result), true);
    assert.equal(axios.isCancel(stale403Result), true);
    assert.equal(axios.isCancel(stale401FailResult), true);

    // Dentist B MUST NOT be logged out or redirected by Dentist A's failed refresh or 403
    assert.equal(useAuthStore.getState().user._id, DENTIST_B._id);
    assert.equal(useAuthStore.getState().accessToken, 'token-b');
    assert.equal(globalThis.window.location.href, 'http://localhost:5173/');

    assert.equal(queryClient.getQueryData(['mediaLibrary', DENTIST_A._id]), undefined);
    assert.equal(queryClient.getQueryData(['mediaLibrary', DENTIST_B._id]), undefined);
    assert.ok(queryResult instanceof Error || queryResult === undefined);
  } finally {
    axios.post = origPost;
  }
});

test('5. Concurrent 401 refresh across identity switch: Dentist B starts own refresh and succeeds even while Dentist A refresh is still in flight', async () => {
  resetState();
  useAuthStore.getState().setAuth(DENTIST_A, 'expired-token-a');

  let resolveRefreshA;
  let resolveRefreshB;
  let refreshCallIndex = 0;

  const origPost = axios.post;
  axios.post = (url) => {
    assert.ok(url.endsWith('/api/auth/refresh'));
    refreshCallIndex += 1;
    if (refreshCallIndex === 1) {
      return new Promise((resolve) => {
        resolveRefreshA = () => resolve({ data: { accessToken: 'STALE-TOKEN-A-NEW', role: 'dentist' } });
      });
    }
    return new Promise((resolve) => {
      resolveRefreshB = () => resolve({ data: { accessToken: 'FRESH-TOKEN-B-NEW', role: 'dentist' } });
    });
  };

  api.defaults.adapter = async (config) => {
    const auth = config.headers?.Authorization || config.headers?.get?.('Authorization');
    if (auth === 'Bearer expired-token-a' || auth === 'Bearer expired-token-b') {
      const err = new Error('Unauthorized');
      err.config = config;
      err.response = { status: 401, data: { message: 'Token expired' } };
      throw err;
    }
    if (auth === 'Bearer FRESH-TOKEN-B-NEW') {
      return { data: { slug: 'dr-bob-refreshed' }, status: 200, statusText: 'OK', headers: {}, config };
    }
    throw new Error(`Unexpected retry with auth: ${auth}`);
  };

  try {
    const reqA1 = api.get('/api/portfolio/me/portfolio').catch((e) => e);
    const reqA2 = api.get('/api/portfolio/me/media-library').catch((e) => e);
    await new Promise((r) => setTimeout(r, 15));
    assert.equal(refreshCallIndex, 1);

    useAuthStore.getState().setAuth(DENTIST_B, 'expired-token-b');

    const reqB1 = api.get('/api/portfolio/me/portfolio');
    const reqB2 = api.get('/api/portfolio/me/portfolio');
    await new Promise((r) => setTimeout(r, 15));
    assert.equal(refreshCallIndex, 2);

    resolveRefreshA();
    const [resA1, resA2] = await Promise.all([reqA1, reqA2]);
    assert.equal(axios.isCancel(resA1), true);
    assert.equal(axios.isCancel(resA2), true);
    assert.equal(useAuthStore.getState().accessToken, 'expired-token-b');

    resolveRefreshB();
    const [resB1, resB2] = await Promise.all([reqB1, reqB2]);
    assert.equal(resB1.data.slug, 'dr-bob-refreshed');
    assert.equal(resB2.data.slug, 'dr-bob-refreshed');
    assert.equal(useAuthStore.getState().accessToken, 'FRESH-TOKEN-B-NEW');
    assert.equal(useAuthStore.getState().user._id, DENTIST_B._id);
  } finally {
    axios.post = origPost;
  }
});

test('6. Network-failing logout (useLogout onSettled) STILL clears local auth state, user query cache, and preserves public cache', async () => {
  resetState();
  useAuthStore.getState().setAuth(DENTIST_A, 'token-a');
  queryClient.setQueryData(['myPortfolio', DENTIST_A._id, 1, 6], { slug: 'dr-alice' });
  queryClient.setQueryData(['mediaLibrary', DENTIST_A._id], [{ patientName: 'Alice Secret Patient' }]);
  queryClient.setQueryData(['publicPortfolio', 'dr-demo', 1, 6, 'All'], { slug: 'dr-demo' });

  api.defaults.adapter = async (config) => {
    if (config.url === '/api/auth/logout') {
      const err = new Error('Network Error');
      err.config = config;
      throw err;
    }
    throw new Error(`Unexpected: ${config.url}`);
  };

  let capturedLogoutMutation = null;
  function ProbeLogout() {
    capturedLogoutMutation = authHooks.useLogout();
    return null;
  }

  renderToStaticMarkup(
    React.createElement(
      QueryClientProvider,
      { client: queryClient },
      React.createElement(MemoryRouter, null, React.createElement(ProbeLogout))
    )
  );

  assert.ok(capturedLogoutMutation);
  await assert.rejects(() => capturedLogoutMutation.mutateAsync(), /Network Error/);

  assert.equal(useAuthStore.getState().user, null);
  assert.equal(useAuthStore.getState().accessToken, null);
  assert.equal(localStorage.getItem('gd_user'), null);
  assert.equal(localStorage.getItem('gd_token'), null);
  assert.equal(queryClient.getQueryData(['myPortfolio', DENTIST_A._id, 1, 6]), undefined);
  assert.equal(queryClient.getQueryData(['mediaLibrary', DENTIST_A._id]), undefined);
  assert.deepEqual(queryClient.getQueryData(['publicPortfolio', 'dr-demo', 1, 6, 'All']), { slug: 'dr-demo' });
});

test('7. Normal same-user Portfolio functionality, cache hit, same-user token refresh, and scoped invalidation remain intact', async () => {
  resetState();
  queryClient.setDefaultOptions({
    ...origDefaults,
    queries: { ...origDefaults.queries, gcTime: 5000 },
  });
  useAuthStore.getState().setAuth(DENTIST_A, 'token-a');

  let fetchCount = 0;
  api.defaults.adapter = async (config) => {
    if (config.url.startsWith('/api/portfolio/me/portfolio')) {
      fetchCount += 1;
      return {
        data: { slug: 'dr-alice', publishedCases: fetchCount === 1 ? [] : [{ _id: 'new-case' }] },
        status: 200, statusText: 'OK', headers: {}, config,
      };
    }
    throw new Error(`Unexpected: ${config.url}`);
  };

  const first = await fetchMyPortfolio(DENTIST_A._id, 1, 6);
  assert.equal(first.publishedCases.length, 0);
  assert.equal(fetchCount, 1);

  const cached = await fetchMyPortfolio(DENTIST_A._id, 1, 6);
  assert.equal(fetchCount, 1);
  assert.equal(cached.slug, 'dr-alice');

  const versionBefore = useAuthStore.getState().authSessionVersion;
  useAuthStore.getState().setToken('token-a-refreshed');
  assert.equal(useAuthStore.getState().authSessionVersion, versionBefore);

  await queryClient.invalidateQueries({ queryKey: ['myPortfolio', DENTIST_A._id] });
  const refreshed = await fetchMyPortfolio(DENTIST_A._id, 1, 6);
  assert.equal(fetchCount, 2);
  assert.equal(refreshed.publishedCases.length, 1);

  queryClient.setQueryData(['publicPortfolio', 'dr-demo', 1, 6, 'All'], { slug: 'dr-demo' });
  clearUserQueryCache(queryClient);
  assert.equal(queryClient.getQueryData(['myPortfolio', DENTIST_A._id, 1, 6]), undefined);
  assert.deepEqual(queryClient.getQueryData(['publicPortfolio', 'dr-demo', 1, 6, 'All']), { slug: 'dr-demo' });
});

test('8. Multi-tab storage sync: cross-tab logout & account switch update Zustand, bump authSessionVersion, and clear stale user cache while preserving public cache', () => {
  resetState();
  useAuthStore.getState().setAuth(DENTIST_A, 'token-a');
  queryClient.setQueryData(['myPortfolio', DENTIST_A._id, 1, 6], { slug: 'dr-alice' });
  queryClient.setQueryData(['mediaLibrary', DENTIST_A._id], [{ patientName: 'Alice Patient' }]);
  queryClient.setQueryData(['publicPortfolio', 'dr-demo', 1, 6, 'All'], { slug: 'dr-demo' });

  const v1 = useAuthStore.getState().authSessionVersion;

  // Unrelated storage key (e.g. theme toggle in another tab) MUST NOT clear user cache or bump version
  localStorage.setItem('dentstore-theme', 'light');
  dispatchStorageEvent('dentstore-theme');
  assert.equal(useAuthStore.getState().authSessionVersion, v1);
  assert.deepEqual(queryClient.getQueryData(['myPortfolio', DENTIST_A._id, 1, 6]), { slug: 'dr-alice' });

  // Simulate Tab B logging in as Dentist B
  localStorage.setItem('gd_user', JSON.stringify(DENTIST_B));
  localStorage.setItem('gd_token', 'token-b');
  dispatchStorageEvent('gd_token');

  assert.equal(useAuthStore.getState().user._id, DENTIST_B._id);
  assert.equal(useAuthStore.getState().accessToken, 'token-b');
  assert.equal(useAuthStore.getState().isShadowMode, false);
  assert.equal(useAuthStore.getState().authSessionVersion, v1 + 1);
  assert.equal(queryClient.getQueryData(['myPortfolio', DENTIST_A._id, 1, 6]), undefined);
  assert.equal(queryClient.getQueryData(['mediaLibrary', DENTIST_A._id]), undefined);
  assert.deepEqual(queryClient.getQueryData(['publicPortfolio', 'dr-demo', 1, 6, 'All']), { slug: 'dr-demo' });

  // Populate Dentist B cache, then simulate Tab B logging out
  queryClient.setQueryData(['myPortfolio', DENTIST_B._id, 1, 6], { slug: 'dr-bob' });
  const v2 = useAuthStore.getState().authSessionVersion;
  localStorage.removeItem('gd_token');
  localStorage.removeItem('gd_user');
  dispatchStorageEvent('gd_token');

  assert.equal(useAuthStore.getState().user, null);
  assert.equal(useAuthStore.getState().accessToken, null);
  assert.equal(useAuthStore.getState().authSessionVersion, v2 + 1);
  assert.equal(queryClient.getQueryData(['myPortfolio', DENTIST_B._id, 1, 6]), undefined);
  assert.deepEqual(queryClient.getQueryData(['publicPortfolio', 'dr-demo', 1, 6, 'All']), { slug: 'dr-demo' });
});

test('9. Multi-tab storage sync: cross-tab Shadow Mode entry/exit and localStorage.clear() sync cleanly', () => {
  resetState();
  useAuthStore.getState().setAuth(ADMIN, 'admin-token');
  queryClient.setQueryData(['admin', 'dentists', {}], { dentists: [DENTIST_A] });

  const v1 = useAuthStore.getState().authSessionVersion;

  // Another tab enters Shadow Mode as Dentist A
  localStorage.setItem('gd_admin_user', JSON.stringify(ADMIN));
  localStorage.setItem('gd_admin_token', 'admin-token');
  localStorage.setItem('gd_user', JSON.stringify(DENTIST_A));
  localStorage.setItem('gd_token', 'shadow-token-a');
  dispatchStorageEvent('gd_admin_token');

  assert.equal(useAuthStore.getState().isShadowMode, true);
  assert.equal(useAuthStore.getState().user._id, DENTIST_A._id);
  assert.equal(useAuthStore.getState().accessToken, 'shadow-token-a');
  assert.equal(useAuthStore.getState().authSessionVersion, v1 + 1);
  assert.equal(queryClient.getQueryData(['admin', 'dentists', {}]), undefined);

  // Another tab calls localStorage.clear() (dispatches storage event with key === null)
  queryClient.setQueryData(['myPortfolio', DENTIST_A._id, 1, 6], { slug: 'dr-alice' });
  const v2 = useAuthStore.getState().authSessionVersion;
  localStorage.clear();
  dispatchStorageEvent(null);

  assert.equal(useAuthStore.getState().user, null);
  assert.equal(useAuthStore.getState().accessToken, null);
  assert.equal(useAuthStore.getState().isShadowMode, false);
  assert.equal(useAuthStore.getState().authSessionVersion, v2 + 1);
  assert.equal(queryClient.getQueryData(['myPortfolio', DENTIST_A._id, 1, 6]), undefined);
});

