import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, isToolUIPart, type UIMessage } from "ai";
import { useState, useEffect, useRef, useMemo } from "react";
import { BookOpen } from "lucide-react";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import {
  Tool,
  ToolHeader,
  ToolContent,
  ToolInput,
  ToolOutput,
} from "@/components/ai-elements/tool";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { supabase } from "@/integrations/supabase/client";
export function TutorChat({
  threadId,
  initialMessages,
}: {
  threadId: string;
  initialMessages: UIMessage[];
}) {
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const textarea = useRef<HTMLTextAreaElement>(null);
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: { threadId },
        headers: async () => {
          const { data } = await supabase.auth.getSession();
          return data.session
            ? { Authorization: `Bearer ${data.session.access_token}` }
            : { Authorization: "" };
        },
      }),
    [threadId],
  );
  const { messages, sendMessage, status, stop } = useChat({
    id: threadId,
    messages: initialMessages,
    transport,
    onError: (e) => setError(e.message),
    onFinish: () => textarea.current?.focus(),
  });
  const busy = status === "submitted" || status === "streaming";
  useEffect(() => {
    textarea.current?.focus();
  }, [threadId]);
  return (
    <div className="chat-window">
      <div className="chat-heading">
        <div className="tutor-avatar">
          <BookOpen />
        </div>
        <div>
          <h3>your ai tutor</h3>
          <p>Gemini · A little clarity, whenever you need it.</p>
        </div>
      </div>
      <Conversation>
        <ConversationContent>
          {messages.length === 0 && (
            <div className="chat-empty">
              <div className="tutor-avatar">
                <BookOpen size={25} />
              </div>
              <h2>What are we learning today?</h2>
              <p>
                A tricky equation, a new concept, or a question you’ve been saving. Let’s work
                through it together.
              </p>
            </div>
          )}
          {messages.map((message) => (
            <Message key={message.id} from={message.role}>
              <MessageContent>
                {message.parts.map((part, index) => {
                  if (part.type === "text")
                    return <MessageResponse key={index}>{part.text}</MessageResponse>;
                  if (part.type === "reasoning")
                    return (
                      <details key={index} className="text-xs text-muted-foreground mb-3">
                        <summary>Approach summary</summary>
                        <MessageResponse>{part.text}</MessageResponse>
                      </details>
                    );
                  if (isToolUIPart(part))
                    return (
                      <Tool key={index} defaultOpen={false}>
                        <ToolHeader
                          type={part.type}
                          state={part.state}
                          title={
                            part.type === "tool-calculator" ? "Calculator" : "Academic reference"
                          }
                        />
                        <ToolContent>
                          <ToolInput input={part.input} />
                          <ToolOutput
                            output={
                              <pre className="whitespace-pre-wrap text-xs">
                                {JSON.stringify(part.output, null, 2)}
                              </pre>
                            }
                            errorText={part.errorText}
                          />
                        </ToolContent>
                      </Tool>
                    );
                  return null;
                })}
              </MessageContent>
            </Message>
          ))}
          {status === "submitted" && <Shimmer>Working through your question…</Shimmer>}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>
      {error && (
        <p className="error-text" role="alert">
          {error}
        </p>
      )}
      <div className="chat-composer">
        <PromptInput
          onSubmit={async () => {
            if (!input.trim() || busy) return;
            setError("");
            const text = input;
            setInput("");
            textarea.current?.focus();
            await sendMessage({ text });
          }}
        >
          <PromptInputTextarea
            aria-label="Ask your ai tutor"
            ref={textarea}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your ai tutor…"
          />
          <PromptInputFooter className="justify-between">
            <span className="text-xs text-muted-foreground">Learning, one question at a time.</span>
            <PromptInputSubmit status={status} onStop={stop} disabled={!busy && !input.trim()} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}
