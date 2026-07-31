import http from "node:http";

export interface ServerOptions {
  port: number;
  host: string;
}

export function createServer(options: ServerOptions): http.Server {
  const server = http.createServer((req, res) => {
    // Security check: loopback request verification
    const remoteAddress = req.socket.remoteAddress;
    if (remoteAddress !== "127.0.0.1" && remoteAddress !== "::1" && remoteAddress !== "::ffff:127.0.0.1") {
      res.writeHead(403, { "Content-Type": "text/plain" });
      res.end("Forbidden: wc-view loopback access only");
      return;
    }

    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end("<!DOCTYPE html><html><head><title>wc-view</title></head><body><h1>wc-view Canvas</h1></body></html>");
  });

  return server;
}
