import { NkoContent, TrajectoryWorld, TrajectoryVariant } from './types';

// Mock function to simulate generating variants
async function generateVariantsForContext(
    input: NkoContent,
    context: string,
    count: number
): Promise<TrajectoryVariant[]> {
    // In a real app, this would call Gemini API with context-specific prompts
    const variants: TrajectoryVariant[] = [];

    for (let i = 0; i < count; i++) {
        variants.push({
            variantId: `var_${Date.now()}_${i}`,
            nkoText: input.nkoText, // In reality, slightly modified syntax
            latinText: `${input.latinText} (${context} style)`,
            englishTranslation: `${input.translation} [${context} nuance]`,
            confidence: 0.7 + (Math.random() * 0.25),
            differentiator: i === 0 ? "Formal phrasing" : "Casual tone"
        });
    }
    return variants;
}

export async function generateTrajectories(
    input: NkoContent,
    numWorlds: number = 3,
    variantsPerWorld: number = 2
): Promise<TrajectoryWorld[]> {
    const worlds: TrajectoryWorld[] = [];

    // Define different contexts (worlds)
    const contexts = [
        'everyday_conversation',
        'formal_writing',
        'storytelling',
        'proverbs_wisdom',
        'educational_instruction',
    ];

    for (let i = 0; i < numWorlds; i++) {
        const context = contexts[i % contexts.length];

        // Generate variants for this world using Gemini
        const variants = await generateVariantsForContext(input, context, variantsPerWorld);

        worlds.push({
            worldId: `world_${i}`,
            context,
            baseContent: input,
            variants,
        });
    }

    return worlds;
}
