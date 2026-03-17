export const API_BASE = "http://127.0.0.1:8000/api/v1";
export const WS_BASE = "ws://127.0.0.1:8000";

export const authFetch = async (url: string, options: any = {}) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('stratis_token') : null;
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    if (response.status === 401) {
      console.error("Unauthorized — redirecting to login.");
      if (typeof window !== 'undefined') {
        localStorage.removeItem('stratis_token');
        localStorage.removeItem('stratis_user');
        window.location.href = '/login';
      }
    }
    let detail = `HTTP ${response.status}`;
    try {
      const body = await response.json();
      detail = body.detail || body.message || detail;
    } catch {}
    throw new Error(detail);
  }

  return response;
};

/**
 * Create an auto-reconnecting WebSocket connection.
 * @param path   WebSocket path (e.g. "/ws/telemetry")
 * @param onMsg  Callback called with parsed JSON payload on each message
 * @returns      Cleanup function that closes the socket
 */
export function wsConnect(path: string, onMsg: (data: any) => void): () => void {
  let ws: WebSocket | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let stopped = false;

  const connect = () => {
    if (stopped) return;
    ws = new WebSocket(`${WS_BASE}${path}`);

    ws.onopen = () => {
      console.log(`[WS] Connected to ${path}`);
    };

    ws.onmessage = (evt) => {
      try {
        onMsg(JSON.parse(evt.data));
      } catch (e) {
        console.warn('[WS] Failed to parse message:', e);
      }
    };

    ws.onerror = (err) => {
      console.warn('[WS] Error:', err);
    };

    ws.onclose = () => {
      if (!stopped) {
        console.log('[WS] Disconnected — reconnecting in 3s...');
        reconnectTimer = setTimeout(connect, 3000);
      }
    };
  };

  connect();

  return () => {
    stopped = true;
    if (reconnectTimer) clearTimeout(reconnectTimer);
    if (ws) ws.close();
  };
}
