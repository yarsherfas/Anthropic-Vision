import { useState } from "react";
import { useRoute, useLocation, Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ChevronLeft, MessageSquare, Calendar, MoreVertical, Edit2, Trash2, Lock, Globe } from "lucide-react";
import { useAuth } from "@/context/auth";
import { 
  useGetCharacter, 
  getGetCharacterQueryKey,
  getListCharactersQueryKey,
  useCreateChat,
  getListChatsQueryKey,
  useUpdateCharacter,
  useDeleteCharacter
} from "@workspace/api-client-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function CharacterProfile() {
  const [, params] = useRoute("/characters/:id");
  const id = params?.id ? parseInt(params.id, 10) : 0;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Edit state
  const [editData, setEditData] = useState({ name: "", description: "", persona: "", avatarUrl: "" });

  const { data: character, isLoading } = useGetCharacter(id, {
    query: {
      enabled: !!id,
      queryKey: getGetCharacterQueryKey(id)
    }
  });

  const createChat = useCreateChat();
  const updateCharacter = useUpdateCharacter();
  const deleteCharacter = useDeleteCharacter();

  const handleStartChat = () => {
    if (!character) return;
    
    createChat.mutate(
      {
        data: { characterId: character.id }
      },
      {
        onSuccess: (chat) => {
          queryClient.invalidateQueries({ queryKey: getListChatsQueryKey() });
          setLocation(`/chats/${chat.id}`);
        },
        onError: () => {
          toast({ title: "Could not start conversation", variant: "destructive" });
        }
      }
    );
  };

  const handleEditOpen = () => {
    if (character) {
      setEditData({
        name: character.name,
        description: character.description,
        persona: character.persona,
        avatarUrl: character.avatarUrl || ""
      });
      setIsEditDialogOpen(true);
    }
  };

  const handleEditSubmit = () => {
    updateCharacter.mutate(
      {
        id,
        data: {
          name: editData.name,
          description: editData.description,
          persona: editData.persona,
          avatarUrl: editData.avatarUrl || undefined,
        }
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetCharacterQueryKey(id) });
          queryClient.invalidateQueries({ queryKey: getListCharactersQueryKey() });
          setIsEditDialogOpen(false);
          toast({ title: "Character updated" });
        },
        onError: () => {
          toast({ title: "Failed to update character", variant: "destructive" });
        }
      }
    );
  };

  const handleDeleteSubmit = () => {
    deleteCharacter.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListCharactersQueryKey() });
          toast({ title: "Character deleted" });
          setLocation("/characters");
        },
        onError: () => {
          toast({ title: "Failed to delete character", variant: "destructive" });
        }
      }
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
      </div>
    );
  }

  if (!character) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex flex-col items-center justify-center text-center space-y-4">
        <h1 className="text-2xl font-bold">Character not found</h1>
        <Link href="/characters" className="text-primary hover:underline">Return to directory</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 relative">
      <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-primary/10 to-transparent -z-10 opacity-50" />

      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center justify-between mb-8">
          <Link href="/characters" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-white transition-colors">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to directory
          </Link>

          {character.isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-white">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-card border-white/10">
                <DropdownMenuItem className="cursor-pointer" onClick={handleEditOpen}>
                  <Edit2 className="w-4 h-4 mr-2" /> Edit Character
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10" onClick={() => setIsDeleteDialogOpen(true)}>
                  <Trash2 className="w-4 h-4 mr-2" /> Delete Character
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-12">
          {/* Main Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
              <Avatar className="w-32 h-32 border-4 border-background shadow-2xl">
                <AvatarImage src={character.avatarUrl || undefined} className="object-cover" />
                <AvatarFallback className="bg-primary/10 text-primary text-4xl font-serif">
                  {character.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-3 flex-1 mt-2">
                <div>
                  <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white/95">
                    {character.name}
                  </h1>
                  <p className="text-xl text-muted-foreground mt-2 font-medium">
                    {character.description}
                  </p>
                </div>
                
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                  <Badge variant="secondary" className="bg-white/5 border-none text-white/80 px-3 py-1 text-sm">
                    {character.category}
                  </Badge>
                  {character.isFeatured && (
                    <Badge variant="outline" className="border-primary/30 text-primary px-3 py-1 text-sm bg-primary/5">
                      Featured
                    </Badge>
                  )}
                  {character.visibility === "private" && (
                    <Badge variant="outline" className="border-white/20 text-white/50 px-3 py-1 text-sm bg-white/5 flex items-center gap-1.5">
                      <Lock className="w-3 h-3" /> Private
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-white/5">
              <h2 className="text-xl font-semibold mb-4 text-white/90">Persona & Backstory</h2>
              <div className="prose prose-invert max-w-none text-muted-foreground/90 leading-relaxed space-y-4 whitespace-pre-wrap">
                {character.persona}
              </div>
            </div>
          </motion.div>

          {/* Action Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            <div className="bg-card border border-white/5 rounded-2xl p-6 shadow-xl space-y-6 sticky top-24">
              <Button 
                onClick={handleStartChat}
                disabled={createChat.isPending}
                className="w-full h-14 text-lg font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl shadow-[0_0_20px_rgba(212,132,90,0.2)] transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {createChat.isPending ? "Connecting..." : "Start Conversation"}
              </Button>

              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <MessageSquare className="w-4 h-4 text-primary/70" />
                  <span className="flex-1">Total messages</span>
                  <span className="font-medium text-white/80">{character.messageCount.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 text-primary/70" />
                  <span className="flex-1">Created</span>
                  <span className="font-medium text-white/80">
                    {new Date(character.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-card border-white/10 text-white sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Character</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input 
                value={editData.name} 
                onChange={e => setEditData({...editData, name: e.target.value})} 
                className="bg-background border-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input 
                value={editData.description} 
                onChange={e => setEditData({...editData, description: e.target.value})} 
                className="bg-background border-white/10"
              />
            </div>
            <div className="space-y-2">
              <Label>Persona</Label>
              <Textarea 
                value={editData.persona} 
                onChange={e => setEditData({...editData, persona: e.target.value})} 
                className="bg-background border-white/10 min-h-[150px]"
              />
            </div>
            <div className="space-y-2">
              <Label>Avatar URL</Label>
              <Input 
                value={editData.avatarUrl} 
                onChange={e => setEditData({...editData, avatarUrl: e.target.value})} 
                className="bg-background border-white/10"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsEditDialogOpen(false)} className="hover:bg-white/5">Cancel</Button>
            <Button onClick={handleEditSubmit} disabled={updateCharacter.isPending} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {updateCharacter.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-card border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Character</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {character.name}? This action cannot be undone and will permanently erase this character.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent border-white/10 hover:bg-white/5 text-white">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteSubmit}
              disabled={deleteCharacter.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteCharacter.isPending ? "Deleting..." : "Delete Permanently"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
