import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function SigningOffPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      navigate("/register", { replace: true });
    }, 2200);

    return () => window.clearTimeout(timeoutId);
  }, [navigate]);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(31,118,111,0.16),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(245,158,11,0.14),_transparent_22%)]" />
      <div className="relative w-full max-w-2xl text-center">
        <p className="text-sm uppercase tracking-[0.28em] text-primary/75">Stride</p>
        <h1 className="mt-6 text-5xl font-semibold tracking-tight text-foreground sm:text-6xl">
          Siignig OFF
        </h1>
        <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-muted-foreground sm:text-base">
          Your account has been removed from Stride. We are sending you gently back to the register page.
        </p>
      </div>
    </main>
  );
}
