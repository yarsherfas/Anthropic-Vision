import { Link } from "wouter";
import { motion } from "framer-motion";
import { MessageSquare, Clock, Plus, Trash2 } from "lucide-react";
import { useListChats, useDeleteChat, getListChatsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function Chats() {
  const { data: chats, isLoading } = useListChats();
  const deleteChat = useDeleteChat();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleDelete = (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    deleteChat.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListChatsQueryKey() });
          toast({ description: "Conversation deleted" });
        }
      }
    );
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl space-y-8">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white/90">Your Chats</h1>
            <p className="text-muted-foreground mt-2">Resume your ongoing conversations.</p>
          </div>
          <Link href="/characters" className="shrink-0">
            <Button className="rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white">
              <Plus className="w-4 h-4 mr-2" />
              New Chat
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : chats?.length === 0 ? (
          <div className="py-20 text-center space-y-6 bg-card border border-white/5 rounded-3xl">
            <div className="w-16 h-16 mx-auto bg-white/5 rounded-full flex items-center justify-center text-muted-foreground">
              <MessageSquare className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-medium text-white/80">No active conversations</h3>
              <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                You haven't started any chats yet. Browse the character directory to find a companion.
              </p>
            </div>
            <Link href="/characters">
              <Button className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8">
                Discover Characters
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {chats?.map((chat, i) => (
              <motion.div
                key={chat.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
              >
                <Link href={`/chats/${chat.id}`}>
                  <div className="group relative flex items-center p-4 sm:p-5 rounded-2xl bg-card border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all cursor-pointer">
                    <Avatar className="w-14 h-14 sm:w-16 sm:h-16 border-2 border-background mr-5">
                      <AvatarImage src={chat.characterAvatarUrl || undefined} className="object-cover" />
                      <AvatarFallback className="bg-primary/10 text-primary font-serif text-lg">
                        {chat.characterName.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0 pr-4">
                      <h3 className="font-semibold text-lg text-white/90 truncate mb-1">
                        {chat.characterName}
                      </h3>
                      <div className="flex items-center text-sm text-muted-foreground gap-4">
                        <span className="flex items-center truncate">
                          <MessageSquare className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                          {chat.messageCount} messages
                        </span>
                        {chat.lastMessageAt && (
                          <span className="flex items-center shrink-0">
                            <Clock className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                            {formatDistanceToNow(new Date(chat.lastMessageAt), { addSuffix: true })}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full w-10 h-10"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-card border-white/10">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete conversation?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete your chat history with {chat.characterName}.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="bg-transparent border-white/10 hover:bg-white/5">Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={(e) => handleDelete(chat.id, e)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
