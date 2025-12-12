import { NextRequest, NextResponse } from 'next/server';
import { getOrderById, updateOrder } from '@/lib/database';

// Mock AI analysis (replace with real OpenAI API in production)
async function analyzeDispute(agreementSummary: string, cancellationReason: string) {
    // For now, use a simple rule-based mock
    // In production, call OpenAI API
    
    const mockOpenAICall = async () => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Simple logic: check if reason keywords appear in agreement
        const agreementLower = agreementSummary.toLowerCase();
        const reasonLower = cancellationReason.toLowerCase();
        
        // Check for common valid reasons
        const validReasons = ['broken', 'damaged', 'wrong item', 'not as described', 'defective'];
        const invalidReasons = ['changed mind', 'don\'t want', 'too expensive'];
        
        let hasValidReason = validReasons.some(keyword => reasonLower.includes(keyword));
        let hasInvalidReason = invalidReasons.some(keyword => reasonLower.includes(keyword));
        
        // Check if the issue was mentioned in agreement (as-is, defects acknowledged, etc.)
        const disclaimers = ['as-is', 'as is', 'may have', 'defect', 'crack', 'scratch'];
        const issueInAgreement = disclaimers.some(keyword => agreementLower.includes(keyword));
        
        let decision: 'REFUND_BUYER' | 'PAY_SELLER';
        let explanation: string;
        
        if (hasInvalidReason) {
            decision = 'PAY_SELLER';
            explanation = 'The cancellation reason (buyer remorse) is not valid. The seller should be paid.';
        } else if (hasValidReason && issueInAgreement) {
            decision = 'PAY_SELLER';
            explanation = 'The buyer\'s concern was mentioned in the agreement summary. The buyer was aware of this issue before purchasing.';
        } else if (hasValidReason && !issueInAgreement) {
            decision = 'REFUND_BUYER';
            explanation = 'The buyer\'s concern was not mentioned in the agreement and represents a legitimate issue. Refund the buyer.';
        } else {
            // Default: favor buyer for ambiguous cases
            decision = 'REFUND_BUYER';
            explanation = 'The cancellation reason is ambiguous but seems to indicate an issue not mentioned in the agreement.';
        }
        
        return { decision, explanation };
    };
    
    return await mockOpenAICall();
}

// Real OpenAI implementation (commented out - uncomment when you have API key)
/*
async function analyzeDisputeWithOpenAI(agreementSummary: string, cancellationReason: string) {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
        throw new Error('OpenAI API key not configured');
    }
    
    const prompt = `You are a fair dispute resolution AI. Analyze this order cancellation request.

AGREEMENT SUMMARY:
${agreementSummary}

BUYER'S CANCELLATION REASON:
${cancellationReason}

INSTRUCTIONS:
1. Determine if the buyer's reason contradicts or was mentioned in the agreement
2. Respond with JSON only: {"decision": "REFUND_BUYER" or "PAY_SELLER", "explanation": "brief explanation"}
3. REFUND_BUYER = buyer should get refund (valid concern not in agreement)
4. PAY_SELLER = seller should get paid (buyer was aware or invalid reason)

Remember: If the issue was acknowledged in the agreement, the buyer knew about it and should not get a refund.`;
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'gpt-4-turbo-preview',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.3,
            response_format: { type: 'json_object' }
        })
    });
    
    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);
    
    return {
        decision: result.decision as 'REFUND_BUYER' | 'PAY_SELLER',
        explanation: result.explanation
    };
}
*/

export async function POST(req: NextRequest) {
    try {
        const { orderId } = await req.json();
        
        if (!orderId) {
            return NextResponse.json({ 
                success: false, 
                error: 'Order ID is required' 
            }, { status: 400 });
        }
        
        const order = await getOrderById(orderId);
        
        if (!order) {
            return NextResponse.json({ 
                success: false, 
                error: 'Order not found' 
            }, { status: 404 });
        }
        
        if (!order.cancellationRequested || !order.cancellationReason) {
            return NextResponse.json({ 
                success: false, 
                error: 'No cancellation request found' 
            }, { status: 400 });
        }
        
        // Analyze the dispute with AI
        console.log('🤖 AI analyzing dispute...');
        const { decision, explanation } = await analyzeDispute(
            order.agreementSummary,
            order.cancellationReason
        );
        
        console.log('🤖 AI Decision:', decision);
        console.log('   Explanation:', explanation);
        
        // Update order with AI decision
        await updateOrder(orderId, {
            disputeResolution: {
                aiDecision: decision,
                aiExplanation: explanation,
                resolvedAt: Date.now()
            }
        });
        
        return NextResponse.json({ 
            success: true,
            decision,
            explanation,
            message: 'Dispute analyzed and resolved'
        });
        
    } catch (error: any) {
        console.error('Analyze dispute error:', error);
        return NextResponse.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
}
