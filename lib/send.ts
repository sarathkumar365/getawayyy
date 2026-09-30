/**
 * Where her answers go.
 *
 * The number comes from NEXT_PUBLIC_SEND_TO (set in Vercel and .env.local), not
 * from the repo, which is public. It still ships in the page — the buttons are
 * plain links and need it — so this keeps it out of git, not out of the site.
 */
const TO = (process.env.NEXT_PUBLIC_SEND_TO ?? "").replace(/\D/g, "");

export const canSendDirect = TO.length >= 10;

export const sendText = (url: string): string =>
  `Okay, here are my answers! ${url}`;

/** wa.me opens the chat with the message typed in; she only taps send. */
export const whatsappHref = (text: string): string =>
  `https://wa.me/${TO}?text=${encodeURIComponent(text)}`;

/**
 * Apple's Messages reads the body after `&`; Android's SMS apps after `?`.
 * Getting it wrong opens the right chat with an empty message.
 */
export const smsHref = (text: string, apple: boolean): string =>
  `sms:+${TO}${apple ? "&" : "?"}body=${encodeURIComponent(text)}`;

export const isApple = (): boolean =>
  typeof navigator !== "undefined" && /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent);
