export const API_BASE_URL = process.env.API_BASE_URL;
export const API_AUTH_TOKEN = process.env.API_AUTH_TOKEN;

export async function safeJsonFetch<T>(
  endpoint: string,
  method?: "GET" | "POST" | "PUT" | "DELETE",
  body?: any,
  token?: string
): Promise<T | null> {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "Api-Key": `${API_AUTH_TOKEN}`,
        ...(token ? { Authorization: token } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      try {
        const errorData = await response.json();
        console.error("Error response from API:", errorData);
        return errorData;
      } catch (jsonErr) {
        console.error("Failed to parse error JSON:", jsonErr);
      }

      return null;
    }

    const text = await response.text();
    if (!text) {
      console.warn("Response is empty:", url);
      return null;
    }

    try {
      const data = JSON.parse(text) as T;
      return data;
    } catch (jsonErr) {
      console.error("Failed to parse JSON:", jsonErr);
      return null;
    }
  } catch (err) {
    console.error("General fetch error:", err);
    return null;
  }
}
