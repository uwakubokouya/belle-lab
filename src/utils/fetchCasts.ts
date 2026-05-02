import { supabase } from "@/lib/supabase";
import { fetchBusinessEndTime, getLogicalBusinessDate } from "@/utils/businessTime";

export const fetchStoreCasts = async (storeId: string) => {
  const { data: activeCasts } = await supabase
    .from('casts')
    .select('*')
    .eq('store_id', storeId)
    .eq('status', 'active');
  
  if (!activeCasts || activeCasts.length === 0) {
      return [];
  }

  // SNSのプロフィール画像（sns_profilesテーブル）を取得して結合する
  const phones = activeCasts.map(c => c.login_id).filter(Boolean);
  let profilesData: any[] = [];
  
  if (phones.length > 0) {
      const { data: pData } = await supabase
        .from('sns_profiles')
        .select('id, phone, avatar_url, name, bio')
        .in('phone', phones);
      if (pData) profilesData = pData;
  }

  let prefsData: any[] = [];
  if (profilesData.length > 0) {
      const profileIds = profilesData.map(p => p.id);
      const { data: prefDataRes } = await supabase
        .from('sns_user_preferences')
        .select('*')
        .in('user_id', profileIds);
      if (prefDataRes) prefsData = prefDataRes;
  }
  
  // 本日の日付（YYYY-MM-DD）を取得
  const now = new Date();
  const businessEndTime = await fetchBusinessEndTime(supabase);
  const todayStr = getLogicalBusinessDate(now, businessEndTime.hour, businessEndTime.min);
  
  const { data: availabilityData } = await supabase
     .rpc('get_public_availability', {
         p_store_id: storeId,
         p_date: todayStr
     });
     
  const availabilityMap = new Map();
  if (availabilityData) {
     availabilityData.forEach((row: any) => {
         if (!availabilityMap.has(row.cast_id)) {
             availabilityMap.set(row.cast_id, {
                 shift_start: row.shift_start, 
                 shift_end: row.shift_end, 
                 attendance_status: row.attendance_status,
                 next_shift_date: row.next_shift_date,
                 bookings: []
             });
         }
         if (row.booked_start) {
             availabilityMap.get(row.cast_id).bookings.push({ start: row.booked_start, end: row.booked_end });
         }
     });
  }

  const next7DaysPromises = Array.from({length: 14}, async (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i + 1); // 明日からの14日間
      const dateStr = d.toLocaleDateString('sv-SE').split('T')[0];
      const { data } = await supabase.rpc('get_public_availability', {
         p_store_id: storeId,
         p_date: dateStr
      });
      return { dateStr, data };
  });
  
  const next7DaysResults = await Promise.all(next7DaysPromises);
  
  const nextShiftMap = new Map();
  next7DaysResults.forEach((result) => {
      if (result.data) {
          result.data.forEach((row: any) => {
              const hasValidShift = row.attendance_status !== 'absent' && (!!row.shift_start || !!row.shift_end);
              if (hasValidShift && !nextShiftMap.has(row.cast_id)) {
                  nextShiftMap.set(row.cast_id, result.dateStr);
              }
          });
      }
  });

  const mergedCasts = activeCasts.map(cast => {
      const profile = profilesData.find(p => p.phone === cast.login_id);
      let isWorkingToday = availabilityMap.has(cast.id);
          
      let slotsLeft = null;
      let nextAvailableTime = null;
      let statusText = null;
      
      if (isWorkingToday) {
         const avail = availabilityMap.get(cast.id);
         
         let isAbsent = avail.attendance_status === 'absent';
         const hasShift = !!avail.shift_start || !!avail.shift_end;
         
         const now = new Date();
         const currentHour = now.getHours();
         const currentMin = now.getMinutes();
         const currentMinTotal = currentHour * 60 + currentMin;

         if (isAbsent || !hasShift) {
             if (isAbsent) {
                 statusText = "お休み";
             } else {
                 statusText = null;
             }
             isWorkingToday = false;
             const nextDateRaw = avail.next_shift_date || nextShiftMap.get(cast.id);
             if (nextDateRaw) {
                 const d = new Date(nextDateRaw);
                 nextAvailableTime = `次回出勤: ${d.getMonth() + 1}/${d.getDate()}`;
             } else {
                 nextAvailableTime = "次回出勤: 未定";
             }
         } else {
             statusText = "本日出勤中";
             const eParts = avail.shift_end.split(':');
             let eH = parseInt(eParts[0]);
             if (eH < 6) eH += 24;
             const eMin = eH * 60 + parseInt(eParts[1] || '0');
             const adjCurrentMin = currentHour < 6 ? currentHour * 60 + 24 * 60 + currentMin : currentMinTotal;
             if (adjCurrentMin >= eMin) {
                 statusText = "受付終了";
                 const nextDateRaw = avail.next_shift_date || nextShiftMap.get(cast.id);
                 if (nextDateRaw) {
                     const d = new Date(nextDateRaw);
                     nextAvailableTime = `次回出勤: ${d.getMonth() + 1}/${d.getDate()}`;
                 } else {
                     nextAvailableTime = "次回出勤: 未定";
                 }
                 isWorkingToday = true; // 表示上の都合でtrueにしておく
             }
         }
         
         if (statusText === "本日出勤中") {
             let ssP = avail.shift_start.split(':');
             let seP = avail.shift_end.split(':');
             let ssH = parseInt(ssP[0]); if(ssH < 6) ssH += 24;
             let seH = parseInt(seP[0]); if(seH < 6) seH += 24;
             const ssM = ssH * 60 + parseInt(ssP[1] || '0');
             const seM = seH * 60 + parseInt(seP[1] || '0');
             const am = currentHour < 6 ? currentHour * 60 + 24 * 60 + currentMin : currentMinTotal;
             
             let cursorM = Math.max(am, ssM);
             
             const parsedBookings = avail.bookings.map((b: any) => {
                 let bsH = parseInt(b.start.split(':')[0]); if(bsH < 6) bsH += 24;
                 let beH = parseInt(b.end.split(':')[0]); if(beH < 6) beH += 24;
                 return {
                     startM: bsH * 60 + parseInt(b.start.split(':')[1] || '0'),
                     endM: beH * 60 + parseInt(b.end.split(':')[1] || '0') + 10
                 };
             }).sort((a: any, b: any) => a.startM - b.startM);

             const MIN_GAP = 50;
             let bumped = true;
             while (bumped && cursorM < seM) {
                 bumped = false;
                 for (const b of parsedBookings) {
                     if (b.startM < (cursorM + MIN_GAP) && b.endM > cursorM) {
                         if (cursorM < b.endM) {
                             cursorM = b.endM;
                             bumped = true;
                         }
                     }
                 }
             }

             if (cursorM + MIN_GAP > seM) {
                  if (am >= seM) { statusText = "受付終了"; } else { statusText = "ご予約完売"; }
                 const nextDateRaw = avail.next_shift_date || nextShiftMap.get(cast.id);
                 if (nextDateRaw) {
                     const dt = new Date(nextDateRaw);
                     nextAvailableTime = `次回出勤: ${dt.getMonth() + 1}/${dt.getDate()}`;
                 } else {
                     nextAvailableTime = "次回出勤: 未定";
                 }
             } else {
                 if (cursorM <= am) {
                     nextAvailableTime = "待機中";
                 } else {
                     let h = Math.floor(cursorM / 60);
                     let m = cursorM % 60;
                     if (h >= 24) h -= 24;
                     nextAvailableTime = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                 }
             }
             
             if (avail.shift_start && avail.shift_end) {
                 const sH = parseInt(avail.shift_start.split(':')[0]);
                 const eH = parseInt(avail.shift_end.split(':')[0]) || 24;
                 const totalSlots = (eH <= sH ? eH + 24 - sH : eH - sH);
                 slotsLeft = Math.max(0, totalSlots - avail.bookings.length);
             }
         }
      } else {
         const nextDateRaw = nextShiftMap.get(cast.id);
         if (nextDateRaw) {
             const d = new Date(nextDateRaw);
             nextAvailableTime = `次回出勤: ${d.getMonth() + 1}/${d.getDate()}`;
         } else {
             nextAvailableTime = "次回出勤: 未定";
         }
      }
      
      const nowTs = new Date();
      let isNew = false;
      if (cast.join_date) {
          const joinDate = new Date(cast.join_date);
          const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
          if (nowTs.getTime() - joinDate.getTime() < thirtyDaysMs) {
              isNew = true;
          }
      }

      const pref = profile ? prefsData.find(pr => pr.user_id === profile.id) : null;

      return {
          ...cast,
          sns_avatar_url: profile?.avatar_url || null,
          sns_bio: profile?.bio || null,
          sns_name: profile?.name || null,
          sns_profile_id: profile?.id || null,
          preferences: pref || null,
          isWorkingToday,
          slotsLeft,
          nextAvailableTime,
          statusText,
          isNew
      };
  });

  // 並び順： 新人 > 待機中 > 次回早い順 > ご予約完売 > 受付終了 > お休み > 次回出勤日の近い順 > シフト未定
  mergedCasts.sort((a: any, b: any) => {
      const getScore = (c: any) => {
          let score = 0;
          
          if (c.isNew) {
              score += 1000000; // 新人は常に最優先
          }
          
          let nextShiftScore = 0;
          if (c.nextAvailableTime && c.nextAvailableTime.includes('次回出勤: ') && !c.nextAvailableTime.includes('未定')) {
              const match = c.nextAvailableTime.match(/次回出勤: (\d+)\/(\d+)/);
              if (match) {
                  const m = parseInt(match[1]);
                  const d = parseInt(match[2]);
                  const currentMonth = new Date().getMonth() + 1;
                  let targetMonth = m;
                  if (targetMonth < currentMonth - 2) targetMonth += 12;
                  const daysApprox = targetMonth * 31 + d;
                  nextShiftScore = 1000 - daysApprox; 
                  if (nextShiftScore < 0) nextShiftScore = 0;
              }
          }
          
          if (c.statusText === '本日出勤中') {
              if (c.nextAvailableTime === '待機中') {
                  score += 500000;
              } else {
                  score += 400000;
                  if (c.nextAvailableTime && c.nextAvailableTime.includes && c.nextAvailableTime.includes(':') && !c.nextAvailableTime.includes('次回出勤')) {
                      const parts = c.nextAvailableTime.split(':');
                      let h = parseInt(parts[0]);
                      const m = parseInt(parts[1]);
                      if (!isNaN(h) && !isNaN(m)) {
                          if (h < 6) h += 24;
                          const minutes = h * 60 + m;
                          score += (2000 - minutes);
                      }
                  }
              } 
          } else if (c.statusText === 'ご予約完売') {
              score += 300000 + nextShiftScore;
          } else if (c.statusText === '受付終了') {
              score += 250000 + nextShiftScore;
          } else if (c.statusText === 'お休み') {
              score += 200000 + nextShiftScore;
          } else {
              if (nextShiftScore > 0) {
                  score += 100000 + nextShiftScore;
              } else {
                  score += 0;
              }
          }
          
          return score;
      };
      return getScore(b) - getScore(a);
  });

  return mergedCasts;
};
