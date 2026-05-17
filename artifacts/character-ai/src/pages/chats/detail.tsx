import { useState, useRef, useEffect } from "react";
import { useRoute, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Send, MoreVertical, Info } from "lucide-react";
import { 
  useGetChat,
  useListMessages,
  useSendMessage,
  getGetChatQueryKey,
  getListMessagesQueryKey,
  useGetCharacter,
  getGetCharacterQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export default function ChatDetail() {
  const [, params] = useRoute("/chats/:id");
  const chatId = params?.id ? parseInt(params.id, 10) : 0;
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [content, setContent] = useState("");

  const { data: chat, isLoading: isChatLoading } = useGetChat(chatId, {
    query: { enabled: !!chatId, queryKey: getGetChatQueryKey(chatId) }
  });

  const characterId = chat?.characterId || 0;
  
  const { data: character } = useGetCharacter(characterId, {
    query: { enabled: !!characterId, queryKey: getGetCharacterQueryKey(characterId) }
  });

  const { data: messages } = useListMessages(chatId, {
    query: { enabled: !!chatId, queryKey: getListMessagesQueryKey(chatId) }
  });

  const sendMessage = useSendMessage();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!content.trim() || !chatId) return;
    
    const messageContent = content;
    setContent(""); // optimistic clear
    
    sendMessage.mutate(
      {
        id: chatId,
        data: { content: messageContent }
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListMessagesQueryKey(chatId) });
          queryClient.invalidateQueries({ queryKey: getGetChatQueryKey(chatId) });
        },
        onError: () => {
          setContent(messageContent); // restore if failed
        }
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (isChatLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="w-10 h-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background text-muted-foreground">
        Conversation not found
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col md:flex-row h-[100dvh] pt-16 bg-background">
      
      {/* Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-4 border-b border-white/5 bg-background/95 backdrop-blur z-10 shrink-0">
          <div className="flex items-center gap-3">
            <Link href="/chats">
              <Button variant="ghost" size="icon" className="md:hidden -ml-2 text-muted-foreground hover:text-white rounded-full">
                <ChevronLeft className="w-5 h-5" />
              </Button>
            </Link>
            <Avatar className="w-10 h-10 border border-white/10">
              <AvatarImage src={chat.characterAvatarUrl || undefined} className="object-cover" />
              <AvatarFallback className="bg-primary/10 text-primary font-serif">
                {chat.characterName.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-medium text-white/90 leading-tight">{chat.characterName}</h2>
              <p className="text-xs text-primary/70">Online</p>
            </div>
          </div>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden text-muted-foreground rounded-full">
                <Info className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent className="bg-card border-l-white/10 p-0 w-80">
              {character && <CharacterInfoPanel character={character} />}
            </SheetContent>
          </Sheet>
        </header>

        {/* Messages */}
        <ScrollArea className="flex-1 px-4 py-6">
          <div className="max-w-3xl mx-auto space-y-6">
            <AnimatePresence initial={false}>
              {messages?.map((msg, i) => {
                const isUser = msg.role === "user";
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      "flex w-full",
                      isUser ? "justify-end" : "justify-start"
                    )}
                  >
                    <div className={cn(
                      "flex max-w-[85%] md:max-w-[75%] gap-3",
                      isUser ? "flex-row-reverse" : "flex-row"
                    )}>
                      {!isUser && (
                        <Avatar className="w-8 h-8 shrink-0 mt-1 shadow-sm">
                          <AvatarImage src={chat.characterAvatarUrl || undefined} className="object-cover" />
                          <AvatarFallback className="bg-primary/20 text-primary text-xs font-serif">
                            {chat.characterName.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      
                      <div className={cn(
                        "px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm",
                        isUser 
                          ? "bg-primary text-primary-foreground rounded-tr-sm" 
                          : "bg-white/5 border border-white/5 text-white/90 rounded-tl-sm"
                      )}>
                        {msg.content}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              {sendMessage.isPending && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex w-full justify-start"
                >
                  <div className="flex max-w-[75%] gap-3">
                    <Avatar className="w-8 h-8 shrink-0 mt-1">
                      <AvatarImage src={chat.characterAvatarUrl || undefined} className="object-cover" />
                      <AvatarFallback className="bg-primary/20 text-primary text-xs font-serif">
                        {chat.characterName.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="px-4 py-4 rounded-2xl bg-white/5 border border-white/5 rounded-tl-sm flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.3s]" />
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce [animation-delay:-0.15s]" />
                      <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} className="h-4" />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="p-4 bg-background/95 backdrop-blur border-t border-white/5 shrink-0">
          <div className="max-w-3xl mx-auto relative flex items-end gap-2 bg-white/5 border border-white/10 rounded-2xl p-2 focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50 transition-all">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              className="min-h-[44px] max-h-32 resize-none bg-transparent border-0 focus-visible:ring-0 p-3 py-2 text-base text-white placeholder:text-muted-foreground/50 shadow-none scrollbar-hide"
              rows={1}
            />
            <Button 
              size="icon"
              onClick={handleSend}
              disabled={!content.trim() || sendMessage.isPending}
              className="h-10 w-10 shrink-0 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all mb-0.5 mr-0.5"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar Info */}
      <div className="hidden md:block w-80 shrink-0 border-l border-white/5 bg-card/50 backdrop-blur-sm overflow-y-auto">
        {character && <CharacterInfoPanel character={character} />}
      </div>

    </div>
  );
}

function CharacterInfoPanel({ character }: { character: any }) {
  return (
    <div className="p-6 space-y-8">
      <div className="flex flex-col items-center text-center space-y-4">
        <Avatar className="w-24 h-24 border-2 border-background shadow-lg">
          <AvatarImage src={character.avatarUrl || undefined} className="object-cover" />
          <AvatarFallback className="bg-primary/10 text-primary text-2xl font-serif">
            {character.name.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold text-xl text-white/90">{character.name}</h3>
          <p className="text-sm text-primary mt-1">{character.category}</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">About</h4>
          <p className="text-sm text-white/80 leading-relaxed">
            {character.description}
          </p>
        </div>
        
        <div className="h-px bg-white/5" />
        
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Stats</h4>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Messages</span>
            <span className="text-white/90 font-medium">{character.messageCount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Created</span>
            <span className="text-white/90 font-medium">
              {new Date(character.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
