"use client";

import ChatArea from "@/components/chatarea";
import InputArea from "@/components/inputarea";
import { useEffect, useRef, useState } from "react";

interface Message {
  role: "user" | "assistant";
  content?: string;
  status?: "thinking";
}

const initialMessages: Message[] = [
  {
    role: "assistant",
    content: "법원판례 챗봇이예요, 궁금한 내용이 있으신가요? 😄",
  },
];

export default function IndexPage() {
  const chatAreaRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState(initialMessages);

  const scrollToBottom = () => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  };

  const handleSend = async (message: string) => {
    let updatedMessages = [
      ...messages,
      {
        role: "user",
        content: message,
      } as Message,
      {
        role: "assistant",
        status: "thinking",
      } as Message,
    ];

    setMessages(updatedMessages);

    // Streaming, Multi turn 채팅
    const response = await fetch("/api/query", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question: message,
      }),
    });

    const data = await response.json();
    console.log("🚀 ~ handleSend ~ data:", data);
    const answer = data.answer;

    setMessages([
      ...updatedMessages.slice(0, -1),
      {
        role: "assistant",
        content: answer,
      },
    ]);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <>
      <div className="flex absolute bottom-0 justify-center w-full">
        <div className="md:w-1/2">
          <div
            ref={chatAreaRef}
            className="h-screen overflow-auto pl-2 pr-4 pt-40"
          >
            <ChatArea messages={messages} scrollToBottom={scrollToBottom} />
          </div>

          <div className="pb-5 pl-2 pr-4 pt-4">
            <InputArea
              handleSend={handleSend}
              scrollToBottom={scrollToBottom}
            />
          </div>
        </div>
      </div>
    </>
  );
}
