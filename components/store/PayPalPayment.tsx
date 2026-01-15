'use client';

import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useEffect, useState, useMemo, memo } from "react";
import { Loader2 } from "lucide-react";

interface PayPalPaymentProps {
    amount: number;
    currency: string;
    onSuccess: (details: any, orderData: any) => void;
    onError: (err: any) => void;
}

// function PayPalPayment... (no export)

function PayPalPayment({ amount, currency, onSuccess, onError }: PayPalPaymentProps) {
    const [isLoaded, setIsLoaded] = useState(false);

    const initialOptions = useMemo(() => ({
        clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "",
        currency: currency,
        intent: "capture",
    }), [currency]);

    if (!initialOptions.clientId) {
        return <div className="text-red-500">PayPal Client ID is missing configuration.</div>;
    }

    return (
        <div style={{ width: '100%', minHeight: '150px' }}>
            <PayPalScriptProvider options={initialOptions}>
                <PayPalButtons
                    style={{ layout: "vertical", shape: "pill" }}
                    createOrder={(data, actions) => {
                        return actions.order.create({
                            intent: "CAPTURE",
                            purchase_units: [
                                {
                                    amount: {
                                        currency_code: currency,
                                        value: (Number(amount) || 0).toFixed(2),
                                    },
                                },
                            ],
                        });
                    }}
                    onApprove={async (data, actions) => {
                        if (actions.order) {
                            try {
                                const details = await actions.order.capture();
                                onSuccess(details, data);
                            } catch (error) {
                                onError(error);
                            }
                        }
                    }}
                    onError={(err) => {
                        console.error('PayPal Error:', err);
                        onError(err);
                    }}
                />
            </PayPalScriptProvider>
        </div>
    );
}

export default memo(PayPalPayment);
