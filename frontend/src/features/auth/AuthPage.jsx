import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../context/AuthContext";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

export default function AuthPage() {
  const isLogin = useLocation().pathname === "/login";
  const { login, register, loading } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      if (isLogin) {
        await login({ email: form.email, password: form.password });
      } else {
        await register(form);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-[1.08fr_0.92fr]">
      <section className="relative hidden min-h-screen overflow-hidden lg:block">
        <img
          src="https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1600&q=85"
          alt="Minimal workspace with desk and natural light"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-950/35" />

        <div className="absolute inset-x-0 bottom-0 p-12 text-white">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-white/15 backdrop-blur">
            <CheckCircle2 className="h-6 w-6" />
          </div>

          <p className="max-w-xl text-4xl font-semibold leading-tight">
            Turn focused work into visible progress.
          </p>

          <p className="mt-4 max-w-md text-sm leading-6 text-white/80">
            Plan your day, finish intentionally, and earn achievement points with every completed task.
          </p>
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-md">
          <div className="mb-10">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-soft lg:hidden">
              <CheckCircle2 className="h-6 w-6" />
            </div>

            <p className="text-sm font-medium uppercase tracking-[0.18em] text-primary">
              Stride
            </p>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              {isLogin ? "Welcome back" : "Create your account"}
            </h1>

            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              {isLogin
                ? "Sign in to organize your day and keep your score moving."
                : "Build discipline one completed task at a time."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="h-12 rounded-lg bg-transparent"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                className="h-12 rounded-lg bg-transparent"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                minLength={6}
                required
                className="h-12 rounded-lg bg-transparent"
              />
            </div>

            <Button type="submit" className="h-12 w-full rounded-lg" disabled={loading}>
              {loading ? "Please wait..." : isLogin ? "Login" : "Register"}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            {isLogin ? "New here?" : "Already have an account?"}{" "}
            <Link to={isLogin ? "/register" : "/login"} className="font-medium text-primary">
              {isLogin ? "Create account" : "Login"}
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
