import { NextRequest, NextResponse } from 'next/server';
import { getOrderById, updateOrder } from '@/lib/database';

// Mock AI analysis (replace with real OpenAI API in production)
async function analyzeDispute(agreementSummary: string, cancellationReason: string) {
    // For now, use a simple rule-based mock
    // In production, call OpenAI API
    
    const mockOpenAICall = async () => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const agreementLower = agreementSummary.toLowerCase();
        const reasonLower = cancellationReason.toLowerCase();
        
        // Extract meaningful words from agreement (nouns, adjectives, colors, sizes, etc.)
        const agreementWords = extractKeyTerms(agreementLower);
        const reasonWords = extractKeyTerms(reasonLower);
        
        // Check if buyer is complaining about something mentioned in the agreement
        const complaintAboutAgreedTerm = reasonWords.some(word => 
            agreementWords.includes(word) && word.length > 3 // ignore short words
        );
        
        // Check for explicit buyer remorse phrases
        const buyerRemorsePatterns = [
            'changed mind', 'change my mind', 'don\'t want', 'do not want',
            'too expensive', 'too much', 'found cheaper', 'no longer need'
        ];
        const isBuyerRemorse = buyerRemorsePatterns.some(pattern => 
            reasonLower.includes(pattern)
        );
        
        // Check for legitimate quality issues
        const qualityIssues = [
            'broken', 'damaged', 'defective', 'not working', 'doesn\'t work',
            'wrong item', 'different item', 'not what i ordered', 'fake', 'counterfeit'
        ];
        const hasQualityIssue = qualityIssues.some(issue => 
            reasonLower.includes(issue)
        );
        
        // Check if agreement acknowledges defects/issues
        const agreementHasDisclaimer = agreementLower.match(/\b(as-is|as is|may have|might have|could have|defect|flaw|scratch|dent|crack|used|second-hand)\b/);
        
        let decision: 'REFUND_BUYER' | 'PAY_SELLER';
        let explanation: string;
        
        // Decision tree
        if (isBuyerRemorse) {
            decision = 'PAY_SELLER';
            explanation = 'Buyer remorse is not a valid reason for cancellation. The seller fulfilled their obligation as agreed.';
        } else if (complaintAboutAgreedTerm && !hasQualityIssue) {
            // Buyer is complaining about something that was clearly stated in agreement
            decision = 'PAY_SELLER';
            explanation = `The buyer's complaint references terms that were explicitly mentioned in the agreement ("${reasonWords.find(w => agreementWords.includes(w) && w.length > 3)}"). The buyer was informed about this aspect before purchase.`;
        } else if (hasQualityIssue && agreementHasDisclaimer) {
            // Quality issue but agreement says "as-is" or similar
            decision = 'PAY_SELLER';
            explanation = 'While the buyer reports a quality issue, the agreement included disclaimers about the item\'s condition. The buyer accepted these terms.';
        } else if (hasQualityIssue && !agreementHasDisclaimer) {
            // Legitimate quality issue not mentioned
            decision = 'REFUND_BUYER';
            explanation = 'The buyer reports a legitimate quality issue that was not disclosed in the agreement. Refund is warranted.';
        } else if (complaintAboutAgreedTerm && hasQualityIssue) {
            // Edge case: complaining about agreed feature but claiming it's defective
            decision = 'PAY_SELLER';
            explanation = 'The buyer\'s complaint involves an aspect that was clearly stated in the agreement. Without evidence of actual defect beyond what was disclosed, the seller should be paid.';
        } else {
            // Ambiguous - but if complaint mentions agreement terms, favor seller
            if (complaintAboutAgreedTerm) {
                decision = 'PAY_SELLER';
                explanation = 'The complaint references aspects mentioned in the agreement. The buyer was informed of these details.';
            } else {
                decision = 'REFUND_BUYER';
                explanation = 'The complaint describes issues not mentioned in the agreement. Favor the buyer in this ambiguous case.';
            }
        }
        
        return { decision, explanation };
    };
    
    return await mockOpenAICall();
}

// Helper function to extract meaningful terms
function extractKeyTerms(text: string): string[] {
    // Remove common words and extract meaningful terms
    const commonWords = new Set([
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
        'of', 'with', 'is', 'was', 'are', 'were', 'be', 'been', 'being',
        'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
        'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these',
        'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'my', 'your',
        'his', 'her', 'its', 'our', 'their', 'me', 'him', 'them', 'us',
        'not', 'no', 'yes', 'very', 'too', 'so', 'just', 'like', 'fact',
        'about', 'dont', 'doesn', 'isn', 'because', 'want'
    ]);
    
    // Split into words, remove punctuation, filter common words
    return text
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 0 && !commonWords.has(word));
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
        
        // Check if order has been picked up yet
        const hasBeenPickedUp = order.status === 'PICKED_UP' || 
                               order.status === 'IN_TRANSIT' || 
                               order.status === 'DELIVERED';
        
        // Special handling: If dispute is invalid (PAY_SELLER) and order hasn't been picked up
        // Allow delivery to continue but mark dispute as resolved in seller's favor
        if (decision === 'PAY_SELLER' && !hasBeenPickedUp) {
            console.log('✅ Invalid cancellation before pickup - delivery will continue');
            
            // Update order: Keep status as PAID (or current status), but resolve dispute
            await updateOrder(orderId, {
                disputeResolution: {
                    aiDecision: decision,
                    aiExplanation: explanation + ' Delivery will proceed as the cancellation was made before pickup.',
                    resolvedAt: Date.now()
                },
                // Remove DISPUTED status, revert to appropriate status
                status: order.status === 'DISPUTED' ? 'PAID' : order.status
            });
            
            return NextResponse.json({ 
                success: true,
                decision,
                explanation: explanation + ' Delivery will continue.',
                deliveryContinues: true,
                message: 'Invalid cancellation detected. Delivery will proceed and seller will be paid upon completion.'
            });
        }
        
        // If dispute is valid (REFUND_BUYER) or order already picked up
        // Standard dispute resolution
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
            deliveryContinues: false,
            message: hasBeenPickedUp 
                ? 'Dispute analyzed. Resolution will be applied after delivery confirmation.'
                : 'Dispute analyzed and resolved'
        });
        
    } catch (error: any) {
        console.error('Analyze dispute error:', error);
        return NextResponse.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
}
