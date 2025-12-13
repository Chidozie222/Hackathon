import { NextRequest, NextResponse } from 'next/server';
import { getOrderById, updateOrder } from '@/lib/database';
import OpenAI from 'openai';

// OpenAI client - will be null if API key not provided
const openaiClient = process.env.OPENAI_API_KEY 
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null;

// Real OpenAI API dispute analysis
async function analyzeDisputeWithOpenAI(agreementSummary: string, cancellationReason: string) {
    if (!openaiClient) {
        console.log('⚠️ OpenAI API key not found, using mock analysis');
        return analyzeDisputeMock(agreementSummary, cancellationReason);
    }

    try {
        console.log('🤖 Using OpenAI GPT-4 for dispute analysis...');
        
        const completion = await openaiClient.chat.completions.create({
            model: "gpt-4",
            messages: [
                {
                    role: "system",
                    content: `You are a fair and impartial dispute resolution AI for an e-commerce escrow platform. 
Your task is to analyze order cancellation disputes by comparing the original agreement with the buyer's cancellation reason.

Decision Rules:
1. If the buyer complains about something explicitly mentioned in the agreement → PAY_SELLER (invalid complaint)
2. If the buyer reports a legitimate quality issue not disclosed → REFUND_BUYER (valid complaint)
3. If the buyer shows remorse (changed mind, no longer want) → PAY_SELLER (buyer remorse)
4. If the agreement says "as-is" or has disclaimers → PAY_SELLER (buyer accepted terms)

Return ONLY valid JSON in this exact format:
{"decision": "PAY_SELLER" or "REFUND_BUYER", "explanation": "clear reason for decision"}`
                },
                {
                    role: "user",
                    content: `Analyze this dispute:

ORIGINAL AGREEMENT SUMMARY:
"${agreementSummary}"

BUYER'S CANCELLATION REASON:
"${cancellationReason}"

Return JSON decision.`
                }
            ],
            temperature: 0.3,
            max_tokens: 300,
            response_format: { type: "json_object" }
        });

        const content = completion.choices[0].message.content;
        if (!content) {
            throw new Error('No response from OpenAI');
        }

        const result = JSON.parse(content);
        
        // Validate response format
        if (!result.decision || !result.explanation) {
            throw new Error('Invalid response format from OpenAI');
        }

        if (result.decision !== 'PAY_SELLER' && result.decision !== 'REFUND_BUYER') {
            throw new Error('Invalid decision from OpenAI');
        }

        console.log('✅ OpenAI analysis complete:', result.decision);
        
        return {
            decision: result.decision as 'REFUND_BUYER' | 'PAY_SELLER',
            explanation: result.explanation
        };

    } catch (error: any) {
        console.error('❌ OpenAI API error:', error.message);
        console.log('⚠️ Falling back to mock analysis');
        
        // Fallback to mock if OpenAI fails
        return analyzeDisputeMock(agreementSummary, cancellationReason);
    }
}

// Mock AI analysis (fallback when OpenAI unavailable)
async function analyzeDisputeMock(agreementSummary: string, cancellationReason: string) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log('🔧 Using mock dispute analysis');

        const agreementLower = agreementSummary.toLowerCase();
        const reasonLower = cancellationReason.toLowerCase();
        
        // Extract meaningful words from agreement (nouns, adjectives, colors, sizes, etc.)
        const agreementWords = extractKeyTerms(agreementLower);
        const reasonWords = extractKeyTerms(reasonLower);
        
        // Check for explicit buyer remorse phrases
        const buyerRemorsePatterns = [
            'changed mind', 'change my mind', 'don\'t want', 'do not want',
            'too expensive', 'too much', 'found cheaper', 'no longer need',
            'dont need'
        ];
        const isBuyerRemorse = buyerRemorsePatterns.some(pattern => 
            reasonLower.includes(pattern)
        );
        
        // Check for legitimate quality issues
        const qualityIssues = [
            'broken', 'damaged', 'defective', 'not working', 'doesn\'t work',
            'wrong item', 'different item', 'not what i ordered', 'fake', 'counterfeit',
            'doesnt work', 'cracked', 'faulty'
        ];
        const hasQualityIssue = qualityIssues.some(issue => 
            reasonLower.includes(issue)
        );
        
        // Check if agreement acknowledges defects/issues
        const agreementHasDisclaimer = agreementLower.match(/\b(as-is|as is|may have|might have|could have|defect|flaw|scratch|dent|crack|used|second-hand)\b/);
        
        // IMPROVED: Check if SPECIFIC complaint feature was mentioned in agreement
        // Not just any word overlap
        const specificComplaintInAgreement = (() => {
            // Define specific feature categories
            const colorWords = ['color', 'colour', 'red', 'blue', 'green', 'black', 'white', 'yellow', 'orange', 'purple', 'pink', 'brown', 'gray', 'grey'];
            const sizeWords = ['size', 'small', 'medium', 'large', 'xl', 'xxl', 'xs'];
            const conditionWords = ['new', 'used', 'refurbished', 'brand'];
            
            // Check for color-specific complaints
            const complaintColors = reasonWords.filter(w => colorWords.includes(w));
            const agreementColors = agreementWords.filter(w => colorWords.includes(w));
            
            if (complaintColors.length > 0 && agreementColors.length > 0) {
                // Check if buyer is complaining about a color that WAS mentioned
                const sameColor = complaintColors.some(c => agreementColors.includes(c));
                if (sameColor) {
                    return true; // Buyer complaining about disclosed color
                }
            }
            
            // Check for size-specific complaints
            const complaintSizes = reasonWords.filter(w => sizeWords.includes(w));
            const agreementSizes = agreementWords.filter(w => sizeWords.includes(w));
            
            if (complaintSizes.length > 0 && agreementSizes.length > 0) {
                return true; // Size was mentioned in agreement
            }
            
            // Check for condition complaints
            const complaintCondition = reasonWords.filter(w => conditionWords.includes(w));
            const agreementCondition = agreementWords.filter(w => conditionWords.includes(w));
            
            if (complaintCondition.length > 0 && agreementCondition.length > 0) {
                return true; // Condition was mentioned
            }
            
            return false;
        })();
        
        let decision: 'REFUND_BUYER' | 'PAY_SELLER';
        let explanation: string;
        
        // IMPROVED DECISION TREE - Quality issues checked FIRST
        
        // Priority 1: Quality issues (most important)
        if (hasQualityIssue && !agreementHasDisclaimer) {
            decision = 'REFUND_BUYER';
            explanation = 'The buyer reports a legitimate quality issue (broken, damaged, or defective) that was not disclosed in the agreement. Refund is warranted.';
        }
        else if (hasQualityIssue && agreementHasDisclaimer) {
            decision = 'PAY_SELLER';
            explanation = 'While the buyer reports a quality issue, the agreement included disclaimers about the item\'s condition (as-is, used, etc.). The buyer accepted these terms.';
        }
        // Priority 2: Buyer remorse
        else if (isBuyerRemorse) {
            decision = 'PAY_SELLER';
            explanation = 'Buyer remorse (changed mind, no longer want) is not a valid reason for cancellation. The seller fulfilled their obligation as agreed.';
        }
        // Priority 3: Specific complaint about disclosed feature
        else if (specificComplaintInAgreement) {
            decision = 'PAY_SELLER';
            explanation = 'The buyer\'s complaint is about a specific feature (color, size, or condition) that was explicitly mentioned in the agreement. The buyer was informed before purchase.';
        }
        // Priority 4: Ambiguous cases - favor buyer
        else {
            decision = 'REFUND_BUYER';
            explanation = 'The complaint describes concerns that were not clearly addressed in the agreement. In ambiguous cases, we favor the buyer.';
        }
        
        return { decision, explanation };
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
        
        // Analyze the dispute with AI (OpenAI if available, mock as fallback)
        console.log('🤖 AI analyzing dispute...');
        const { decision, explanation } = await analyzeDisputeWithOpenAI(
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
