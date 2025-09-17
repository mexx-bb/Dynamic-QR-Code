// src/ai/flows/intelligent-fallback.ts
'use server';
/**
 * @fileOverview A flow that intelligently chooses a fallback URL if the primary destination is unavailable.
 *
 * - intelligentFallback - A function that handles the intelligent fallback process.
 * - IntelligentFallbackInput - The input type for the intelligentFallback function.
 * - IntelligentFallbackOutput - The return type for the intelligentFallback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IntelligentFallbackInputSchema = z.object({
  primaryUrl: z.string().url().describe('The primary URL to redirect to.'),
  fallbackUrls: z.array(z.string().url()).describe('An array of fallback URLs to choose from.'),
  reason: z.string().describe('A description of why the primary URL is unavailable.'),
});
export type IntelligentFallbackInput = z.infer<typeof IntelligentFallbackInputSchema>;

const IntelligentFallbackOutputSchema = z.object({
  chosenUrl: z.string().url().describe('The chosen fallback URL.'),
});
export type IntelligentFallbackOutput = z.infer<typeof IntelligentFallbackOutputSchema>;

export async function intelligentFallback(input: IntelligentFallbackInput): Promise<IntelligentFallbackOutput> {
  return intelligentFallbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'intelligentFallbackPrompt',
  input: {schema: IntelligentFallbackInputSchema},
  output: {schema: IntelligentFallbackOutputSchema},
  prompt: `The primary URL {{{primaryUrl}}} is unavailable because {{{reason}}}. From the following list of fallback URLs, choose the most relevant one:

{{#each fallbackUrls}}
- {{{this}}}
{{/each}}

Explain your reasoning for choosing that URL. Return the chosen URL in the format:

{'chosenUrl': 'the_chosen_url'}
`,
});

const intelligentFallbackFlow = ai.defineFlow(
  {
    name: 'intelligentFallbackFlow',
    inputSchema: IntelligentFallbackInputSchema,
    outputSchema: IntelligentFallbackOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
