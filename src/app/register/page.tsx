"use client";
import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useUser } from "@/providers/UserProvider";

export default function RegisterPage() {
  const router = useRouter();
  const { refreshProfile } = useUser();
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !name || !password) return;

    setIsLoading(true);
    setErrorMsg("");

    // 1. 既に同じ電話番号が使われているかチェックする
    const { data: existingUser } = await supabase
      .from('sns_profiles')
      .select('id')
      .eq('phone', phone)
      .maybeSingle();

    if (existingUser) {
      setErrorMsg("この電話番号はすでに登録されています。ログイン画面よりログインしてください。");
      setIsLoading(false);
      return;
    }

    const dummyEmail = `${phone}@sns.local`;

    // 2. Auth SignUp
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: dummyEmail,
      password: password,
    });

    if (authError || !authData.user) {
      if (authError?.message === 'User already registered' || authError?.status === 422) {
         setErrorMsg("この電話番号はすでに登録されています。ログイン画面からログインしてください。");
      } else {
         setErrorMsg(authError?.message || "登録に失敗しました。");
      }
      setIsLoading(false);
      return;
    }

    // 3. Insert Profile
    const { error: profileError } = await supabase
      .from('sns_profiles')
      .insert({
        id: authData.user.id,
        phone: phone,
        name: name,
        role: "customer"
      });

    if (profileError) {
      // Cleanup fallback if profile creation fails? Handled manually or via webhook usually, keeping it simple.
      console.error(profileError);
      setErrorMsg("プロフィールの作成に失敗しました。番号が既に使われている可能性があります。");
      setIsLoading(false);
      return;
    }

    await refreshProfile();

    sessionStorage.removeItem('authRedirect');
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-white flex flex-col px-8 pt-16 font-light pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-normal tracking-widest uppercase mb-2">Register</h1>
        <p className="text-sm text-[#777777]">新規会員登録</p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 border border-red-500 bg-red-50 text-red-600 text-xs tracking-widest">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-6">
        <div className="space-y-1 block">
          <label className="text-[10px] uppercase tracking-widest text-[#777777]">Name</label>
          <input 
            type="text"
            required
            autoComplete="off"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full border-b border-[#E5E5E5] pb-2 text-lg outline-none focus:border-black transition-colors bg-transparent rounded-none"
            placeholder="お名前"
          />
        </div>

        <div className="space-y-1 block">
          <label className="text-[10px] uppercase tracking-widest text-[#777777]">Phone Number</label>
          <input 
            type="tel"
            required
            autoComplete="off"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className="w-full border-b border-[#E5E5E5] pb-2 text-lg outline-none focus:border-black transition-colors bg-transparent rounded-none"
            placeholder="ご自身の携帯電話番号"
          />
        </div>

        <div className="space-y-1 block">
          <label className="text-[10px] uppercase tracking-widest text-[#777777]">Password</label>
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              autoComplete="new-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border-b border-[#E5E5E5] pb-2 text-lg outline-none focus:border-black transition-colors bg-transparent rounded-none pr-10"
              placeholder="お好きなパスワード（6文字以上）"
            />
            <button 
              type="button" 
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-0 top-1/2 -translate-y-[80%] text-[#777777] p-2 hover:text-black transition-colors"
            >
              {showPassword ? <EyeOff size={18} strokeWidth={1.5} /> : <Eye size={18} strokeWidth={1.5} />}
            </button>
          </div>
        </div>


        <div className="pt-8">
            <button disabled={isLoading} type="submit" className="w-full premium-btn py-4 flex items-center justify-center gap-2 group disabled:opacity-50">
              <span className="tracking-widest">{isLoading ? "登録中..." : "登録してはじめる"}</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
        </div>
      </form>

      <div className="mt-8 text-center text-sm">
        <Link href="/login" className="block mt-2 underline tracking-widest font-normal hover:text-[#777777] transition-colors">
          ログイン画面へ戻る
        </Link>
      </div>
    </div>
  );
}
