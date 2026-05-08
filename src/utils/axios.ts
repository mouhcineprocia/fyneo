import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import Cookies from 'js-cookie';

// Custom error types
interface CustomErrorResponse {
  message: string;
  status?: number;
  code?: string;
}

interface AppConfig {
  apiUrl: string;
  GATEWAY_URL_BACKEND: string;
  isDevelopment: boolean;
}

// Configuration cache
let configCache: AppConfig | null = null;
let configLoadPromise: Promise<AppConfig> | null = null;

// Flag to prevent multiple redirects
let isRedirecting = false;

// Function to clear user session and redirect to login
const clearUserSession = () => {
  // Prevent multiple redirects
  if (isRedirecting) return;

  isRedirecting = true;
  console.log('Clearing session and redirecting to login...');

  // Clear storage first
  if (typeof window !== 'undefined') {
    window.localStorage.clear();
    Cookies.remove('auth_token');

    // Force navigation to login page
    window.location.href = '/login';
  }
};

// Function to load configuration from /api/config ONLY
const loadConfig = async (): Promise<AppConfig> => {
  // Return cached config if available
  if (configCache) {
    return configCache;
  }

  // Return existing promise if already loading
  if (configLoadPromise) {
    return configLoadPromise;
  }

  // Create load promise
  configLoadPromise = (async () => {
    // Check if we're running in the browser
    if (typeof window !== 'undefined') {
      try {
        // Load from /api/config endpoint (which reads context.json or prod.json)
        const result = await fetch('/api/config', {
          cache: 'no-cache',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!result.ok) {
          throw new Error(`Failed to load config: HTTP ${result.status}`);
        }

        const config = await result.json();

        if (!config.GATEWAY_URL_BACKEND) {
          throw new Error('GATEWAY_URL_BACKEND not found in config');
        }

        configCache = config;
        console.log('✅ Shell: Loaded config from /api/config:', configCache);
        return configCache;
      } catch (error) {
        console.error('❌ Shell: Failed to load config from /api/config:', error);
        throw new Error('Could not load configuration from /api/config');
      }
    }

    throw new Error('Cannot load config outside browser environment');
  })();

  return configLoadPromise;
};

// Function to get config synchronously (returns null if not loaded yet)
const getConfig = (): AppConfig | null => {
  return configCache;
};

// List of paths that don't require authentication
const publicPaths = [
  '/assets',
  '/auth/logout',
  '/auth/generate-token',
  '/winu-user/v1/organization/inscription',
  '/winu-user/v1/user/forgot-password',
  '/winu-user/v1/team/redirect'
];

// List of paths that should never redirect on 401 errors
const noRedirectOnErrorPaths = [
  '/winu-user/v1/organization/inscription',
  '/winu-user/v1/user/forgot-password',
  '/winu-user/v1/team/redirect'
];

// Function to check if a URL is public (doesn't need auth)
const isPublicPath = (url: string): boolean => {
  return publicPaths.some(path => url.includes(path));
};

// Function to check if a URL should never redirect on 401
const shouldSkipRedirect = (url: string): boolean => {
  return noRedirectOnErrorPaths.some(path => url.includes(path));
};

// Create Axios instances with enhanced error handling
const createAxiosInstance = (baseURL: string): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    timeout: 100000, // 100 seconds timeout
    withCredentials: false,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor
  instance.interceptors.request.use(
    (config) => {
      // Don't make new requests if we're already redirecting
      if (isRedirecting) {
        const source = axios.CancelToken.source();
        source.cancel('Operation canceled due to session expiration');
        config.cancelToken = source.token;
        return config;
      }

      const url = config.url || '';
      const isPublic = isPublicPath(url);

      // Only add authorization headers for protected routes
      if (!isPublic && typeof window !== 'undefined') {
        const token = Cookies.get('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } else {
        // Make sure to remove any authorization header for public paths
        if (config.headers && config.headers.Authorization) {
          delete config.headers.Authorization;
        }
      }

      return config;
    },
    (error) => {
      console.error('Request Interceptor Error:', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor
  instance.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
      // If we're already redirecting, don't process further errors
      if (isRedirecting) {
        return Promise.reject(error);
      }

      const url = error.config?.url || '';
      const isPublic = isPublicPath(url);
      const skipRedirect = shouldSkipRedirect(url);

      // For special paths, bypass redirect logic
      if (skipRedirect) {
        return Promise.reject(error);
      }

      // Check for 401 error (but only redirect for protected routes)
      if (error.response && error.response.status === 401 && !isPublic && typeof window !== 'undefined') {
        clearUserSession();
        return Promise.reject(error);
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

// Create instances function - only create if config is loaded
const createInstances = (config: AppConfig) => {
  const baseURL = config.GATEWAY_URL_BACKEND;

  console.log('🔧 Shell: Creating axios instances with GATEWAY_URL_BACKEND:', baseURL);

  return {
    axiosInstance: createAxiosInstance(baseURL),
    axiosInstanceAuth: createAxiosInstance(baseURL),
    axiosInstanceCra: createAxiosInstance(baseURL),
    axiosInstanceProcess: createAxiosInstance(baseURL),
    axiosInstancePaye: createAxiosInstance(baseURL),
    axiosInstanceWalet: createAxiosInstance(baseURL),
    axiosInstanceContable: createAxiosInstance(baseURL),
    axiosInstanceMessagerie: createAxiosInstance(baseURL),
    axiosInstanceFacture: createAxiosInstance(baseURL),
    axiosInstanceUser: createAxiosInstance(baseURL),
  };
};

// Initialize config and instances
let instances: any = null;

// Initialize config asynchronously (only in browser)
const initializeConfig = async () => {
  if (typeof window !== 'undefined') {
    try {
      const config = await loadConfig();
      console.log('🚀 Shell: Config loaded, creating axios instances...');
      instances = createInstances(config);
      console.log('✅ Shell: Axios instances created successfully');
    } catch (error) {
      console.error('❌ Shell: Failed to initialize config:', error);
    }
  }
};

// Auto-initialize config when in browser
if (typeof window !== 'undefined') {
  initializeConfig();
}

// Export instances with getters that wait for initialization
export const axiosInstance = new Proxy({} as AxiosInstance, {
  get(target, prop) {
    if (!instances) {
      throw new Error('Shell axios instances not initialized yet. Config must be loaded first.');
    }
    return instances.axiosInstance[prop];
  }
});

export const axiosInstanceAuth = new Proxy({} as AxiosInstance, {
  get(target, prop) {
    if (!instances) {
      throw new Error('Shell axios instances not initialized yet. Config must be loaded first.');
    }
    return instances.axiosInstanceAuth[prop];
  }
});

export const axiosInstanceContable = new Proxy({} as AxiosInstance, {
  get(target, prop) {
    if (!instances) {
      throw new Error('Shell axios instances not initialized yet. Config must be loaded first.');
    }
    return instances.axiosInstanceContable[prop];
  }
});

export const axiosInstanceMessagerie = new Proxy({} as AxiosInstance, {
  get(target, prop) {
    if (!instances) {
      throw new Error('Shell axios instances not initialized yet. Config must be loaded first.');
    }
    return instances.axiosInstanceMessagerie[prop];
  }
});

export const axiosInstanceCra = new Proxy({} as AxiosInstance, {
  get(target, prop) {
    if (!instances) {
      throw new Error('Shell axios instances not initialized yet. Config must be loaded first.');
    }
    return instances.axiosInstanceCra[prop];
  }
});

export const axiosInstanceFacture = new Proxy({} as AxiosInstance, {
  get(target, prop) {
    if (!instances) {
      throw new Error('Shell axios instances not initialized yet. Config must be loaded first.');
    }
    return instances.axiosInstanceFacture[prop];
  }
});

export const axiosInstanceUser = new Proxy({} as AxiosInstance, {
  get(target, prop) {
    if (!instances) {
      throw new Error('Shell axios instances not initialized yet. Config must be loaded first.');
    }
    return instances.axiosInstanceUser[prop];
  }
});

export const axiosInstanceProcess = new Proxy({} as AxiosInstance, {
  get(target, prop) {
    if (!instances) {
      throw new Error('Shell axios instances not initialized yet. Config must be loaded first.');
    }
    return instances.axiosInstanceProcess[prop];
  }
});

export const axiosInstanceWalet = new Proxy({} as AxiosInstance, {
  get(target, prop) {
    if (!instances) {
      throw new Error('Shell axios instances not initialized yet. Config must be loaded first.');
    }
    return instances.axiosInstanceWalet[prop];
  }
});

export const axiosInstancePaye = new Proxy({} as AxiosInstance, {
  get(target, prop) {
    if (!instances) {
      throw new Error('Shell axios instances not initialized yet. Config must be loaded first.');
    }
    return instances.axiosInstancePaye[prop];
  }
});

export default axiosInstance;

// Export config utilities
export { loadConfig, getConfig, initializeConfig };
