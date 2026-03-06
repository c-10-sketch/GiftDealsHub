// Custom fetch wrapper to handle JWT tokens securely
export async function authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = localStorage.getItem("auth_token");
  
  const headers = new Headers(options.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = response.statusText;
    try {
      const data = await response.json();
      errorMsg = data.message || errorMsg;
    } catch (e) {
      // ignore JSON parse error
    }
    throw new Error(errorMsg);
  }

  return response;
}
