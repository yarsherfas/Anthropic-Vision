import { useState } from "react";
import { Link, useSearch } from "wouter";
import { motion } from "framer-motion";
import { Search, Filter, MessageSquare } from "lucide-react";
import { useListCharacters, useListCategories } from "@workspace/api-client-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Characters() {
  const searchString = useSearch();
  const searchParams = new URLSearchParams(searchString);
  const initialCategory = searchParams.get("category") || "";

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(initialCategory);

  const { data: characters, isLoading } = useListCharacters({ 
    search: search || undefined, 
    category: category || undefined 
  });
  
  const { data: categories } = useListCategories();

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 space-y-8 max-w-6xl">
        
        {/* Header & Filters */}
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white/90">Discover</h1>
            <p className="text-muted-foreground mt-2">Find your next favorite AI companion.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search characters by name or description..." 
                className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-muted-foreground/50 rounded-xl focus-visible:ring-primary/50"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
              <button
                onClick={() => setCategory("")}
                className={`whitespace-nowrap px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  category === "" 
                    ? "bg-primary text-primary-foreground shadow-md" 
                    : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white"
                }`}
              >
                All
              </button>
              {categories?.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.slug)}
                  className={`whitespace-nowrap px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    category === cat.slug 
                      ? "bg-primary text-primary-foreground shadow-md" 
                      : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : characters?.length === 0 ? (
          <div className="py-20 text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-white/5 rounded-full flex items-center justify-center text-muted-foreground">
              <Filter className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-medium text-white/80">No characters found</h3>
            <p className="text-muted-foreground">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {characters?.map((char, i) => (
              <motion.div
                key={char.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
              >
                <Link href={`/characters/${char.id}`}>
                  <div className="group h-full flex flex-col relative overflow-hidden rounded-2xl bg-card border border-white/5 p-6 transition-all hover:bg-white/[0.03] hover:border-white/10 hover:shadow-xl">
                    <div className="flex items-start justify-between mb-4">
                      <Avatar className="w-14 h-14 border border-white/10">
                        <AvatarImage src={char.avatarUrl || undefined} className="object-cover" />
                        <AvatarFallback className="bg-primary/10 text-primary font-serif">
                          {char.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <Badge variant="outline" className="bg-background/50 text-muted-foreground border-white/5">
                        {char.category}
                      </Badge>
                    </div>
                    
                    <div className="space-y-1.5 flex-1">
                      <h3 className="font-semibold text-lg text-white/90 group-hover:text-primary transition-colors">
                        {char.name}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                        {char.description}
                      </p>
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center">
                        <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                        {char.messageCount.toLocaleString()}
                      </span>
                      {char.isFeatured && (
                        <span className="text-primary/80 font-medium">Featured</span>
                      )}
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
