import { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from "react";
import { useNavigate } from "react-router-dom";
import { X, Send, Bot, Sparkles, Trash2, Home, FileText, Users, Settings, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface UserProfile {
  avatar_url: string | null;
  full_name: string | null;
}

const QUICK_SUGGESTIONS = [
  "Qual meu lucro total?",
  "Quantos imóveis tenho?",
  "Quais estão vagos?",
  "Ranking por lucro",
  "Taxa de ocupação",
];

// Rotating prompts to encourage AI usage
const AI_PROMPTS = [
  "Pergunte sobre seu portfólio",
  "Qual imóvel rende mais?",
  "Analise sua ocupação",
  "Descubra oportunidades",
  "Tire suas dúvidas",
];

// Typing indicator component with pulse animation
const TypingIndicator = () => (
  <div className="flex items-center gap-1.5 py-1 px-1">
    <span className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0ms', animationDuration: '0.6s' }}></span>
    <span className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.2s', animationDuration: '0.6s' }}></span>
    <span className="w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0.4s', animationDuration: '0.6s' }}></span>
  </div>
);

// Action button interface
interface ActionButton {
  type: string;
  label: string;
  param?: string;
}

// Parse actions from message content
const parseActions = (content: string): { text: string; actions: ActionButton[] } => {
  const actionRegex = /\[AÇÃO:([^:]+):([^\]:]+)(?::([^\]]+))?\]/g;
  const actions: ActionButton[] = [];
  let match;
  
  while ((match = actionRegex.exec(content)) !== null) {
    actions.push({
      type: match[1],
      label: match[2],
      param: match[3],
    });
  }
  
  const text = content.replace(actionRegex, '').trim();
  return { text, actions };
};

// Get icon for action type
const getActionIcon = (type: string) => {
  switch (type) {
    case 'criar_imovel':
      return Plus;
    case 'ver_imovel':
      return Home;
    case 'ver_documento':
    case 'ver_documentos':
      return FileText;
    case 'ver_inquilinos':
      return Users;
    case 'ver_configuracoes':
      return Settings;
    default:
      return Sparkles;
  }
};

export interface PortfolioCopilotRef {
  openWithQuestion: (question: string) => void;
}

export const PortfolioCopilot = forwardRef<PortfolioCopilotRef>((_, ref) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);
  const [promptIndex, setPromptIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Rotate AI prompts
  useEffect(() => {
    if (isOpen) return; // Don't rotate when chat is open
    
    const interval = setInterval(() => {
      setPromptIndex((prev) => (prev + 1) % AI_PROMPTS.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [isOpen]);

  // Handle action button clicks
  const handleAction = useCallback((action: ActionButton) => {
    switch (action.type) {
      case 'criar_imovel':
        navigate('/properties?action=new');
        setIsOpen(false);
        break;
      case 'ver_imovel':
        if (action.param) {
          navigate(`/properties/${action.param}`);
          setIsOpen(false);
        }
        break;
      case 'ver_documento':
      case 'ver_documentos':
        navigate('/documents');
        setIsOpen(false);
        break;
      case 'ver_inquilinos':
        navigate('/tenants');
        setIsOpen(false);
        break;
      case 'ver_configuracoes':
        navigate('/settings');
        setIsOpen(false);
        break;
      default:
        toast.info(`Ação: ${action.label}`);
    }
  }, [navigate]);

  // Expose method to parent
  useImperativeHandle(ref, () => ({
    openWithQuestion: (question: string) => {
      setIsOpen(true);
      setPendingQuestion(question);
    },
  }));

  // Load user and profile on mount
  useEffect(() => {
    const loadUserAndProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        
        // Load user profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("avatar_url, full_name")
          .eq("user_id", user.id)
          .single();
        
        if (profile) {
          setUserProfile(profile);
        }
      }
    };
    loadUserAndProfile();
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

  const sendMessage = useCallback(async (messageContent: string) => {
    if (!messageContent.trim() || isLoading) return;

    const userContent = messageContent.trim();
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
  }, [isLoading, messages, userId]);

  // Handle pending question when copilot opens
  useEffect(() => {
    if (isOpen && pendingQuestion && userId && !isLoading) {
      const question = pendingQuestion;
      setPendingQuestion(null);
      // Small delay to ensure UI is ready
      setTimeout(() => {
        sendMessage(question);
      }, 300);
    }
  }, [isOpen, pendingQuestion, userId, isLoading, sendMessage]);

  const handleSend = useCallback(() => {
    sendMessage(input);
  }, [input, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickSuggestion = (suggestion: string) => {
    sendMessage(suggestion);
  };

  return (
    <>
      {/* Floating Button with Rotating Prompt */}
      <div className={cn(
        "fixed bottom-6 right-6 flex flex-col items-end gap-2 z-50",
        isOpen && "hidden"
      )}>
        {/* Animated Prompt Bubble */}
        <div className="bg-background border rounded-full px-4 py-2 shadow-lg animate-fade-in">
          <p className="text-sm text-muted-foreground whitespace-nowrap">
            {AI_PROMPTS[promptIndex]}
          </p>
        </div>
        
        {/* Button */}
        <Button
          onClick={() => setIsOpen(true)}
          className={cn(
            "h-16 w-16 rounded-full shadow-xl",
            "bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70",
            "transition-all duration-300 hover:scale-110"
          )}
          size="icon"
        >
          <Sparkles className="h-7 w-7" />
          <span className="sr-only">Copiloto IA</span>
        </Button>
      </div>

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
            {messages.length === 0 && !isLoading ? (
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
                      className="text-xs h-7"
                      onClick={() => handleQuickSuggestion(suggestion)}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => {
                  const { text, actions } = message.role === "assistant" 
                    ? parseActions(message.content)
                    : { text: message.content, actions: [] };
                  
                  return (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-3",
                        message.role === "user" ? "justify-end" : "justify-start"
                      )}
                    >
                      {message.role === "assistant" && (
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarFallback className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-xs">
                            <Bot className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div className="flex flex-col gap-2 max-w-[80%]">
                        <div
                          className={cn(
                            "rounded-2xl px-4 py-2.5 text-sm",
                            message.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          )}
                        >
                          {text || (message.role === "assistant" && isLoading ? <TypingIndicator /> : null)}
                        </div>
                        
                        {/* Action buttons */}
                        {actions.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {actions.map((action, idx) => {
                              const IconComponent = getActionIcon(action.type);
                              return (
                                <Button
                                  key={idx}
                                  variant="outline"
                                  size="sm"
                                  className="text-xs h-7 gap-1"
                                  onClick={() => handleAction(action)}
                                >
                                  <IconComponent className="h-3 w-3" />
                                  {action.label}
                                </Button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      {message.role === "user" && (
                        <Avatar className="h-8 w-8 flex-shrink-0">
                          <AvatarImage src={userProfile?.avatar_url || undefined} />
                          <AvatarFallback className="bg-secondary text-secondary-foreground text-xs">
                            {userProfile?.full_name?.[0] || "U"}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  );
                })}
                {isLoading && messages[messages.length - 1]?.role === "user" && (
                  <div className="flex gap-3 justify-start">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarFallback className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-xs">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="rounded-2xl px-4 py-2.5 text-sm bg-muted">
                      <TypingIndicator />
                    </div>
                  </div>
                )}
              </div>
            )}
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t bg-muted/30">
            <div className="flex items-center gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Digite sua pergunta..."
                className="flex-1 h-10 bg-background"
                disabled={isLoading}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="h-10 w-10 rounded-full"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

PortfolioCopilot.displayName = "PortfolioCopilot";
