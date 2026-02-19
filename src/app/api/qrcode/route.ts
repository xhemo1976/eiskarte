import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { networkInterfaces } from "os";

function getLocalIP(): string {
  const nets = networkInterfaces();
  const preferred: string[] = [];
  const fallback: string[] = [];

  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === "IPv4" && !net.internal) {
        const isVirtual = name.toLowerCase().includes("vethernet") ||
                          name.toLowerCase().includes("virtual") ||
                          name.toLowerCase().includes("docker") ||
                          net.address.startsWith("172.");
        if (isVirtual) {
          fallback.push(net.address);
        } else {
          preferred.push(net.address);
        }
      }
    }
  }
  return preferred[0] || fallback[0] || "localhost";
}

export async function GET(request: NextRequest) {
  let defaultUrl: string;

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    defaultUrl = `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  } else {
    const ip = getLocalIP();
    const port = request.nextUrl.port || "3000";
    defaultUrl = `http://${ip}:${port}`;
  }

  const url = request.nextUrl.searchParams.get("url") || defaultUrl;

  const qrDataUrl = await QRCode.toDataURL(url, {
    width: 400,
    margin: 2,
    color: {
      dark: "#000000",
      light: "#ffffff",
    },
  });

  return NextResponse.json({ qrCode: qrDataUrl, url });
}
