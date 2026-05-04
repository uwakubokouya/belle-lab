const fs = require('fs');
const path = 'src/app/cast/[id]/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. useState に isStoreProfile を追加
const stateTarget = `  const [storeInfo, setStoreInfo] = useState<{ id: string, name: string } | null>(null);`;
const stateReplace = `  const [storeInfo, setStoreInfo] = useState<{ id: string, name: string } | null>(null);
  const [isStoreProfile, setIsStoreProfile] = useState(false);`;

if (content.includes(stateTarget)) {
    content = content.replace(stateTarget, stateReplace);
}

// 2. fetchData の中でのリンク先修正と isStoreProfile 判定追加
const fetchTarget = `      // 1 & 2: sns_profilesの電話番号を使ってprofilesを探し、store_idを把握
      let castPhone = profile?.phone;
      if (!castPhone && storeCast?.login_id) castPhone = storeCast.login_id;
      
      let targetStoreId = storeCast?.store_id;
      if (!targetStoreId && castPhone) {
          const { data: castProfile } = await supabase.from('profiles').select('store_id').eq('username', castPhone).limit(1).maybeSingle();
          if (castProfile?.store_id) {
              targetStoreId = castProfile.store_id;
          }
      }

      // 3: 取得した store_id の店舗名を表示
      if (targetStoreId) {
          // store_id は店舗アカウントのIDそのものなので、直接SNSプロフィールを引く
          const { data: snsStore } = await supabase.from('sns_profiles').select('id, name').eq('id', targetStoreId).maybeSingle();
          if (snsStore) {
              resolvedStoreName = snsStore.name;
              resolvedStoreId = snsStore.id;
          } else {
              // SNSプロフィールが見つからない場合は profiles から full_name を取得
              const { data: storeProfile } = await supabase.from('profiles').select('full_name, username').eq('id', targetStoreId).maybeSingle();
              if (storeProfile) {
                  resolvedStoreName = storeProfile.full_name || storeProfile.username;
                  resolvedStoreId = targetStoreId;
              }
          }
      }
      
      if (resolvedStoreName && resolvedStoreId) {
          setStoreInfo({ id: resolvedStoreId, name: resolvedStoreName });
      } else {
          setStoreInfo(null);
      }`;

const fetchReplace = `      // 1 & 2: sns_profilesの電話番号を使ってprofilesを探し、store_idを把握
      let castPhone = profile?.phone;
      if (!castPhone && storeCast?.login_id) castPhone = storeCast.login_id;
      
      let targetStoreId = storeCast?.store_id;
      if (!targetStoreId && castPhone) {
          const { data: castProfile } = await supabase.from('profiles').select('store_id').eq('username', castPhone).limit(1).maybeSingle();
          if (castProfile?.store_id) {
              targetStoreId = castProfile.store_id;
          }
      }

      // 3: 取得した store_id を使って店舗の sns_profiles を特定しリンク先を修正
      if (targetStoreId) {
          // profiles から店舗アカウントを取得し、その電話番号で sns_profiles を引く（タイムラインと同じ飛び先にするため）
          const { data: storeProfile } = await supabase.from('profiles').select('username, full_name').eq('id', targetStoreId).maybeSingle();
          if (storeProfile) {
              const { data: snsStore } = await supabase.from('sns_profiles').select('id, name').eq('phone', storeProfile.username).maybeSingle();
              if (snsStore) {
                  resolvedStoreName = snsStore.name;
                  resolvedStoreId = snsStore.id; // 正しい sns_profiles の ID
              } else {
                  resolvedStoreName = storeProfile.full_name || storeProfile.username;
                  resolvedStoreId = targetStoreId;
              }
          }
      }
      
      if (resolvedStoreName && resolvedStoreId) {
          setStoreInfo({ id: resolvedStoreId, name: resolvedStoreName });
      } else {
          setStoreInfo(null);
      }

      // キャスト情報がなければ店舗アカウントと判定する
      setIsStoreProfile(!storeCast);`;

if (content.includes(fetchTarget)) {
    content = content.replace(fetchTarget, fetchReplace);
}

// 3. UIの非表示
// CAST DATA
const castDataTarget = `<div className="flex gap-2">
                    <button onClick={() => setShowPreferencesModal(true)} className="px-4 py-1.5 mb-2 border border-[#E5E5E5] text-black bg-white hover:bg-[#F9F9F9] transition-colors flex flex-col items-center justify-center tracking-widest gap-0.5">
                        <span className="text-[10px] font-medium leading-none tracking-[0.1em]">CAST</span>
                        <span className="text-[8px] font-bold leading-none tracking-[0.1em]">DATA</span>
                    </button>
                    <button 
                      onClick={handleFollow}`;
const castDataReplace = `<div className="flex gap-2">
                    {!isStoreProfile && (
                        <button onClick={() => setShowPreferencesModal(true)} className="px-4 py-1.5 mb-2 border border-[#E5E5E5] text-black bg-white hover:bg-[#F9F9F9] transition-colors flex flex-col items-center justify-center tracking-widest gap-0.5">
                            <span className="text-[10px] font-medium leading-none tracking-[0.1em]">CAST</span>
                            <span className="text-[8px] font-bold leading-none tracking-[0.1em]">DATA</span>
                        </button>
                    )}
                    <button 
                      onClick={handleFollow}`;
content = content.replace(castDataTarget, castDataReplace);

// Schedule Tab
const scheduleTabTarget = `<button
                onClick={() => setActiveTab('schedule')}
                className={\`flex-1 py-4 text-xs tracking-widest transition-colors \${
                    activeTab === 'schedule' 
                        ? 'text-black font-bold border-b-2 border-black' 
                        : 'text-[#999999] font-light hover:text-black'
                }\`}
            >
                出勤情報
            </button>`;
const scheduleTabReplace = `{!isStoreProfile && (
            <button
                onClick={() => setActiveTab('schedule')}
                className={\`flex-1 py-4 text-xs tracking-widest transition-colors \${
                    activeTab === 'schedule' 
                        ? 'text-black font-bold border-b-2 border-black' 
                        : 'text-[#999999] font-light hover:text-black'
                }\`}
            >
                出勤情報
            </button>
            )}`;
content = content.replace(scheduleTabTarget, scheduleTabReplace);

// Reserve Button
const reserveBtnRegex = /(<div className="fixed bottom-0 left-0 right-0 bg-white border-t border-\[#E5E5E5\] p-4 flex justify-center pb-24 z-40 max-w-md mx-auto">[\s\S]*?このキャストを予約する\s*<\/button>\s*<\/div>)/;
const match = content.match(reserveBtnRegex);
if (match) {
    const reserveBtnTarget = match[1];
    const reserveBtnReplace = `{!isStoreProfile && (\n      ${reserveBtnTarget.replace(/\n/g, '\n      ')}\n      )}`;
    content = content.replace(reserveBtnTarget, reserveBtnReplace);
}

fs.writeFileSync(path, content, 'utf8');
console.log("Done patching store profile UI");
