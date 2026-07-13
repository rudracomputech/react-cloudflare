import { EmbeddedCheckoutProvider, EmbeddedCheckout } from "@stripe/react-stripe-js";
import { getStripe, getStripeEnvironment } from "@/lib/stripe";
import { createOrderCheckoutSession } from "@/lib/payments.functions";

interface Props {
  orderId: string;
  priceId: string;
  returnUrl: string;
  onClose: () => void;
}

export function StripeCheckoutModal({ orderId, priceId, returnUrl, onClose }: Props) {
  const fetchClientSecret = async (): Promise<string> => {
    const secret = await createOrderCheckoutSession({
      data: { orderId, priceId, returnUrl, environment: getStripeEnvironment() },
    });
    if (!secret) throw new Error("No client secret returned");
    return secret;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-black/60 p-4 pt-8">
      <div className="w-full max-w-3xl rounded-sm border border-border bg-background shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Secure checkout</span>
          <button onClick={onClose} className="text-xs text-muted-foreground hover:text-foreground">Close ✕</button>
        </div>
        <div id="checkout" className="p-2">
          <EmbeddedCheckoutProvider stripe={getStripe()} options={{ fetchClientSecret }}>
            <EmbeddedCheckout />
          </EmbeddedCheckoutProvider>
        </div>
      </div>
    </div>
  );
}