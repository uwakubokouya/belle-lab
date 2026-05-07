"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, BarChart3, Bell, MessageSquare, ChevronRight, Settings } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/providers/UserProvider";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user } = useUser();

  if (!user?.is_admin) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white tracking-widest text-sm">アクセス権限がありません</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-light selection:bg-white selection:text-black">
      <header className="sticky top-0 z-40 bg-black border-b border-[#333] flex items-center px-4 py-4">
        <button onClick={() => router.push('/mypage')} className="text-white hover:text-[#AAA] p-2 -ml-2 transition-colors">
          <ChevronLeft size={24} className="stroke-[1.5]" />
        </button>
        <h1 className="text-sm font-bold tracking-widest absolute left-1/2 -translate-x-1/2 uppercase">Admin Dashboard</h1>
      </header>

      <main className="p-6">
        <div className="mb-10">
          <h2 className="text-2xl font-normal tracking-[0.2em] uppercase mb-2">Management</h2>
          <p className="text-xs text-[#777] tracking-widest">運営プラットフォーム管理</p>
        </div>

        <div className="grid gap-4">
          <Link href="/admin/analytics" className="group border border-[#333] bg-[#111] p-6 hover:border-white transition-all duration-300 relative overflow-hidden">
            <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]" />
            <div className="relative z-10 flex items-center justify-between group-hover:text-black transition-colors duration-300">
              <div className="flex items-center gap-4">
                <BarChart3 size={24} className="stroke-[1.5]" />
                <div>
                  <h3 className="text-sm font-bold tracking-widest">アクセス解析</h3>
                  <p className="text-[10px] text-[#777] group-hover:text-[#555] tracking-widest mt-1">全体のPVや予約推移を確認</p>
                </div>
              </div>
              <ChevronRight size={20} className="stroke-[1.5]" />
            </div>
          </Link>

          {user.role !== 'store' && (
            <Link href="/admin/announcement" className="group border border-[#333] bg-[#111] p-6 hover:border-white transition-all duration-300 relative overflow-hidden">
              <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]" />
              <div className="relative z-10 flex items-center justify-between group-hover:text-black transition-colors duration-300">
                <div className="flex items-center gap-4">
                  <Bell size={24} className="stroke-[1.5]" />
                  <div>
                    <h3 className="text-sm font-bold tracking-widest">お知らせ配信</h3>
                    <p className="text-[10px] text-[#777] group-hover:text-[#555] tracking-widest mt-1">ユーザーや店舗への通知管理</p>
                  </div>
                </div>
                <ChevronRight size={20} className="stroke-[1.5]" />
              </div>
            </Link>
          )}

          <Link href="/admin/feedback" className="group border border-[#333] bg-[#111] p-6 hover:border-white transition-all duration-300 relative overflow-hidden">
            <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]" />
            <div className="relative z-10 flex items-center justify-between group-hover:text-black transition-colors duration-300">
              <div className="flex items-center gap-4">
                <MessageSquare size={24} className="stroke-[1.5]" />
                <div>
                  <h3 className="text-sm font-bold tracking-widest">ご意見一覧</h3>
                  <p className="text-[10px] text-[#777] group-hover:text-[#555] tracking-widest mt-1">お客様からのフィードバック確認</p>
                </div>
              </div>
              <ChevronRight size={20} className="stroke-[1.5]" />
            </div>
          </Link>

          <Link href="/mypage/reviews" className="group border border-[#333] bg-[#111] p-6 hover:border-white transition-all duration-300 relative overflow-hidden">
            <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]" />
            <div className="relative z-10 flex items-center justify-between group-hover:text-black transition-colors duration-300">
              <div className="flex items-center gap-4">
                <Settings size={24} className="stroke-[1.5]" />
                <div>
                  <h3 className="text-sm font-bold tracking-widest">口コミ管理</h3>
                  <p className="text-[10px] text-[#777] group-hover:text-[#555] tracking-widest mt-1">口コミの承認・非承認管理</p>
                </div>
              </div>
              <ChevronRight size={20} className="stroke-[1.5]" />
            </div>
          </Link>

        </div>
        
        <div className="mt-12 text-center text-[10px] text-[#555] tracking-widest uppercase">
          <p>Crownia Admin System v1.0</p>
        </div>
      </main>
    </div>
  );
}
