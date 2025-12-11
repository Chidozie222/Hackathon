import { Paystack } from 'paystack-sdk';

// REPLACE WITH YOUR ENV VARIABLE
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || 'sk_test_0000000000000000000000000000000000000000'; // Dummy Key

const paystack = new Paystack(PAYSTACK_SECRET_KEY);

export async function initializePayment(email: string, amount: string) {
    // Amount in Paystack is in kobo (lowest currency unit). 
    // Assuming 1 ETH = 5,000,000 NGN for hackathon mock purposes, or just treating amount as USD/NGN directly.
    // Let's assume the input 'amount' is in ETH, and we fix a rate of 1 ETH = 1000 USD (for simplicity) * 1500 NGN/USD = 1,500,000 NGN?
    // OR simmpler: Just treat the number as NGN for the test. 
    // Let's treat it as "Units". 1 Unit = 100 Paystack base units (Kobo/Cents).
    
    // Hack: We want the "amount" passed to contract to be the same, but Paystack needs fiat.
    // Let's just say 1 "ETH" on UI = 1000 NGN on Paystack for testing.
    
    const amountInKobo = parseFloat(amount) * 1000 * 100; // 1.0 -> 1000.00 -> 100000 kobo

    const response = await paystack.transaction.initialize({
        email,
        amount: amountInKobo.toString(),
        callback_url: 'http://localhost:3000/api/payment/verify', // We will handle this in backend
        metadata: {
            custom_fields: [
                { display_name: "Original Amount ETH", variable_name: "eth_amount", value: amount }
            ]
        }
    });

    return response;
}

export async function verifyPayment(reference: string) {
    const response = await paystack.transaction.verify(reference);
    return response;
}
