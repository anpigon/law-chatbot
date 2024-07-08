import { useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Loading } from "./ui/loading";

const MarkdownRenderer = ({ content }: { content: string }) => {
  return (
    <ReactMarkdown
      children={content}
      remarkPlugins={[remarkGfm]}
      components={{
        a: ({ node, ...props }) => (
          <a
            {...props}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "blue",
              textDecoration: "underline",
            }}
          >
            {props.children}
          </a>
        ),
        h1: ({ node, ...props }) => (
          <h1
            style={{
              fontWeight: "bold",
              fontSize: "1.5em",
              marginBottom: "0.5em",
            }}
            {...props}
          />
        ),
        h2: ({ node, ...props }) => (
          <h2
            style={{
              fontWeight: "bold",
              fontSize: "1.25em",
              marginBottom: "0.5em",
            }}
            {...props}
          />
        ),
        h3: ({ node, ...props }) => (
          <strong
            style={{ fontSize: "1em", marginBottom: "0.5em" }}
            {...props}
          />
        ),
        p: ({ node, ...props }) => (
          <p style={{ marginBottom: "0.5em", marginTop: "0.5em" }} {...props} />
        ),
        ul: ({ node, ...props }) => (
          <ul
            style={{
              marginBottom: "0.5em",
              marginTop: "0.5em",
              paddingLeft: "1em",
            }}
            {...props}
          />
        ),
        li: ({ node, ...props }) => (
          <li style={{ marginBottom: "0.3em" }} {...props} />
        ),
        code: ({ node, className, children, ...props }) => {
          const match = /language-(\w+)/.exec(className || "");
          return match ? (
            <div style={{ position: "relative" }}>
              <SyntaxHighlighter
                children={String(children).replace(/\n$/, "")}
                styles={atomDark}
                language={match[1]}
                PreTag="div"
                customStyle={{
                  background: "black",
                  color: "white",
                  borderRadius: "0.5em",
                  padding: "1em",
                  wordWrap: "break-word",
                  whiteSpace: "pre-wrap",
                }}
                {...props as any}
              />
              <button
                onClick={() =>
                  navigator.clipboard.writeText(
                    String(children).replace(/\n$/, "")
                  )
                }
                style={{
                  position: "absolute",
                  top: "0.5em",
                  right: "0.5em",
                  backgroundColor: "white",
                  color: "black",
                  border: "none",
                  borderRadius: "0.3em",
                  padding: "0.3em 0.6em",
                  cursor: "pointer",
                }}
              >
                Copy
              </button>
            </div>
          ) : (
            <code
              className={className}
              {...props}
              style={{
                backgroundColor: "black",
                color: "white",
                padding: "0.2em 0.4em",
                borderRadius: "0.3em",
                wordWrap: "break-word",
                whiteSpace: "pre-wrap",
              }}
            >
              {children}
            </code>
          );
        },
      }}
    />
  );
};

export default function ChatArea({
  messages,
  scrollToBottom,
}: {
  messages: Array<{
    role: "user" | "assistant";
    content?: string;
    status?: "thinking";
  }>;
  scrollToBottom: Function;
}) {
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <>
      {messages.map((message, index) => {
        if (message.role === "assistant" && message.status === "thinking") {
          return <Loading key={index} />;
        } else if (message.role === "assistant") {
          return (
            <div className="mb-4 flex justify-start" key={index}>
              <div className="whitespace-pre-wrap rounded-xl border border-gray-200 bg-gray-100 px-4 py-2 last:mb-0 max-w-full break-words">
                <MarkdownRenderer content={message.content || ""} />
              </div>
            </div>
          );
        } else if (message.role === "user") {
          return (
            <div className="mb-4 flex justify-end last:mb-0" key={index}>
              <div className="whitespace-pre-wrap rounded-xl bg-blue-500 px-4 py-2 text-white max-w-full break-words">
                {message.content}
              </div>
            </div>
          );
        }
      })}
    </>
  );
}
