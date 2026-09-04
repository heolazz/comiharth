export default {
  async fetch(request, env, ctx) {
    // 1. Handle CORS Preflight (OPTIONS)
    // Browser selalu mengirim request OPTIONS sebelum GET/POST jika beda domain.
    // Kita langsung jawab OK agar tidak perlu fetch ke server target (Hemat resource!)
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*", // Disarankan: Ganti dengan URL website mu misal "https://comiharth.vercel.app"
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "*",
          "Access-Control-Max-Age": "86400", // Cache hasil OPTIONS ini selama 24 jam di browser pengguna
        }
      });
    }

    // Tangkap URL dari parameter ?url=
    const url = new URL(request.url);
    const targetUrl = url.searchParams.get("url");

    if (!targetUrl) {
      return new Response("Missing url parameter. Usage: /?url=https://be.komikcast.cc/...", { status: 400 });
    }

    // 2. KEAMANAN: Batasi Target Domain (Mencegah Open Proxy)
    // Penyebab utama limit habis adalah karena proxy kamu bisa dipakai untuk membuka web APAPUN di dunia.
    // Bot dari luar negeri menggunakan proxy ini untuk scraping web lain.
    // Solusi: Kita batasi hanya domain sumber komik yang kamu pakai yang diizinkan.
    const allowedDomains = [
      "komikcast.cc", 
      "komikcast.vip", 
      "shinigami.id", 
      "mangafire.to", 
      "mangadex.org",
      "ikiru" // tambahkan kata kunci domain lain jika ada
    ];
    
    try {
      const targetUrlObj = new URL(targetUrl);
      const isTargetAllowed = allowedDomains.some(domain => targetUrlObj.hostname.includes(domain));
      
      if (!isTargetAllowed) {
        return new Response("Forbidden: Target domain not allowed to be proxied.", { status: 403 });
      }
    } catch(e) {
      return new Response("Invalid target URL", { status: 400 });
    }

    // Hindari proxy loop
    if (targetUrl.includes(url.hostname)) {
      return new Response("Proxy loop detected", { status: 400 });
    }

    // 3. CACHING: Simpan hasil fetch di Cloudflare Cache
    // Jika ada banyak user (atau bot) me-request chapter komik yang sama, Worker akan mengambil dari Cache,
    // bukannya melakukan request baru ke target website. Ini jauh lebih cepat.
    const cacheKey = new Request(url.toString(), request);
    const cache = caches.default;
    let response = await cache.match(cacheKey);

    if (!response) {
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
        modifiedRequest.headers.set("Accept", "application/json, image/*, text/plain, */*");
        modifiedRequest.headers.set("Accept-Language", "en-US,en;q=0.9,id;q=0.8");

        // Fetch data dari server target
        response = await fetch(modifiedRequest);
        
        // Buat response baru agar header bisa dimodifikasi
        response = new Response(response.body, response);
        
        // Tambahkan header CORS
        response.headers.set("Access-Control-Allow-Origin", "*");
        response.headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        
        // Cache response jika sukses (status 200) selama 2 jam (7200 detik)
        if (response.status === 200) {
          response.headers.set("Cache-Control", "s-maxage=7200");
          // Gunakan ctx.waitUntil agar proses simpan cache berjalan di background tanpa melambatkan user
          ctx.waitUntil(cache.put(cacheKey, response.clone()));
        }

      } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { 
          status: 500,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
        });
      }
    } else {
      // Jika dari cache, kita perlu membuat response baru karena header cache bersifat immutable
      response = new Response(response.body, response);
      response.headers.set("Access-Control-Allow-Origin", "*");
      response.headers.set("X-Proxy-Cache", "HIT");
    }

    return response;
  },
};
