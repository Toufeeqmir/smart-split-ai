import React , {useState, useEffect } from "react";
import {Link, useNavigate, useLocation} from "react-router-dom";
import api from "../services/api";

const RESEND_COOLDOWN = 60; //seconds

export default function VerifyOtp(){
     const navigate = useNavigate();
     const location = useLocation();

     //email arrives via navigate state(from register or login redirects)

     const [email, setEmail] = useState(location.state?.email || "");
     const [otp, setOtp] = useState("");
     const [loading, setLoading] = useState(false);
     const [resending, setResending] = useState(false);
     const [error, setError]  = useState("");
     const [info, setInfo] = useState("");
     const [cooldown, setCooldown] = useState(0);

     useEffect(() =>{
        if(cooldown <= 0) return undefined;
        const timer = setInterval(() => setCooldown((c) => c -1), 1000);
        return () => clearInterval(timer);
     }, [cooldown]);

     const handleVerify = async(e) =>{
         e.preventDefault();
         setError("");
          setInfo("");
          setLoading(true);

          try{
             const { data } = await api.post("/auth/verify-otp", {email, otp});
             localStorage.setItem("token", data.token);
             localStorage.setItem("user", JSON.stringify(data.user));
             navigate("/");
          }catch(err){
            setError(err.response?.data?.message || "Verification failed. Please try again");
          }finally{
            setLoading(false);
          }
     };

     const handleResend = async() =>{
         if(!email){
             setError("Entetr you email first");
             return;
         }
         setError("");
         setInfo("");
         setResending(true);

         try{
            await api.post("/auth/resend-otp", { email });
            setInfo("A new OTP has been sent to your email");
            setCooldown(RESEND_COOLDOWN);
         }catch(err){
            setError(err.response?.data.message || "Could not resend OTP. please try again later");
         }finally{
             setResending(false);
         }
     };

 return (
    <div className="mx-auto flex min-h-[calc(100vh-160px)] max-w-5xl items-center">
      <div className="grid w-full overflow-hidden rounded-[32px] border border-white/60 bg-white/85 shadow-panel backdrop-blur-xl lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative overflow-hidden bg-gradient-to-br from-brand-ink via-brand-slate to-slate-900 px-8 py-10 text-white sm:px-10">
          <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-brand-gold/20 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-52 w-52 rounded-full bg-brand-teal/20 blur-3xl" />

          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/65">
              Almost there
            </p>
            <h2 className="mt-4 text-4xl font-semibold">
              Confirm it&apos;s really you.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-7 text-white/78">
              We sent a 6-digit code to your email. Enter it to verify your
              account and finish signing in.
            </p>
          </div>
        </section>

        <section className="px-6 py-8 sm:px-8 sm:py-10">
          <p className="soft-label">Account access</p>
          <h3 className="mt-2 text-3xl font-semibold text-slate-950">Verify Email</h3>
          <p className="mt-2 text-sm text-slate-500">
            Enter the OTP sent to your inbox. It expires in 5 minutes.
          </p>

          <form onSubmit={handleVerify} className="mt-8 space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="soft-label">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="form-input"
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="otp" className="soft-label">
                OTP
              </label>
              <input
                id="otp"
                name="otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                required
                className="form-input text-center text-lg tracking-[0.4em]"
                placeholder="000000"
              />
            </div>

            {error && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}

            {info && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {info}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="inline-flex w-full items-center justify-center rounded-2xl bg-brand-ink px-4 py-3 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-brand-slate disabled:opacity-60"
            >
              {loading ? "Verifying..." : "Verify Email"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">
            Didn&apos;t get the code?{" "}
            <button
              type="button"
              onClick={handleResend}
              disabled={resending || cooldown > 0}
              className="font-semibold text-brand-teal hover:underline disabled:cursor-not-allowed disabled:text-slate-400 disabled:no-underline"
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : resending ? "Resending..." : "Resend OTP"}
            </button>
          </div>

          <p className="mt-4 text-center text-sm text-slate-600">
            Wrong email?{" "}
            <Link to="/login" className="font-semibold text-brand-teal hover:underline">
              Back to login
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}