import { useState } from "react";
import { Link, useSearch } from "wouter";
import { motion } from "framer-motion";
import { Search, Plus, MessageSquare, Lock } from "lucide-react";
import { useListCharacters, useListCategories } from "@workspace/api-client-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth";

export default function Characters() {
  const searchStr = useSearch();
  const params = new URLSearchParams(searchStr);
  const mineParam = params.get("mine") === "true";

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showMine, setShowMine] = useState(mineParam);
  const { user } = useAuth();

  const { data: categories } = useListCategories();
  const { data: characters, isLoading } = useListCharacters({
    search: search || undefined,
    category: selectedCategory || undefined,
    mine: showMine ? true : undefined,
  });

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-7xl">

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white/90">
              {showMine ? "My Characters" : "Discover"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {showMine ? "Characters you've created." : "Find your next AI companion."}
            </p>
          </div>
          <Link href="/characters/new">
            <Button className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shrink-0">
              <Plus className="w-4 h-4 mr-2" /> Create Character
            </Button>
          </Link>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search characters..."
              className="pl-10 bg-card border-white/10 focus:border-primary/50 text-white placeholder:text-muted-foreground/50 rounded-full"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {user && (
              <button
                onClick={() => setShowMine(!showMine)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium border transition-all whitespace-nowrap",
                  showMine
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "bg-card border-white/10 text-muted-foreground hover:text-white hover:border-white/20"
                )}
              >
                My Characters
              </button>
            )}
            <button
              onClick={() => setSelectedCategory(null)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium border transition-all",
                !selectedCategory
                  ? "bg-white/10 border-white/20 text-white"
                  : "bg-card border-white/10 text-muted-foreground hover:text-white hover:border-white/20"
              )}
            >
              All
            </button>
            {categories?.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setSelectedCategory(selectedCategory === cat.slug ? null : cat.slug)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium border transition-all whitespace-nowrap",
                  selectedCategory === cat.slug
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "bg-card border-white/10 text-muted-foreground hover:text-white hover:border-white/20"
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-56 rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : characters?.length === 0 ? (
          <div className="py-24 text-center space-y-4">
            <p className="text-muted-foreground text-lg">No characters found.</p>
            <Link href="/characters/new">
              <Button className="mt-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                Create one
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {characters?.map((char, i) => (
              <motion.div
                key={char.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04, duration: 0.35 }}
              >
                <Link href={`/characters/${char.id}`}>
                  <div className="group relative flex flex-col h-full bg-card border border-white/5 rounded-2xl overflow-hidden hover:border-white/15 transition-all hover:shadow-xl hover:shadow-black/30 cursor-pointer">
                    <div className="h-24 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent flex items-center justify-center">
                      <Avatar className="w-16 h-16 border-2 border-background shadow-lg">
                        <AvatarImage src={char.avatarUrl || undefined} className="object-cover" />
                        <AvatarFallback className="bg-primary/10 text-primary text-xl font-serif">
                          {char.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex flex-col flex-1 p-5">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-semibold text-lg text-white/90 leading-tight group-hover:text-white transition-colors">
                          {char.name}
                        </h3>
                        {char.visibility === "private" && (
                          <Lock className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed flex-1 line-clamp-2">
                        {char.description}
                      </p>
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                        <Badge variant="secondary" className="bg-white/5 border-none text-white/60 text-xs px-2 py-0.5">
                          {char.category}
                        </Badge>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MessageSquare className="w-3 h-3" />
                          {char.messageCount.toLocaleString()}
                        </span>
                      </div>
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
