import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";
import type { FastifyReply, FastifyRequest } from "fastify";
import { env } from "../env.js";

const cookieVersion = "v1";
const cookieAad = Buffer.from("cxsun.auth.session.v1", "utf8");
export const sessionSlotHeader = "x-cxsun-session-slot";
const sessionSlotPattern = /^[0-9a-f]{32}$/u;
const legacyCookieNames = [
  "cxsun_session",
  "cxsun_session_admin",
  "cxsun_session_sa",
  "cxsun_session_tenant",
  "__Host-cxsun_session"
] as const;

export function authCookieName(slot?: string) {
  const base = env.NODE_ENV === "production" ? "__Host-cxsun_session" : "cxsun_session";
  return slot ? `${base}_${slot}` : base;
}

export function readEncryptedSessionCookie(request: FastifyRequest) {
  const slot = selectedSessionSlot(request);
  if (request.headers[sessionSlotHeader] !== undefined && !slot) return "";
  const value = request.cookies[authCookieName(slot ?? undefined)];
  return value ? decryptSessionCookie(value) : "";
}

export function writeEncryptedSessionCookie(reply: FastifyReply, token: string) {
  if (env.AUTH_MODE === "jwt") return null;
  const slot = randomBytes(16).toString("hex");
  reply.setCookie(authCookieName(slot), encryptSessionCookie(token), {
    httpOnly: true,
    maxAge: env.AUTH_SESSION_TTL_HOURS * 60 * 60,
    path: "/",
    sameSite: "strict",
    secure: env.NODE_ENV === "production"
  });
  return slot;
}

export function clearSelectedSessionCookie(reply: FastifyReply, request: FastifyRequest) {
  const slot = selectedSessionSlot(request);
  if (slot) {
    reply.clearCookie(authCookieName(slot), {
      httpOnly: true,
      path: "/",
      sameSite: "strict",
      secure: env.NODE_ENV === "production"
    });
  } else if (request.headers[sessionSlotHeader] === undefined) {
    clearAllSessionCookies(reply);
  }
}

export function clearAllSessionCookies(reply: FastifyReply) {
  for (const name of legacyCookieNames) {
    reply.clearCookie(name, {
      httpOnly: true,
      path: "/",
      sameSite: "strict",
      secure: name.startsWith("__Host-") || env.NODE_ENV === "production"
    });
  }
}

function selectedSessionSlot(request: FastifyRequest): string | null {
  const value = request.headers[sessionSlotHeader];
  return typeof value === "string" && sessionSlotPattern.test(value) ? value : null;
}

export function encryptSessionCookie(token: string) {
  const nonce = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", cookieKey(), nonce);
  cipher.setAAD(cookieAad);
  const ciphertext = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [
    cookieVersion,
    nonce.toString("base64url"),
    ciphertext.toString("base64url"),
    tag.toString("base64url")
  ].join(".");
}

export function decryptSessionCookie(value: string) {
  const [version, nonceValue, ciphertextValue, tagValue] = value.split(".");
  if (version !== cookieVersion || !nonceValue || !ciphertextValue || !tagValue) {
    return "";
  }
  try {
    const decipher = createDecipheriv(
      "aes-256-gcm",
      cookieKey(),
      Buffer.from(nonceValue, "base64url")
    );
    decipher.setAAD(cookieAad);
    decipher.setAuthTag(Buffer.from(tagValue, "base64url"));
    return Buffer.concat([
      decipher.update(Buffer.from(ciphertextValue, "base64url")),
      decipher.final()
    ]).toString("utf8");
  } catch {
    return "";
  }
}

function cookieKey() {
  return createHash("sha256").update(`cxsun:auth-cookie:${env.JWT_SECRET}`, "utf8").digest();
}
