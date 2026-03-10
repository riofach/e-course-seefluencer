import { JSDOM } from "jsdom";

process.env.NODE_ENV ??= "test";
process.env.DATABASE_URL ??= "postgresql://postgres:password@localhost:5432/hiring_seefluencer_test";
process.env.NEXTAUTH_URL ??= "http://localhost:3000";
process.env.NEXTAUTH_SECRET ??= "test-nextauth-secret";
process.env.MIDTRANS_SERVER_KEY ??= "test-midtrans-server-key";
process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ??= "test-midtrans-client-key";

const dom = new JSDOM("<!doctype html><html><body></body></html>");

Object.assign(globalThis, {
  window: dom.window,
  document: dom.window.document,
  navigator: dom.window.navigator,
});

class ResizeObserverMock {
  observe() {
    return undefined;
  }

  unobserve() {
    return undefined;
  }

  disconnect() {
    return undefined;
  }
}

Object.assign(globalThis, {
  ResizeObserver: ResizeObserverMock,
});
