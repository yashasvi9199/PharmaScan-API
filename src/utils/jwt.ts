// src/utils/jwt.ts
// JWT utilities

export function signToken(payload: object): string {
  return "placeholder-jwt-token";
}

export function verifyToken(token: string): object | null {
  return token === "placeholder-jwt-token" ? { id: "1" } : null;
}
