import { JSDOM } from "jsdom";

const testEnv = process.env as Record<string, string | undefined>;

testEnv.NODE_ENV ??= "test";
testEnv.DATABASE_URL ??= "postgresql://postgres:password@localhost:5432/hiring_seefluencer_test";
testEnv.NEXTAUTH_URL ??= "http://localhost:3000";
testEnv.NEXTAUTH_SECRET ??= "test-nextauth-secret";
testEnv.MIDTRANS_SERVER_KEY ??= "test-midtrans-server-key";
testEnv.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ??= "test-midtrans-client-key";

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
