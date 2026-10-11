export function ecommerceFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  const slot = window.sessionStorage.getItem("cxsun.auth.slot");
  if (slot) headers.set("x-cxsun-session-slot", slot);
  return fetch(input, { ...init, headers, credentials: "include" });
}
