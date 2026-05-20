import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { ChevronLeft, Sparkles, User, FileText, Image as ImageIcon, Loader2, Globe, Lock } from "lucide-react";
import { useListCategories, useCreateCharacter } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { getListCharactersQueryKey } from "@workspace/api-client-react";

import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/auth";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name must be less than 50 characters"),
  category: z.string().min(1, "Category is required"),
  description: z.string().min(10, "Description should be at least 10 characters").max(200, "Keep it concise"),
  persona: z.string().min(50, "Persona should be detailed enough to guide the AI").max(2000, "Persona is too long"),
  avatarUrl: z.string().url("Must be a valid URL").optional().or(z.literal('')),
  visibility: z.enum(["public", "private"]),
});

export default function CreateCharacter() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: categories } = useListCategories();
  const { user } = useAuth();
  const createCharacter = useCreateCharacter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      category: "",
      description: "",
      persona: "",
      avatarUrl: "",
      visibility: "public",
    },
  });

  const visibility = form.watch("visibility");

  function onSubmit(values: z.infer<typeof formSchema>) {
    createCharacter.mutate(
      {
        data: {
          name: values.name,
          category: values.category,
          description: values.description,
          persona: values.persona,
          avatarUrl: values.avatarUrl || undefined,
          visibility: values.visibility,
        }
      },
      {
        onSuccess: (char) => {
          queryClient.invalidateQueries({ queryKey: getListCharactersQueryKey() });
          toast({ title: "Character created", description: `${char.name} is now ready to chat.` });
          setLocation(`/characters/${char.id}`);
        },
        onError: () => {
          toast({ title: "Error", description: "Failed to create character.", variant: "destructive" });
        }
      }
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="mb-8">
          <Link href="/characters" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-white transition-colors mb-4">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to characters
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-white/90">Create Companion</h1>
          <p className="text-muted-foreground mt-2">Design a new personality, backstory, and voice.</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-card border border-white/5 rounded-2xl p-6 sm:p-8 shadow-2xl"
        >
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/80 flex items-center gap-2">
                        <User className="w-4 h-4 text-primary" /> Name
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Atlas, The Librarian" className="bg-background border-white/10" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/80">Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-background border-white/10 text-white">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-popover border-white/10">
                          {categories?.map((cat) => (
                            <SelectItem key={cat.id} value={cat.slug} className="hover:bg-white/5 cursor-pointer">
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/80 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" /> Short Description
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="A brief hook to display on the character card" className="bg-background border-white/10" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="persona"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/80 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" /> Persona & Backstory
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe their personality, knowledge base, speaking style, and history..."
                        className="bg-background border-white/10 min-h-[200px] resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="avatarUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/80 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-primary" /> Avatar URL (Optional)
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." className="bg-background border-white/10" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Visibility toggle */}
              <FormField
                control={form.control}
                name="visibility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/80">Visibility</FormLabel>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: "public", icon: Globe, label: "Public", desc: "Anyone can discover and chat" },
                        { value: "private", icon: Lock, label: "Private", desc: "Only visible to you" },
                      ].map(({ value, icon: Icon, label, desc }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => field.onChange(value)}
                          className={cn(
                            "flex items-start gap-3 p-4 rounded-xl border text-left transition-all",
                            field.value === value
                              ? "border-primary/50 bg-primary/5 ring-1 ring-primary/30"
                              : "border-white/10 bg-background hover:border-white/20 hover:bg-white/5"
                          )}
                        >
                          <Icon className={cn("w-5 h-5 mt-0.5 shrink-0", field.value === value ? "text-primary" : "text-muted-foreground")} />
                          <div>
                            <p className={cn("text-sm font-medium", field.value === value ? "text-white" : "text-white/70")}>{label}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                    {!user && visibility === "private" && (
                      <p className="text-xs text-muted-foreground mt-2">
                        <Link href="/auth" className="text-primary hover:underline">Sign in</Link> to keep characters private to your account.
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end pt-4 border-t border-white/5">
                <Button
                  type="submit"
                  size="lg"
                  disabled={createCharacter.isPending}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 rounded-full"
                >
                  {createCharacter.isPending ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Manifesting...</>
                  ) : (
                    "Bring to Life"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </motion.div>
      </div>
    </div>
  );
}
