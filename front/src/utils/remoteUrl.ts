// Resolve remoteEntry.js URL from config -> manifest (browser)
export async function getModuleUrlAsync(moduleName: ModuleName): Promise<string> {
  try {
    const cfgRes = await fetch('/api/config', { cache: 'no-store' });
    if (!cfgRes.ok) throw new Error('Config HTTP ' + cfgRes.status);
    const cfg = await cfgRes.json() as any;
    const manifestUrl = cfg.mfManifestUrl;
    if (!manifestUrl) throw new Error('Missing mfManifestUrl');

    // Manifest is served by http-server (no auth required)
    // Just fetch it directly without authentication headers
    const manRes = await fetch(manifestUrl, {
      cache: 'no-store'
    });
    if (!manRes.ok) throw new Error('Manifest HTTP ' + manRes.status);
    const manifest = await manRes.json();
    const entry = manifest[moduleName as string];
    const url = entry && entry.url;
    if (!url) throw new Error('Missing ' + moduleName + ' entry');
    return url as string;
  } catch (e) {
    // Fallback in dev to localhost ports
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      const modulePort = MODULE_PORTS[moduleName];
      return `http://localhost:${modulePort}/remoteEntry.js`;
    }
    throw e;
  }
}

export function getModuleUrl(moduleName: ModuleName): string {
  if (typeof window !== 'undefined') {
    try {
      const xhr1 = new XMLHttpRequest();
      xhr1.open('GET', '/api/config', false);
      xhr1.send(null);

      if (xhr1.status === 200) {
        const cfg = JSON.parse(xhr1.responseText);
        if (cfg && cfg.mfManifestUrl) {
          const xhr2 = new XMLHttpRequest();
          xhr2.open('GET', cfg.mfManifestUrl, false);
          xhr2.send(null);

          if (xhr2.status === 200) {
            const manifest = JSON.parse(xhr2.responseText);
            const mfes = manifest.mfes ?? manifest;
            const entry = mfes[moduleName];

            if (entry && entry.url) {
              return entry.url as string;
            }
          }
        }
      }
    } catch {
      // ignore
    }

    if (process.env.NODE_ENV === 'development') {
      const modulePort = MODULE_PORTS[moduleName];
      return `http://localhost:${modulePort}/remoteEntry.js`;
    }
  }

  throw new Error('Could not resolve remote URL for ' + moduleName);
}

// Common ports for each module
export const MODULE_PORTS = {
  cra: 3002,
  facture: 3003,
  bank: 3004,
  comptabilite: 3005,
  configuration: 3006,
  users: 3007,
  walet: 3008,
  admin: 3009,
  drive: 3010,
  sofia: 3011,
} as const;

export type ModuleName = keyof typeof MODULE_PORTS;
