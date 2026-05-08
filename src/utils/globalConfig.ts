import axios, { AxiosInstance } from 'axios';
import Cookies from 'js-cookie';

// Global configuration interface
export interface GlobalConfig {
  environment: string;
  isDevelopment: boolean;
  apiUrl: string;
  GATEWAY_URL_BACKEND: string;
  mfManifestUrl: string;
  cdnUrl?: string;
}

// Global Miister configuration attached to window
declare global {
  interface Window {
    __MIISTER_CONFIG__?: GlobalConfig;
    __MIISTER_AXIOS__?: AxiosInstance;
    __MIISTER_INIT__?: () => Promise<void>;
    __MIISTER_GET_CONFIG__?: () => Promise<GlobalConfig>;
  }
}

let configPromise: Promise<GlobalConfig> | null = null;
let axiosInstanceCache: AxiosInstance | null = null;

/**
 * Fetch runtime configuration from shell's /api/config endpoint
 */
async function fetchRuntimeConfig(): Promise<GlobalConfig> {
  if (!configPromise) {
    configPromise = (async () => {
      try {
        const env = process.env.NODE_ENV || 'development';
        const response = await fetch(`/api/config?env=${env}`, {
          cache: 'no-store',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Config API returned ${response.status}`);
        }

        const config: GlobalConfig = await response.json();

        if (!config.GATEWAY_URL_BACKEND) {
          throw new Error('Missing GATEWAY_URL_BACKEND in config');
        }

        // Store config globally
        if (typeof window !== 'undefined') {
          window.__MIISTER_CONFIG__ = config;
        }

        console.log('✅ Global config loaded:', {
          environment: config.environment,
          apiUrl: config.apiUrl,
          gatewayUrl: config.GATEWAY_URL_BACKEND,
        });

        return config;
      } catch (error) {
        console.error('❌ Failed to load global config:', error);
        throw error;
      }
    })();
  }

  return configPromise;
}

/**
 * Create global axios instance with interceptors
 */
function createGlobalAxiosInstance(): AxiosInstance {
  if (axiosInstanceCache) {
    return axiosInstanceCache;
  }

  const instance = axios.create({
    timeout: 100000,
    withCredentials: false,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor - set baseURL and auth token
  instance.interceptors.request.use(
    async (requestConfig) => {
      try {
        const config = await fetchRuntimeConfig();
        const baseUrl = String(config.GATEWAY_URL_BACKEND || '').replace(/\/$/, '');
        requestConfig.baseURL = baseUrl;

        // Add auth token if exists
        const token = Cookies.get('auth_token');
        if (token) {
          requestConfig.headers.Authorization = `Bearer ${token}`;
        }

        console.log(`🌐 API Request: ${requestConfig.method?.toUpperCase()} ${baseUrl}${requestConfig.url}`);

        return requestConfig;
      } catch (error) {
        console.error('❌ Request interceptor error:', error);
        return Promise.reject(error);
      }
    },
    (error) => {
      console.error('❌ Request error:', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor - handle 401 errors
  instance.interceptors.response.use(
    (response) => {
      console.log(`✅ API Response: ${response.status} ${response.config.url}`);
      return response;
    },
    (error) => {
      if (error.response?.status === 401) {
        console.warn('⚠️ Unauthorized (401) - Clearing auth and redirecting to login');

        // Clear auth data
        Cookies.remove('auth_token');
        if (typeof window !== 'undefined') {
          window.localStorage?.clear?.();

          // Redirect to login
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
        }
      }

      console.error('❌ API Error:', {
        status: error.response?.status,
        url: error.config?.url,
        message: error.message,
      });

      return Promise.reject(error);
    }
  );

  axiosInstanceCache = instance;

  // Attach to window for global access
  if (typeof window !== 'undefined') {
    window.__MIISTER_AXIOS__ = instance;
  }

  console.log('✅ Global axios instance created and attached to window.__MIISTER_AXIOS__');

  return instance;
}

/**
 * Initialize global configuration and axios instance
 * This should be called once in _app.tsx
 */
export async function initializeGlobalConfig(): Promise<void> {
  try {
    console.log('🚀 Initializing global Miister configuration...');

    // Fetch config
    const config = await fetchRuntimeConfig();

    // Create axios instance
    const axiosInstance = createGlobalAxiosInstance();

    // Attach helper functions to window
    if (typeof window !== 'undefined') {
      window.__MIISTER_GET_CONFIG__ = fetchRuntimeConfig;
      window.__MIISTER_INIT__ = initializeGlobalConfig;
    }

    console.log('✅ Global Miister configuration initialized successfully');
    console.log('📦 Available on window:', {
      __MIISTER_CONFIG__: !!window.__MIISTER_CONFIG__,
      __MIISTER_AXIOS__: !!window.__MIISTER_AXIOS__,
      __MIISTER_GET_CONFIG__: !!window.__MIISTER_GET_CONFIG__,
      __MIISTER_INIT__: !!window.__MIISTER_INIT__,
    });
  } catch (error) {
    console.error('❌ Failed to initialize global config:', error);
    throw error;
  }
}

/**
 * Get the global axios instance (creates if not exists)
 */
export function getGlobalAxiosInstance(): AxiosInstance {
  if (typeof window !== 'undefined' && window.__MIISTER_AXIOS__) {
    return window.__MIISTER_AXIOS__;
  }

  return createGlobalAxiosInstance();
}

/**
 * Get the global config (fetches if not exists)
 */
export async function getGlobalConfig(): Promise<GlobalConfig> {
  if (typeof window !== 'undefined' && window.__MIISTER_CONFIG__) {
    return window.__MIISTER_CONFIG__;
  }

  return fetchRuntimeConfig();
}

// Export axios instance for direct import
export const globalAxios = typeof window !== 'undefined' && window.__MIISTER_AXIOS__
  ? window.__MIISTER_AXIOS__
  : createGlobalAxiosInstance();

export default globalAxios;
