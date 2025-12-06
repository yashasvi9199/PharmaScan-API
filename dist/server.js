"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const scan_js_1 = __importDefault(require("./routes/scan.js"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
// Temp root for vercel
app.get("/", (_req, res) => {
    res.json({ status: "PharmaScan API running" });
});
// feature router
app.use("/api/scan", scan_js_1.default);
exports.default = app;
