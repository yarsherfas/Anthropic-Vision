import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";

type Mode = "login" | "signup" | "forgot";

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        toast({ title: "Account created", description: "You're now signed in." });
      } else if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else if (mode === "forgot") {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
        setSent(true);
      }
    } catch (err: any) {
      toast({
        title: "Something went wrong",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      {/* Background glow */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
            <span className="text-primary font-serif italic font-bold text-2xl">A</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white/95">
            {mode === "login" ? "Welcome back" : mode === "signup" ? "Create account" : "Reset password"}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            {mode === "login"
              ? "Sign in to continue your conversations"
              : mode === "signup"
              ? "Join Aura and discover AI companions"
              : "We'll send a reset link to your email"}
          </p>
        </div>

        <div className="bg-card border border-white/5 rounded-2xl p-8 shadow-2xl">
          <AnimatePresence mode="wait">
            {sent && mode === "forgot" ? (
              <motion.div
                key="sent"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-4 space-y-3"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <p className="text-white/90 font-medium">Check your inbox</p>
                <p className="text-muted-foreground text-sm">We sent a password reset link to {email}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-4 text-primary hover:bg-primary/10"
                  onClick={() => { setMode("login"); setSent(false); }}
                >
                  Back to sign in
                </Button>
              </motion.div>
            ) : (
              <motion.form
                key={mode}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white/70 text-sm font-medium">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="pl-10 bg-background border-white/10 focus:border-primary/50 focus:ring-primary/50 text-white placeholder:text-muted-foreground/50"
                    />
                  </div>
                </div>

                {mode !== "forgot" && (
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white/70 text-sm font-medium">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder={mode === "signup" ? "At least 6 characters" : "••••••••"}
                        className="pl-10 pr-10 bg-background border-white/10 focus:border-primary/50 focus:ring-primary/50 text-white placeholder:text-muted-foreground/50"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

                {mode === "login" && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setMode("forgot")}
                      className="text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-medium text-base shadow-[0_0_20px_rgba(212,132,90,0.2)] transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : mode === "login" ? (
                    "Sign in"
                  ) : mode === "signup" ? (
                    "Create account"
                  ) : (
                    "Send reset link"
                  )}
                </Button>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/5" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-2 bg-card text-muted-foreground">
                      {mode === "login" ? "No account?" : "Already a member?"}
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setMode(mode === "login" ? "signup" : "login")}
                  className="w-full h-11 border border-white/5 hover:bg-white/5 text-white/80 rounded-xl font-medium"
                >
                  {mode === "login" ? "Create an account" : "Sign in instead"}
                </Button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
}
