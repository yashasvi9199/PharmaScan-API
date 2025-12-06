"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const server_js_1 = __importDefault(require("./server.js"));
const PORT = Number(process.env.PORT ?? 3000);
server_js_1.default.listen(PORT, () => {
    // Keep the message minimal and actionable
    // eslint-disable-next-line no-console
    console.log(`PharmaScan-API (dev) listening on http://localhost:${PORT}`);
});
