import { Link } from "wouter";
import { motion } from "framer-motion";
import { MessageSquare, Sparkles, TrendingUp, Users } from "lucide-react";
import { useGetCharacterStats, useGetFeaturedCharacters, useListCategories } from "@workspace/api-client-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const { data: stats } = useGetCharacterStats();
  const { data: featuredCharacters } = useGetFeaturedCharacters();
  const { data: categories } = useListCategories();

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 space-y-24">
        
        {/* Hero Section */}
        <section className="relative flex flex-col items-center justify-center text-center py-20 space-y-8">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background blur-2xl" />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6 max-w-3xl"
          >
            <Badge variant="outline" className="bg-white/5 border-white/10 text-primary px-4 py-1.5 rounded-full text-sm">
              <Sparkles className="w-4 h-4 mr-2" />
              The next generation of AI companionship
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white/90">
              Conversations with <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">soul.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Discover beautifully crafted AI characters with deep personalities, memories, and distinct voices.
            </p>
            
            <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/characters"
                className="w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground rounded-full font-medium text-lg transition-all hover:bg-primary/90 hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(212,132,90,0.3)]"
              >
                Explore Characters
              </Link>
              <Link 
                href="/chats"
                className="w-full sm:w-auto px-8 py-4 bg-white/5 text-white border border-white/10 rounded-full font-medium text-lg transition-all hover:bg-white/10 active:scale-95"
              >
                Your Chats
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          {stats && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 1 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-16 border-t border-white/5 w-full max-w-4xl"
            >
              {[
                { label: "Characters", value: stats.totalCharacters },
                { label: "Conversations", value: stats.totalChats },
                { label: "Messages Exchanged", value: stats.totalMessages },
                { label: "Featured Personas", value: stats.featuredCount }
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col items-center space-y-2">
                  <span className="text-3xl font-bold text-white/80">{stat.value.toLocaleString()}</span>
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                </div>
              ))}
            </motion.div>
          )}
        </section>

        {/* Featured Characters */}
        <section className="space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-primary" />
                Featured Companions
              </h2>
              <p className="text-muted-foreground text-sm">Curated characters with exceptional depth.</p>
            </div>
            <Link href="/characters" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
              View all →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCharacters?.map((char, i) => (
              <motion.div
                key={char.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
              >
                <Link href={`/characters/${char.id}`}>
                  <div className="group relative overflow-hidden rounded-2xl bg-card border border-white/5 p-6 transition-all hover:bg-white/[0.02] hover:border-white/10 hover:shadow-2xl hover:-translate-y-1">
                    <div className="flex items-start justify-between mb-4">
                      <Avatar className="w-16 h-16 border-2 border-background shadow-xl">
                        <AvatarImage src={char.avatarUrl || undefined} className="object-cover" />
                        <AvatarFallback className="bg-primary/20 text-primary text-xl font-serif">
                          {char.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <Badge variant="secondary" className="bg-white/5 text-muted-foreground border-none">
                        {char.category}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg text-white/90 group-hover:text-primary transition-colors">
                        {char.name}
                      </h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {char.description}
                      </p>
                    </div>
                    
                    <div className="mt-6 flex items-center text-xs text-muted-foreground/70 font-medium">
                      <MessageSquare className="w-4 h-4 mr-1.5" />
                      {char.messageCount.toLocaleString()} messages
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Categories */}
        <section className="space-y-8">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
              <Users className="w-6 h-6 text-primary" />
              Browse by Category
            </h2>
            <p className="text-muted-foreground text-sm">Find exactly who you're looking for.</p>
          </div>

          <div className="flex flex-wrap gap-3">
            {categories?.map((cat) => (
              <Link key={cat.id} href={`/characters?category=${cat.slug}`}>
                <div className="px-5 py-3 rounded-xl bg-card border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all cursor-pointer flex items-center gap-3 group">
                  <span className="font-medium text-white/80 group-hover:text-white transition-colors">{cat.name}</span>
                  <span className="text-xs bg-white/5 text-muted-foreground px-2 py-1 rounded-md">
                    {cat.characterCount}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
