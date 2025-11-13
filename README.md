# Transcript Analyzer

A Next.js application that analyzes meeting transcripts and extracts action items using OpenAI's structured outputs.

## Features

- Upload meeting transcript files (.txt, .md, .doc, .docx)
- Extract action items using OpenAI GPT-4 with structured outputs
- Visualize results in both table and list formats
- Modern, responsive UI

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env.local` file in the root directory:
```env
OPENAI_API_KEY=your_openai_api_key_here
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. Click on the upload area to select a meeting transcript file
2. Click "Analyze Transcript" to process the file
3. View the extracted action items in table or list format
4. Toggle between table and list views using the buttons

## Technology Stack

- Next.js 14 (App Router)
- React 18
- TypeScript
- OpenAI SDK (with structured outputs)
- Zod for schema validation

## API Route

The `/api/analyze` route processes the transcript and uses OpenAI's structured outputs to extract action items in the format:
```json
{
  "actions": [
    {
      "owner": "Person Name",
      "task": "Task description"
    }
  ]
}
```

## License

MIT


