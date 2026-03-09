interface SnapCallbackResult {
  order_id: string;
  transaction_status: string;
  fraud_status?: string;
}

interface SnapOptions {
  onSuccess?: (result: SnapCallbackResult) => void;
  onPending?: (result: SnapCallbackResult) => void;
  onError?: (result: SnapCallbackResult) => void;
  onClose?: () => void;
}

interface Snap {
  pay: (token: string, options?: SnapOptions) => void;
  hide: () => void;
}

declare global {
  interface Window {
    snap: Snap;
  }
}

export {};
