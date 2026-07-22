import type { NextConfig } from "next";
import os from "os";
import path from "path";
import { fileURLToPath } from "url";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

/**
 * 同一 LAN 上のスマホなどから `next dev` にアクセスするためのホスト許可リスト。
 * IP は環境で変わるため、起動時に IPv4 の非ループバックアドレスを集める。
 *
 * @returns 許可するホスト名（IP）一覧（`allowedDevOrigins` 向け）
 */
function getLanDevHosts(): string[] {
  const hosts = new Set<string>();

  for (const nets of Object.values(os.networkInterfaces())) {
    if (!nets) continue;

    for (const net of nets) {
      const family = String(net.family);
      if ((family === "IPv4" || family === "4") && !net.internal) {
        hosts.add(net.address);
      }
    }
  }

  return [...hosts];
}

const nextConfig: NextConfig = {
  // スマホ実機確認（https://192.168.x.x:3000）で HMR / バンドルがブロックされないようにする
  allowedDevOrigins: getLanDevHosts(),
  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;
