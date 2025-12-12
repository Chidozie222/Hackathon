import { Paystack } from 'paystack-sdk';

// REPLACE WITH YOUR ENV VARIABLE
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || '';
if (!process.env.PAYSTACK_SECRET_KEY) console.warn("Missing PAYSTACK_SECRET_KEY env var");

const paystack = new Paystack(PAYSTACK_SECRET_KEY);

export async function initializePayment(email: string, amount: string, orderId?: string) {
    const amountInKobo = parseFloat(amount) * 100; // Direct NGN conversion

    const response = await paystack.transaction.initialize({
        email,
        amount: amountInKobo.toString(),
        callback_url: 'http://localhost:3000/api/payment/verify',
        metadata: {
            custom_fields: [
                ...(orderId ? [{ display_name: "Order ID", variable_name: "order_id", value: orderId }] : []),
                { display_name: "Original Amount", variable_name: "eth_amount", value: amount }
            ]
        }
    });

    return response;
}

export async function verifyPayment(reference: string) {
    const response = await paystack.transaction.verify(reference);
    return response;
}
