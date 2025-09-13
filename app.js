import { serve } from "bun";
import puppeteer from "puppeteer";

const sizes = {
  phone: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  pc: { width: 1920, height: 1080 },
};

serve({
  port: 5000,
  async fetch(req) {
    try {
      const url = new URL(req.url).searchParams.get("url");
      const sizeParam = new URL(req.url).searchParams.get("size") || "pc";

      if (!url) {
        return new Response(JSON.stringify({ error: "Provide ?url=" }), { status: 400 });
      }

      const viewport = sizes[sizeParam.toLowerCase()] || sizes.pc;

      const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
      const page = await browser.newPage();

      await page.setViewport(viewport);
      await page.goto(url, { waitUntil: "networkidle2" });

      const buffer = await page.screenshot();
      await browser.close();

      return new Response(buffer, { headers: { "Content-Type": "image/png" } });

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
  },
});
