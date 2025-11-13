// app/api/actions/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Agent, run } from '@openai/agents';
import { z } from 'zod';

// ---------- Structured output schema ----------
const ActionSchema = z.object({
  owner: z.string().describe('The person responsible for this action item'),
  task: z.string().describe('The task or action item to be completed'),
});

const ActionsResponseSchema = z.object({
  actions: z
    .array(ActionSchema)
    .describe('List of action items extracted from the transcript'),
});

type ActionsResponse = z.infer<typeof ActionsResponseSchema>;

// ---------- Agent definition (created once, reused per request) ----------
const extractActionsAgent = new Agent({
  name: 'Action Extractor',
  model: 'gpt-4o-mini', // Using gpt-4o-mini which is a valid model
  instructions:
    'You are an expert at analyzing meeting transcripts and extracting action items. ' +
    'Given a meeting transcript as input, extract all clear action items and identify who is responsible for each. ' +
    'Always respond using the structured JSON shape defined by the output type.',
  // This tells the agent to produce structured output matching our Zod schema
  outputType: ActionsResponseSchema,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const transcript = body?.transcript;

    if (!transcript || typeof transcript !== 'string') {
      return NextResponse.json(
        { error: 'Transcript is required and must be a string' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY is not configured' },
        { status: 500 }
      );
    }

    // Run the agent: input is just the raw transcript text
    const result = await run(extractActionsAgent, transcript);

    // result.finalOutput is already validated against ActionsResponseSchema
    const actionsResult = result.finalOutput as ActionsResponse;

    // (Optional) extra validation if you want:
    // const validated = ActionsResponseSchema.parse(actionsResult);

    return NextResponse.json(actionsResult, { status: 200 });
  } catch (error) {
    console.error('Error analyzing transcript with agent:', error);
    return NextResponse.json(
      {
        error: 'Failed to analyze transcript',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
