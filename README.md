# AI Advisory Board

A virtual board of advisors with famous personas to help with your business decisions. This application allows you to ask questions and get responses from AI personas modeled after famous business leaders and innovators like Steve Jobs, Warren Buffett, and Elon Musk.

## Features

- Virtual board of advisors with unique personas and perspectives
- Conversational interface showing each advisor's response
- Real-time interactive chat experience
- Uses OpenAI's GPT models to generate responses
- Responsive design for mobile and desktop

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn
- OpenAI API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ai-board.git
   cd ai-board
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env.local` file in the root directory with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Usage

1. Type a business question or scenario in the input field.
2. Click "Ask" or press Enter to submit your question.
3. Each advisor will respond with their unique perspective.
4. Continue the conversation with follow-up questions.

## Customizing Personas

To add or modify personas, edit the `personas` array in `src/app/page.tsx`. Each persona requires:

- `id`: Unique identifier
- `name`: Display name
- `role`: Short description of their expertise
- `avatar`: Emoji or image reference
- `systemPrompt`: Instructions for the AI on how to respond as this persona
- `style`: Visual styling for the persona's messages

## Environment Variables

- `OPENAI_API_KEY`: Your OpenAI API key (required)

## Technologies Used

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- OpenAI API

## Deployment

The easiest way to deploy this app is to use the [Vercel Platform](https://vercel.com/new) from the creators of Next.js.

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- OpenAI for their powerful language models
- Inspired by real advisory boards and business mentorship
