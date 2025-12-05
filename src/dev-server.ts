import app from "./server.js";

const PORT = Number(process.env.PORT ?? 3000);

app.listen(PORT, () => {
  // Keep the message minimal and actionable
  // eslint-disable-next-line no-console
  console.log(`PharmaScan-API (dev) listening on http://localhost:${PORT}`);
});
