import { JSDOM } from "jsdom";

const dom = new JSDOM("<!doctype html><html><body></body></html>");
// @ts-expect-error - jsdom window types are not fully compatible with globalThis
global.window = dom.window;
// @ts-expect-error - jsdom window types are not fully compatible with globalThis
global.document = dom.window.document as unknown as Document;
// @ts-expect-error - jsdom window types are not fully compatible with globalThis
global.navigator = dom.window.navigator;
