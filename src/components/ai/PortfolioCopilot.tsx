import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Bot, User, Sparkles, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const QUICK_SUGGESTIONS = [
  "Qual meu lucro total?",
  "Quantos imóveis tenho?",
  "Quais estão vagos?",
  "Ranking por lucro",
  "Taxa de ocupação",
];

export function PortfolioCopilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load user and messages on mount
  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    loadUser();
  }, []);

  // Load messages from database
  useEffect(() => {
    if (!userId) return;

    const loadMessages = async () => {
      const { data, error } = await supabase
        .from("ai_chat_messages")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true })
        .limit(50);

      if (error) {
        console.error("Error loading messages:", error);
        return;
      }

      if (data) {
        setMessages(
          data.map((msg) => ({
            id: msg.id,
            role: msg.role as "user" | "assistant",
            content: msg.content,
            timestamp: new Date(msg.created_at),
          }))
        );
      }
    };

    loadMessages();
  }, [userId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const saveMessage = async (role: "user" | "assistant", content: string) => {
    if (!userId) return null;

    const { data, error } = await supabase
      .from("ai_chat_messages")
      .insert({
        user_id: userId,
        role,
        content,
      })
      .select()
      .single();

    if (error) {
      console.error("Error saving message:", error);
      return null;
    }

    return data?.id;
  };

  const handleClearHistory = async () => {
    if (!userId) return;

    const { error } = await supabase
      .from("ai_chat_messages")
      .delete()
      .eq("user_id", userId);

    if (error) {
      toast.error("Erro ao limpar histórico");
      return;
    }

    setMessages([]);
    toast.success("Histórico limpo!");
  };

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    const userContent = input.trim();
    const tempUserId = crypto.randomUUID();

    const userMessage: Message = {
      id: tempUserId,
      role: "user",
      content: userContent,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    let assistantContent = "";
    const assistantId = crypto.randomUUID();

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        toast.error("Você precisa estar logado para usar o Copiloto");
        setIsLoading(false);
        return;
      }

      // Save user message
      const savedUserMsgId = await saveMessage("user", userContent);
      if (savedUserMsgId) {
        setMessages((prev) =>
          prev.map((m) => (m.id === tempUserId ? { ...m, id: savedUserMsgId } : m))
        );
      }

      const conversationHistory = messages.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/portfolio-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            message: userContent,
            conversationHistory,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Erro ao processar mensagem");
      }

      if (!response.body) {
        throw new Error("Sem resposta do servidor");
      }

      // Add placeholder assistant message
      setMessages((prev) => [
        ...prev,
        {
          id: assistantId,
          role: "assistant",
          content: "",
          timestamp: new Date(),
        },
      ]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, content: assistantContent } : m
                )
              );
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Flush remaining buffer
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, content: assistantContent } : m
                )
              );
            }
          } catch {
            /* ignore */
          }
        }
      }

      // Save assistant message
      if (assistantContent) {
        const savedAssistantId = await saveMessage("assistant", assistantContent);
        if (savedAssistantId) {
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, id: savedAssistantId } : m))
          );
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast.error(error instanceof Error ? error.message : "Erro ao enviar mensagem");

      // Remove failed assistant message if empty
      setMessages((prev) => prev.filter((m) => m.id !== assistantId || m.content));
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, messages, userId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickSuggestion = (suggestion: string) => {
    setInput(suggestion);
  };

  // Submit when input changes to a suggestion
  useEffect(() => {
    if (input && QUICK_SUGGESTIONS.includes(input) && !isLoading) {
      handleSend();
    }
  }, [input]);

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50",
          "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70",
          "transition-all duration-300 hover:scale-110",
          isOpen && "hidden"
        )}
        size="icon"
      >
        <Sparkles className="h-6 w-6" />
        <span className="sr-only">Copiloto IA</span>
      </Button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[400px] h-[600px] max-h-[80vh] bg-background border rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary/10 to-primary/5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center">
                <Bot className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Copiloto IA</h3>
                <p className="text-xs text-muted-foreground">Seu parceiro de negócios</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {messages.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClearHistory}
                  className="h-8 w-8 rounded-full text-muted-foreground hover:text-destructive"
                  title="Limpar histórico"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-primary/20 to-primary/10 flex items-center justify-center mb-3">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h4 className="font-medium mb-1 text-sm">Copiloto IA</h4>
                <p className="text-xs text-muted-foreground mb-4">
                  Pergunte sobre seu portfólio
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {QUICK_SUGGESTIONS.map((suggestion) => (
                    <Button
                      key={suggestion}
                      variant="outline"
                      size="sm"
                      className="text-xs h-7 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors"
                      onClick={() => handleQuickSuggestion(suggestion)}
                      disabled={isLoading}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-3",
                      message.role === "user" && "flex-row-reverse"
                    )}
                  >
                    <div
                      className={cn(
                        "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                        message.role === "user"
                          ? "bg-primary"
                          : "bg-gradient-to-r from-primary/20 to-primary/10"
                      )}
                    >
                      {message.role === "user" ? (
                        <User className="h-4 w-4 text-primary-foreground" />
                      ) : (
                        <Bot className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-3 max-w-[80%] text-sm",
                        message.role === "user"
                          ? "bg-primary text-primary-foreground rounded-tr-sm"
                          : "bg-muted rounded-tl-sm"
                      )}
                    >
                      {message.content || (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-muted-foreground">Pensando...</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t bg-muted/30">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Pergunte sobre seus imóveis..."
                disabled={isLoading}
                className="flex-1 rounded-full bg-background"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="rounded-full shrink-0"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
