"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/providers/UserProvider";

export default function SystemSettingsPage() {
  const router = useRouter();
  const { user, refreshProfile } = useUser();
  
  const [isFetching, setIsFetching] = useState(true);

  // Toggle States
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [imageBlurEnabled, setImageBlurEnabled] = useState(false);
  const [favoriteCastAlerts, setFavoriteCastAlerts] = useState(true);
  const [leaveFootprints, setLeaveFootprints] = useState(true);
  const [reservationReminders, setReservationReminders] = useState(true);
  const [appLockEnabled, setAppLockEnabled] = useState(false);
  const [fukuokaTestMode, setFukuokaTestMode] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsFetching(false);
      return;
    }

    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from('sns_profiles')
        .select(`
          notifications_enabled,
          image_blur_enabled,
          favorite_cast_alerts,
          leave_footprints,
          reservation_reminders,
          app_lock_enabled
        `)
        .eq('id', user.id)
        .single();

      if (data && !error) {
        setNotificationsEnabled(data.notifications_enabled ?? true);
        setImageBlurEnabled(data.image_blur_enabled ?? false);
        setFavoriteCastAlerts(data.favorite_cast_alerts ?? true);
        setLeaveFootprints(data.leave_footprints ?? true);
        setReservationReminders(data.reservation_reminders ?? true);
        setAppLockEnabled(data.app_lock_enabled ?? false);
      }

      if (user.role === 'system') {
        const { data: sysData } = await supabase.from('global_app_settings').select('value').eq('key', 'fukuoka_test_mode').maybeSingle();
        if (sysData && sysData.value) {
          setFukuokaTestMode(sysData.value.enabled === true);
        }
      }

      setIsFetching(false);
    };

    fetchSettings();
  }, [user, router]);

  // オートセーブ機能: スイッチを切り替えた瞬間にDBを更新
  const updateSetting = async (key: string, value: boolean) => {
    if (!user) return;
    
    // UIを即座に更新する（楽観的UIアップデート）
    switch (key) {
      case 'notifications_enabled': setNotificationsEnabled(value); break;
      case 'image_blur_enabled': setImageBlurEnabled(value); break;
      case 'favorite_cast_alerts': setFavoriteCastAlerts(value); break;
      case 'leave_footprints': setLeaveFootprints(value); break;
      case 'reservation_reminders': setReservationReminders(value); break;
      case 'app_lock_enabled': setAppLockEnabled(value); break;
    }

    // 裏側でデータベースに送信
    const { error } = await supabase
      .from('sns_profiles')
      .update({ [key]: value })
      .eq('id', user.id);

    if (error) {
      console.error('設定の保存に失敗しました:', error);
      // エラー時の処理（今回は簡易的にログ出力のみ）
    } else {
      // 成功した場合、アプリ全体のグローバル設定情報も裏側で最新に更新しておく
      await refreshProfile();
    }
  };

  const updateSystemSetting = async (key: string, value: boolean) => {
    if (!user || user.role !== 'system') return;

    if (key === 'fukuoka_test_mode') {
      setFukuokaTestMode(value);
      const { error } = await supabase.from('global_app_settings').upsert({
        key: 'fukuoka_test_mode',
        value: { enabled: value }
      });
      if (!error) {
        // Force reload to apply global state changes immediately
        window.location.href = '/';
      } else {
        console.error('システム設定の保存に失敗しました:', error);
      }
    }
  };

  if (isFetching) {
    return <div className="min-h-screen bg-[#F9F9F9]" />;
  }

  // Helper Toggle Component
  const ToggleRow = ({ enabled, onChange, label, desc }: { enabled: boolean, onChange: (val: boolean) => void, label: string, desc?: string }) => (
    <div className="flex items-center justify-between py-5 border-b border-[#E5E5E5] last:border-0">
        <div className="pr-4">
           <div className="text-sm font-medium tracking-widest text-black mb-1">{label}</div>
           {desc && <div className="text-[10px] leading-relaxed text-[#777777] tracking-widest">{desc}</div>}
        </div>
        <button 
            type="button"
            onClick={() => onChange(!enabled)}
            className={`relative flex-shrink-0 inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${enabled ? 'bg-black' : 'bg-[#E5E5E5]'}`}
        >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-300 ${enabled ? 'translate-x-[22px]' : 'translate-x-[2px]'}`} />
        </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9F9F9] flex flex-col font-light">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#E5E5E5] flex items-center px-4 py-4">
        <button onClick={() => router.back()} className="text-black hover:text-[#777777] p-2 -ml-2 transition-colors">
          <ChevronLeft size={24} className="stroke-[1.5]" />
        </button>
        <h1 className="text-sm font-bold tracking-widest absolute left-1/2 -translate-x-1/2">各種設定</h1>
      </header>

      <main className="p-6 pb-20">
        <div className="bg-white border border-[#E5E5E5] px-6">
            <ToggleRow 
                label="プッシュ通知" 
                desc="アプリからの全体的な新着通知を受け取ります。"
                enabled={notificationsEnabled} 
                onChange={(val) => updateSetting('notifications_enabled', val)} 
            />
            <ToggleRow 
                label="画像を隠す（タップで表示）" 
                desc="タイムライン上の一部の画像を自動でぼかし、タップするまで隠します（電車内等で便利です）。"
                enabled={imageBlurEnabled} 
                onChange={(val) => updateSetting('image_blur_enabled', val)} 
            />
            <ToggleRow 
                label="お気に入りキャストの出勤通知" 
                desc="フォロー中のキャストが出勤を登録した際にリアルタイムでお知らせします。"
                enabled={favoriteCastAlerts} 
                onChange={(val) => updateSetting('favorite_cast_alerts', val)} 
            />
            <ToggleRow 
                label="足あと（閲覧履歴）を残す" 
                desc="キャストのプロフィールを閲覧した際、相手に履歴を残します。OFFにすると相手に知られずに閲覧できます。"
                enabled={leaveFootprints} 
                onChange={(val) => updateSetting('leave_footprints', val)} 
            />
            <ToggleRow 
                label="予約リマインド通知" 
                desc="ご予約日の前日と当日２時間前に確認の通知をお送りします。"
                enabled={reservationReminders} 
                onChange={(val) => updateSetting('reservation_reminders', val)} 
            />
            <ToggleRow 
                label="起動時のアプリロック" 
                desc="プライバシー保護のため、アプリを開くたびにご登録の電話番号を要求します。"
                enabled={appLockEnabled} 
                onChange={(val) => updateSetting('app_lock_enabled', val)} 
            />
        </div>

        {user?.role === 'system' && (
          <div className="bg-white border border-[#E5E5E5] px-6 mt-6">
              <ToggleRow 
                  label="福岡限定テストモード" 
                  desc="【システム専用設定】アプリ全体を強制的に福岡エリアのみに限定し、エリア選択を隠します。"
                  enabled={fukuokaTestMode} 
                  onChange={(val) => updateSystemSetting('fukuoka_test_mode', val)} 
              />
          </div>
        )}
      </main>
    </div>
  );
}
