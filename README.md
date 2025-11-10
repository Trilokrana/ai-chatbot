# AI Chatbot – Next.js Demo

A conversational AI demo built with **Next.js App Router**, **Streaming AI SDK**, and interactive UI components from ShadCN. It supports free-form chat plus structured tool responses (weather, recipes, map lookup, sales data, diet plans, stocks, and products).

## ✨ Features

- 🔄 Chat with Gemini models (configurable via dropdown)
- 🧠 Tool-aware responses parsed into rich components
- 🗂️ File attachments & drag/drop in the prompt box
- 📍 Map, 📈 sales, 🥗 diet, 🍳 recipe, 📦 product, 🌤️ weather, and 📊 stock renderers
- ⚡ Streaming UX with retry, copy, and loading indicators
- ♿ Accessible UI with keyboard-friendly controls

## 🚀 Quick Start

```bash
npm install
npm dev
```

Visit **http://localhost:3000**.

## 🔑 Environment Variables

Create `.env.local`:

```
GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=optional_google_maps_embed_key
```

The Google key powers tool generation (weather, recipes, etc.). Maps fallback works without a key but has limited features.

## 🧩 Project Structure

- `app/` – App Router pages, API route, chatbot UI
- `components/ai-elements/` – Prompt, conversation, and tool UI primitives
- `components/ai-tools/` – Weather, product, recipe, map, and other tool renderers
- `lib/useCompleteChat.ts` – Chat hook for non-streaming tool responses
- `lib/extractToolData.ts` – Parses tool JSON into typed payloads
- `app/api/chat/route.ts` – Gemini integration + tool definitions

## 🛠️ Tooling

| Tool name | Purpose |
|-----------|---------|
| `weather` | Structured weather cards |
| `product` | Product detail summaries |
| `recipe`  | Cooking instructions |
| `iphoneSales` | Sales chart data |
| `diet`    | Nutrition plan data |
| `stock`   | Stock quote snapshot |
| `map`     | Location coordinates/zoom |

Tools auto-trigger when the user explicitly requests structured data; otherwise, the assistant replies normally.

## 📦 Deployment

1. Set environment variables on Vercel (or host of choice)
2. Run `pnpm build`
3. Deploy with `vercel --prod` or your CI workflow

## 🧪 Testing / Linting

```bash
npm lint     # Run ESLint
npm test     # Add tests as needed
```

## 🙌 Contributing

- Fork and create a feature branch
- Ensure lint passes
- Submit PR with context screenshots if UI-affecting

## 📄 License

MIT © 2025
