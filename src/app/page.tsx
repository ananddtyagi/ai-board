'use client';

import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

// Define persona types
interface Persona {
  id: string;
  name: string;
  role: string;
  avatar: string;
  systemPrompt: string;
  style: {
    backgroundColor: string;
    textColor: string;
  };
}

// Define message types
interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: Date;
  personaId?: string;
}

// Sample personas
const personas: Persona[] = [
  {
    id: 'steve-jobs',
    name: 'Steve Jobs',
    role: 'Visionary',
    avatar: '👨‍💼',
    systemPrompt: 'You are Steve Jobs. Focus on product vision, design simplicity, and revolutionary ideas. Be direct, passionate, and uncompromising about quality. Speak about "insanely great" products and challenge conventional thinking.',
    style: {
      backgroundColor: '#e6e6e6',
      textColor: '#000000',
    },
  },
  {
    id: 'warren-buffett',
    name: 'Warren Buffett',
    role: 'Investor',
    avatar: '💰',
    systemPrompt: 'You are Warren Buffett. Focus on long-term value, financial stability, and sound business fundamentals. Speak about patience, margin of safety, and intrinsic value. Be folksy but wise, using clear analogies.',
    style: {
      backgroundColor: '#f5f5dc',
      textColor: '#000000',
    },
  },
  {
    id: 'elon-musk',
    name: 'Elon Musk',
    role: 'Innovator',
    avatar: '🚀',
    systemPrompt: 'You are Elon Musk. Focus on bold technological innovation, multi-planetary existence, and sustainable energy. Be direct, occasionally quirky, and talk about ambitious goals. Reference physics first principles and exponential thinking.',
    style: {
      backgroundColor: '#e6f7ff',
      textColor: '#000000',
    },
  },
];

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activePersonas, setActivePersonas] = useState<string[]>([]);
  const [aiQuestionCount, setAiQuestionCount] = useState(0);
  const [email, setEmail] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Maximum number of questions a user can ask before being prompted for email
  const MAX_QUESTIONS = 3;

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Prepare the API request
      const apiPersonas = personas.map(p => ({
        id: p.id,
        name: p.name,
        systemPrompt: p.systemPrompt
      }));

      // 1. First, use the router to determine which personas should respond
      const routerResponse = await fetch('/api/router', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: userMessage.content,
          personas: apiPersonas,
        }),
      });

      if (!routerResponse.ok) {
        throw new Error('Failed to route the query');
      }

      const routerData = await routerResponse.json();
      const selectedPersonaNames = routerData.selectedPersonaNames;

      // Filter personas based on router's decision
      const selectedPersonas = apiPersonas.filter(p =>
        selectedPersonaNames.includes(p.name)
      );

      // If no personas were selected, use all personas as fallback
      const personasToUse = selectedPersonas.length > 0 ? selectedPersonas : apiPersonas;

      // Update active personas
      setActivePersonas(personasToUse.map(p => p.id));

      // 2. Now get responses from selected personas
      const response = await fetch('/api/board', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: userMessage.content,
          personas: personasToUse,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get board responses');
      }

      const data = await response.json();

      // Add each persona response to the chat
      for (const personaResponse of data.responses) {
        const message: Message = {
          id: Date.now().toString() + personaResponse.personaId,
          content: personaResponse.response,
          sender: 'ai',
          timestamp: new Date(),
          personaId: personaResponse.personaId,
        };

        // Add a small delay between responses to create a conversation-like feel
        await new Promise(resolve => setTimeout(resolve, 800));
        setMessages(prev => [...prev, message]);
      }

      setAiQuestionCount(prev => prev + 1);


      // If this was the last allowed message, add the email prompt after all responses
      if (aiQuestionCount === MAX_QUESTIONS) {
        const systemMessage: Message = {
          id: Date.now().toString() + '-limit',
          content: "To get more answers, enter your email below!",
          sender: 'system',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, systemMessage]);
      }

    } catch (error) {
      console.error('Error generating responses:', error);

      // Show an error message to the user
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString() + 'error',
          content: 'Sorry, there was an error generating responses. Please try again.',
          sender: 'system',
          timestamp: new Date(),
        }
      ]);
    } finally {
      setIsLoading(false);
      setActivePersonas([]); // Clear active personas
    }
  };

  // This function is kept for development/testing without API calls
  // const simulateResponse = (query: string, persona: Persona): string => {
  //   const responses: Record<string, Record<string, string>> = {
  //     'steve-jobs': {
  //       default: "We need to think differently here. What we're looking for is not just incremental improvement, but a revolutionary approach that will change everything.",
  //     },
  //     'warren-buffett': {
  //       default: "In the long run, it's not about timing the market, but time in the market. Let's focus on the fundamentals and the intrinsic value.",
  //     },
  //     'elon-musk': {
  //       default: "We need to apply first principles thinking here. Break down the problem to its fundamental truths and build up from there. The possibilities are exponential.",
  //     },
  //   };

  //   return responses[persona.id]?.default ||
  //     `As ${persona.name}, I would approach this by focusing on ${persona.role.toLowerCase()} aspects.`;
  // };

  return (
    <div className="flex flex-col min-h-screen p-4 max-w-4xl mx-auto">
      <header className="text-center py-4 border-b border-gray-200 mb-4">
        <h1 className="text-2xl font-bold">AI Advisory Board</h1>
        <p className="text-gray-600">Consult with virtual personas of famous leaders</p>
      </header>

      <main className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto mb-4 p-2">
          {messages.length === 0 ? (
            <div className="text-center p-8 text-gray-500">
              <p>Ask a question to get started!</p>
              <p className="text-sm mt-2">
                {`Example: "What's the best approach for our new product launch?"`}
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`mb-4 ${message.sender === 'user' ? 'ml-auto max-w-[80%]' : 'mr-auto max-w-[80%]'
                  }`}
              >
                {message.sender === 'user' ? (
                  <div className="bg-blue-500 text-white p-3 rounded-lg">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                      className="prose prose-sm max-w-none break-words prose-invert"
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                ) : message.sender === 'system' ? (
                  <div className={`p-3 rounded-lg w-full text-center ${message.content.startsWith('You\'ve reached')
                    ? 'bg-blue-100 text-blue-700'
                    : message.content.startsWith('Thank you for your email')
                      ? 'bg-green-100 text-green-700'
                      : message.content.startsWith('Routing')
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                      className="prose prose-sm max-w-none break-words"
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div
                    className="p-3 rounded-lg"
                    style={{
                      backgroundColor: personas.find(p => p.id === message.personaId)?.style.backgroundColor || '#f1f1f1',
                      color: personas.find(p => p.id === message.personaId)?.style.textColor || '#000000',
                    }}
                  >
                    <div className="flex items-center mb-1">
                      <span className="mr-2 text-lg">
                        {personas.find(p => p.id === message.personaId)?.avatar}
                      </span>
                      <span className="font-bold">
                        {personas.find(p => p.id === message.personaId)?.name}
                      </span>
                      <span className="text-xs ml-2 opacity-75">
                        {personas.find(p => p.id === message.personaId)?.role}
                      </span>
                    </div>
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw]}
                      className="prose prose-sm max-w-none break-words"
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="mt-auto">
          {aiQuestionCount >= MAX_QUESTIONS && (
            <div className="border border-blue-200 bg-blue-50 p-4 rounded-md mb-4">
              <h3 className="text-lg font-semibold mb-2">{`You've reached the limit`}</h3>
              <p className="text-sm text-gray-600 mb-4">
                {`Add your email if you're interested in setting up a complete demo call and we'll get back to you!`}
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="flex-1 p-2 border border-gray-300 rounded"
                  required
                />
                <button
                  type="button"
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                  onClick={async () => {
                    if (email.trim() && email.includes('@')) {
                      try {
                        // Send the email to our API
                        const response = await fetch('/api/emails', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            email: email.trim()
                          }),
                        });

                        if (!response.ok) {
                          throw new Error('Failed to save email');
                        }

                        const result = await response.json();

                        // Add confirmation message
                        const confirmationMessage: Message = {
                          id: Date.now().toString() + '-confirmation',
                          content: `Thank you for your email! We'll be in touch soon about setting up a complete demo.`,
                          sender: 'system',
                          timestamp: new Date(),
                        };

                        setMessages(prev => [...prev, confirmationMessage]);
                        setEmail('');

                        console.log('Email saved successfully:', result);
                      } catch (error) {
                        console.error('Error saving email:', error);

                        // Show error message
                        const errorMessage: Message = {
                          id: Date.now().toString() + '-error',
                          content: `Sorry, there was an error saving your email. Please try again.`,
                          sender: 'system',
                          timestamp: new Date(),
                        };

                        setMessages(prev => [...prev, errorMessage]);
                      }
                    }
                  }}
                >
                  Submit
                </button>
              </div>
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask the board a question..."
              className="flex-1 p-2 border border-gray-300 rounded"
              disabled={isLoading || (aiQuestionCount > MAX_QUESTIONS)}
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-blue-300"
              disabled={isLoading || !inputValue.trim() || (aiQuestionCount > MAX_QUESTIONS)}
            >
              {isLoading ? 'Thinking...' : 'Ask'}
            </button>
          </div>
        </form>
      </main>

      <section className="mt-6 border-t border-gray-200 pt-4">
        <h2 className="text-lg font-semibold mb-2">Board Members</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {personas.map((persona) => (
            <div
              key={persona.id}
              className={`border rounded p-3 transition-all duration-300 ${activePersonas.includes(persona.id) ? 'ring-2 ring-blue-500 scale-105' : ''
                }`}
              style={{
                backgroundColor: persona.style.backgroundColor,
                color: persona.style.textColor,
                opacity: isLoading && !activePersonas.includes(persona.id) ? 0.5 : 1,
              }}
            >
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-2">{persona.avatar}</span>
                <div className="flex-1">
                  <h3 className="font-bold">{persona.name}</h3>
                  <p className="text-sm">{persona.role}</p>
                </div>
                {activePersonas.includes(persona.id) && (
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"
                    title="Currently responding"></div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Email signup section */}
      {aiQuestionCount < MAX_QUESTIONS && (
        <section className="mt-8 mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-2">{`Want more from your AI Advisory Board?`}</h2>
            <p className="text-gray-600 mb-4">
              {`Sign up to unlock unlimited questions and customize your board with additional advisors.`}
            </p>
            <form
              className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto"
              onSubmit={async (e) => {
                e.preventDefault();
                if (email.trim() && email.includes('@')) {
                  try {
                    // Send the email to our API
                    const response = await fetch('/api/emails', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        email: email.trim(),
                        source: 'footer_signup'
                      }),
                    });

                    if (!response.ok) {
                      throw new Error('Failed to save email');
                    }

                    const result = await response.json();
                    console.log('Email saved successfully:', result);

                    // Show success message
                    alert("Thank you for signing up! We'll be in touch soon about setting up a complete demo.");

                    // Reset question count to allow more questions
                    setAiQuestionCount(0);
                    setEmail('');
                  } catch (error) {
                    console.error('Error saving email:', error);
                    alert("Sorry, there was an error saving your email. Please try again.");
                  }
                }
              }}
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="flex-1 p-2 border border-gray-300 rounded"
                required
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded"
              >
                Get Full Access
              </button>
            </form>
          </div>
        </section>
      )}
    </div>
  );
}
