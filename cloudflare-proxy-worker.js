export default {
  async fetch(request, env) {
    // Tangkap URL dari parameter ?url=
    const url = new URL(request.url);
    const targetUrl = url.searchParams.get("url");

    if (!targetUrl) {
      return new Response("Missing url parameter. Usage: /?url=https://be.komikcast.cc/...", { status: 400 });
    }

    // Hindari proxy loop
    if (targetUrl.includes(url.hostname)) {
      return new Response("Proxy loop detected", { status: 400 });
    }

    try {
      // Siapkan request ke target
      const modifiedRequest = new Request(targetUrl, {
        method: request.method,
        headers: new Headers(request.headers)
      });

      // Hapus header yang bisa memicu blokir atau error CORS
      modifiedRequest.headers.delete("Origin");
      modifiedRequest.headers.delete("Referer");
      
      // Tambahkan header standar untuk memalsukan request seperti browser biasa
      modifiedRequest.headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
      modifiedRequest.headers.set("Accept", "application/json, text/plain, */*");
      modifiedRequest.headers.set("Accept-Language", "en-US,en;q=0.9,id;q=0.8");

      // Fetch data dari server target
      const response = await fetch(modifiedRequest);
      
      // Copy response asli untuk memodifikasi headers (CORS)
      const newResponse = new Response(response.body, response);
      
      // Tambahkan header CORS agar bisa diakses dari web/aplikasi Next.js kita
      newResponse.headers.set("Access-Control-Allow-Origin", "*");
      newResponse.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
      newResponse.headers.set("Access-Control-Allow-Headers", "*");
      
      return newResponse;

    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { 
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }
  },
};
