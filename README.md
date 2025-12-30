## Llama Chatbot

<img width="1126" height="648" alt="Screenshot 2025-12-30 132236" src="https://github.com/user-attachments/assets/79c1cc53-eb80-461a-92b6-bf4f50245d8f" />
<img width="1919" height="1079" alt="Screenshot 2025-12-30 131628" src="https://github.com/user-attachments/assets/1485b905-a5be-4bb9-a94e-ac8524c26bff" />
<img width="1919" height="1079" alt="Screenshot 2025-12-30 131703" src="https://github.com/user-attachments/assets/7c8d087d-01db-4104-9b7c-7b5125da1ff3" />


A modern, streaming AI chat experience built with **Next.js 16**, **React 19**, and the **Vercel AI SDK**, powered locally by **Ollama** with the `llama3.2` model.

This app lives in the `llama-chatbot` directory and exposes:

- **Chat UI** at `/chat` – a sleek, responsive interface with dark mode, animated placeholders, and copy-to-clipboard for assistant replies.
- **Streaming API** at `/api/chat` – uses `ai` + `ai-sdk-ollama` to stream responses from a local LLaMA model.

---

### Features

- **Local LLM via Ollama**
  - Uses `ollama("llama3.2")` from `ai-sdk-ollama`.
  - System prompt: *"You are an assistant who answers user queries"* (see `app/api/chat/route.ts`).
- **Streaming responses**
  - Built on `streamText` from the `ai` SDK, returned as a UI message stream.
- **Polished chat UI**
  - Bubble-style layout with user and bot avatars.
  - Empty state with playful copy and dynamic placeholder text from `lib/bot-utils.ts`.
  - Copy-to-clipboard button on assistant messages with tooltip feedback.
  - Scroll-to-bottom helper for long conversations.
- **Theming**
  - Light/dark mode toggle (`ModeToggle` component) using `next-themes`.
  - Tailwind-based styling with modern UI components under `components/ui` and `components/ai-elements`.

---

### Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **UI**: React 19, Tailwind CSS 4, Radix UI primitives, custom UI kit in `components/ui`
- **AI**: `ai` (Vercel AI SDK), `@ai-sdk/react`, `ai-sdk-ollama`
- **Other**: `lucide-react`, `@xyflow/react`, `shiki`, `zod`

---

### Prerequisites

- **Node.js** 20+ (recommended for Next.js 16 / React 19)
- **npm** (or another compatible package manager)
- **Ollama** installed and running locally  
  - Download from `https://ollama.com`
  - Pull the LLaMA model used by this app:

```bash
ollama pull llama3.2
```

---

### Getting Started

From the `llama-chatbot` directory:

```bash
# Install dependencies
npm install

# Run the dev server
npm run dev
```

By default, the app will be available at `http://localhost:3000`.

- Open `http://localhost:3000/chat` to use the chat interface.
- The API route is available at `http://localhost:3000/api/chat`.

---

### Project Structure (Overview)

- `app/`
  - `page.tsx` – root landing page.
  - `chat/page.tsx` – main chat UI (`ConversationDemo`).
  - `api/chat/route.ts` – POST endpoint that streams responses from Ollama.
- `components/`
  - `ai-elements/` – composable building blocks for AI UX (conversation, message, toolbar, prompt input, etc.).
  - `ui/` – base UI components (buttons, inputs, dialogs, tooltips, etc.).
  - `providers.tsx` – shared React providers (theme, etc.).
- `lib/`
  - `bot-utils.ts` – random placeholders and loading messages for the chatbot.
  - `utils.ts` – shared utility helpers.

---

### How the Chat Flow Works

- **Client (`app/chat/page.tsx`)**
  - Uses `useChat` from `@ai-sdk/react` to manage messages and streaming state.
  - Renders the conversation using `Conversation`, `Message`, and `PromptInput` components.
  - Sends user input via `sendMessage({ text })` and displays streaming replies.
  - Provides:
    - Loading indicators based on `status` (`submitted`, `streaming`).
    - A "Stop" capability: when streaming, clicking the submit button calls `stop()`.
    - Copy-to-clipboard for assistant messages using the Clipboard API.

- **Server (`app/api/chat/route.ts`)**
  - Accepts `{ messages: UIMessage[] }` as JSON.
  - Converts UI messages with `convertToModelMessages(messages)`.
  - Calls:

    ```ts
    const result = streamText({
      model: ollama("llama3.2"),
      system: "You are an assistant who answers user queries",
      messages: await convertToModelMessages(messages),
    });
    ```

  - Returns `result.toUIMessageStreamResponse()` for a streaming response compatible with the client.

---

### Configuration & Customization

- **Change the model**
  - Edit `app/api/chat/route.ts` and change:

    ```ts
    model: ollama("llama3.2"),
    ```

    to another model available in your Ollama installation, e.g.:

    ```ts
    model: ollama("llama3.1"),
    ```

  - Make sure to `ollama pull <model-name>` before using a new model.

- **Adjust the system prompt**
  - In `app/api/chat/route.ts`, tweak the `system` string to better match your use case:

    ```ts
    system: "You are a helpful assistant specialized in X...",
    ```

- **Customize placeholders and loading messages**
  - Edit `lib/bot-utils.ts`:
    - `placeholders`: used for the chat input before typing.
    - `loadingStates`: displayed while the model is generating a response.

- **Styling**
  - Global styles: `app/globals.css`.
  - Tailwind config: `postcss.config.mjs` + Tailwind 4 setup.
  - UI components: customize styles in `components/ui` and `components/ai-elements`.

---

### Scripts

From the `llama-chatbot` directory:

- **`npm run dev`** – start the development server.
- **`npm run build`** – create an optimized production build.
- **`npm run start`** – start the production server (after `npm run build`).
- **`npm run lint`** – run ESLint.

---

### Troubleshooting

- **No responses / requests fail**
  - Ensure **Ollama** is running and the `llama3.2` model is installed (`ollama pull llama3.2`).
  - Check the terminal running `npm run dev` for error logs.
- **Model not found**
  - Verify the model name in `app/api/chat/route.ts` matches a model listed by:

    ```bash
    ollama list
    ```

- **Port conflicts**
  - If port 3000 is in use, set `PORT=3001` (or another port) when running `npm run dev`.

---

### License

This project is provided as-is for experimentation and local development.  
Review and adapt licensing terms as needed before using in production.


