import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import razorpayConfigHandler from "./api/razorpay-config.js";
import createOrderHandler from "./api/create-order.js";
import verifyPaymentHandler from "./api/verify-payment.js";

function razorpayApiPlugin() {
  return {
    name: "razorpay-api-routes",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url ? req.url.split("?")[0] : "";
        if (url === "/api/razorpay-config") {
          try {
            await razorpayConfigHandler(req, res);
          } catch (err) {
            console.error("API error in /api/razorpay-config:", err);
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: err.message }));
          }
          return;
        }
        if (url === "/api/create-order") {
          try {
            await createOrderHandler(req, res);
          } catch (err) {
            console.error("API error in /api/create-order:", err);
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: err.message }));
          }
          return;
        }
        if (url === "/api/verify-payment") {
          try {
            await verifyPaymentHandler(req, res);
          } catch (err) {
            console.error("API error in /api/verify-payment:", err);
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: err.message }));
          }
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  Object.assign(process.env, env);

  return {
    plugins: [react(), tailwindcss(), razorpayApiPlugin()],
  };
});