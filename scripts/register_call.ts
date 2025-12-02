// Simple API test call for /register
// Usage: deno task api:register

const BASE_URL = Deno.env.get("API_BASE_URL") ?? "http://localhost:3000";

const url = `${BASE_URL}/register`;

console.log("Calling:", url);

const res = await fetch(url, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
});

const body = await res.json().catch(() => ({}));

console.log("Status:", res.status);
console.log("Body:", body);

if (res.ok) {
  console.log("\nSuccess: user registered.");
} else {
  console.error("\nError registering user.");
  Deno.exit(1);
}
