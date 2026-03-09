import assert from "node:assert/strict";

import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { afterEach, beforeEach, describe, test, vi } from "vitest";

import type { ActionResponse } from "~/types";
import type { Plan } from "~/server/queries/plans";

import { PricingPageClient } from "./pricing-page-client";

type SnapCallbackPayload = {
  order_id: string;
  transaction_status: string;
};

type SnapPayOptions = {
  onSuccess?: (result: SnapCallbackPayload) => void;
  onPending?: (result: SnapCallbackPayload) => void;
  onError?: (result: SnapCallbackPayload) => void;
  onClose?: () => void;
};

const {
  mockInitiateMidtransCheckout,
  mockToast,
} = vi.hoisted(() => ({
  mockInitiateMidtransCheckout: vi.fn<
    (planId: number) => Promise<ActionResponse<{ snap_token: string }>>
  >(),
  mockToast: Object.assign(vi.fn(), {
    error: vi.fn(),
    success: vi.fn(),
  }),
}));

vi.mock("~/server/actions/payments/initiate-checkout", () => ({
  initiateMidtransCheckout: (planId: number) =>
    mockInitiateMidtransCheckout(planId),
}));

vi.mock("sonner", () => ({
  toast: mockToast,
}));

const plans: Plan[] = [
  {
    id: 1,
    name: "Pro Monthly",
    price: 150000,
    durationDays: 30,
    createdAt: new Date("2026-03-01T00:00:00.000Z"),
  },
];

describe("PricingPageClient", () => {
  beforeEach(() => {
    mockInitiateMidtransCheckout.mockReset();
    mockToast.mockReset();
    mockToast.error.mockReset();
    mockToast.success.mockReset();
    window.snap = {
      pay: vi.fn(),
      hide: vi.fn(),
    };
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  function getSubscribeButton() {
    return screen.getByRole("button", { name: /^subscribe$/i });
  }

  function getSnapOptionsFromCall(mockFn: { mock: { calls: unknown[][] } }) {
    const firstCall = mockFn.mock.calls[0];

    if (!firstCall) {
      return undefined;
    }

    return firstCall[1] as SnapPayOptions | undefined;
  }

  test("disables subscribe button when user is already subscribed", () => {
    render(<PricingPageClient plans={plans} isSubscribed />);

    const button = screen.getByRole("button", { name: /current plan active/i });

    assert.equal(button.hasAttribute("disabled"), true);
  });

  test("shows error toast when checkout action returns failure", async () => {
    mockInitiateMidtransCheckout.mockResolvedValue({
      success: false,
      error: "Checkout gagal",
    });

    const user = userEvent.setup();

    render(<PricingPageClient plans={plans} isSubscribed={false} />);

    await user.click(getSubscribeButton());

    await waitFor(() => {
      assert.equal(mockToast.error.mock.calls[0]?.[0], "Checkout gagal");
    });
  });

  test("calls window.snap.pay with returned snap token", async () => {
    mockInitiateMidtransCheckout.mockResolvedValue({
      success: true,
      data: { snap_token: "snap-token-123" },
    });

    const user = userEvent.setup();
    const paySpy = vi.fn();
    window.snap.pay = paySpy;

    render(<PricingPageClient plans={plans} isSubscribed={false} />);

    await user.click(getSubscribeButton());

    await waitFor(() => {
      assert.equal(paySpy.mock.calls.length, 1);
    });

    assert.equal(paySpy.mock.calls[0]?.[0], "snap-token-123");
    const options = getSnapOptionsFromCall(paySpy);

    assert.equal(typeof options?.onSuccess, "function");
    assert.equal(typeof options?.onPending, "function");
    assert.equal(typeof options?.onError, "function");
    assert.equal(typeof options?.onClose, "function");
  });

  test("shows success toast when snap onSuccess callback runs", async () => {
    mockInitiateMidtransCheckout.mockResolvedValue({
      success: true,
      data: { snap_token: "snap-token-123" },
    });

    const user = userEvent.setup();
    let onSuccess: SnapPayOptions["onSuccess"];

    window.snap.pay = vi.fn((_token: string, options?: SnapPayOptions) => {
      onSuccess = options?.onSuccess;
    });

    render(<PricingPageClient plans={plans} isSubscribed={false} />);

    await user.click(getSubscribeButton());

    await waitFor(() => {
      assert.equal(typeof onSuccess, "function");
    });

    await act(async () => {
      onSuccess?.({
        order_id: "order-1",
        transaction_status: "settlement",
      });
    });

    assert.equal(mockToast.success.mock.calls.length, 1);
    assert.equal(
      mockToast.success.mock.calls[0]?.[0],
      "Pembayaran berhasil! Sedang mengaktifkan langgananmu…",
    );
  });

  test("shows pending toast when snap onPending callback runs", async () => {
    mockInitiateMidtransCheckout.mockResolvedValue({
      success: true,
      data: { snap_token: "snap-token-123" },
    });

    const user = userEvent.setup();
    let onPending: SnapPayOptions["onPending"];

    window.snap.pay = vi.fn((_token: string, options?: SnapPayOptions) => {
      onPending = options?.onPending;
    });

    render(<PricingPageClient plans={plans} isSubscribed={false} />);

    await user.click(getSubscribeButton());

    await waitFor(() => {
      assert.equal(typeof onPending, "function");
    });

    await act(async () => {
      onPending?.({
        order_id: "order-1",
        transaction_status: "pending",
      });
    });

    assert.equal(mockToast.mock.calls.length, 1);
    assert.equal(
      mockToast.mock.calls[0]?.[0],
      "Pembayaran sedang diproses...",
    );
  });

  test("shows snap not ready error when window.snap is undefined", async () => {
    mockInitiateMidtransCheckout.mockResolvedValue({
      success: true,
      data: { snap_token: "snap-token-123" },
    });

    const user = userEvent.setup();
    // @ts-expect-error test runtime for missing snap
    window.snap = undefined;

    render(<PricingPageClient plans={plans} isSubscribed={false} />);

    await user.click(getSubscribeButton());

    await waitFor(() => {
      assert.equal(
        mockToast.error.mock.calls[0]?.[0],
        "Midtrans Snap belum siap. Coba muat ulang halaman.",
      );
    });
  });

  test("onClose callback is silent and leaves subscribe button usable", async () => {
    mockInitiateMidtransCheckout.mockResolvedValue({
      success: true,
      data: { snap_token: "snap-token-123" },
    });

    const user = userEvent.setup();
    let onClose: (() => void) | undefined;

    window.snap.pay = vi.fn((_token: string, options?: SnapPayOptions) => {
      onClose = options?.onClose;
    });

    render(<PricingPageClient plans={plans} isSubscribed={false} />);

    const button = getSubscribeButton();
    await user.click(button);

    await waitFor(() => {
      assert.equal(typeof onClose, "function");
    });

    assert.equal(typeof onClose, "function");

    await act(async () => {
      onClose?.();
    });

    await waitFor(() => {
      assert.ok(screen.getByRole("button", { name: /subscribe/i }));
    });

    assert.equal(
      getSubscribeButton().hasAttribute("disabled"),
      false,
    );
    assert.equal(mockToast.mock.calls.length, 0);
    assert.equal(mockToast.error.mock.calls.length, 0);
    assert.equal(mockToast.success.mock.calls.length, 0);
  });
});
