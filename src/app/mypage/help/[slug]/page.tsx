"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";

// ----------------------------------------------------
// 各種コンテンツコンポーネント
// ----------------------------------------------------

const SystemContent = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
        <section>
            <div className="bg-black text-white text-center py-2 font-bold tracking-widest text-sm border border-black">
                通常料金
            </div>
            <div className="bg-white border-x border-[#E5E5E5]">
                {[
                    { time: "40min", price: "18,000yen" },
                    { time: "60min", price: "23,000yen" },
                    { time: "80min", price: "30,000yen" },
                    { time: "100min", price: "40,000yen" },
                    { time: "120min", price: "53,000yen" },
                ].map((row, idx) => (
                    <div key={idx} className="flex border-b border-[#E5E5E5] text-sm tracking-widest">
                        <div className="w-1/2 text-center py-4 border-r border-[#E5E5E5] bg-[#F9F9F9]">{row.time}</div>
                        <div className="w-1/2 text-center py-4">{row.price}</div>
                    </div>
                ))}
            </div>
        </section>

        <section>
            <div className="bg-black text-white text-center py-2 font-bold tracking-widest text-sm border border-black">
                その他
            </div>
            <div className="bg-white border-x border-[#E5E5E5]">
                {[
                    { label: "Preciousコース", price: "7,000yen" },
                    { label: "指名料", price: "1,000yen" },
                    { label: "本指名料", price: "2,000yen" },
                    { label: "延長30min", price: "15,000yen" },
                    { label: "延長30min(Preciousコース)", price: "20,000yen" },
                ].map((row, idx) => (
                    <div key={idx} className="flex border-b border-[#E5E5E5] text-sm tracking-widest">
                        <div className="w-1/2 text-center py-4 border-r border-[#E5E5E5] bg-[#F9F9F9] px-2 flex items-center justify-center break-words text-[12px]">{row.label}</div>
                        <div className="w-1/2 text-center py-4 flex items-center justify-center">{row.price}</div>
                    </div>
                ))}
            </div>
        </section>
    </div>
);

const FlowContent = () => (
    <div className="space-y-8 animate-in fade-in duration-500 font-light text-[13px] leading-loose tracking-widest text-[#333]">
        <section>
            <h3 className="font-bold text-black border-b border-black pb-2 mb-4">ご予約について</h3>
            <p>ご予約はお電話・もしくは当サイトからネット予約が可能となっております。</p>
        </section>

        <section>
            <h3 className="font-bold text-black border-b border-black pb-2 mb-4">ネット予約について</h3>
            <p>
                ネット予約の場合当店から確認のご連絡をさせて頂き、確認が取れ次第ご予約が確定となります。
                確定前に他のお客様からのご予約等がありましたらそちらが優先となりますのでご了承下さいませ。
            </p>
        </section>

        <section>
            <h3 className="font-bold text-black border-b border-black pb-2 mb-4">キャンセルについて</h3>
            <p>
                キャンセルにつきましては基本的にお電話でキャンセルの旨をお伝えくださいませ。
                キャンセル料金等は御座いませんが、キャンセルの履歴が残ってしまいます。<br/><br/>
                <span className="text-[#E02424] font-medium">キャンセルが一定回数を超えるとご予約不可</span>となってしまいますので、ご予約の際はキャンセルの無いようよろしくお願い致します。
            </p>
        </section>
    </div>
);

const RulesContent = () => (
    <div className="space-y-8 animate-in fade-in duration-500 font-light text-[13px] leading-loose tracking-widest text-[#333]">
        <div className="text-center pb-4 border-b border-[#E5E5E5]">
            <p className="text-xs">当店をご利用されるお客様は下記の<span className="text-[#E02424] font-medium">禁止事項</span>を必ずご確認・ご理解の上ご利用下さいませ。</p>
        </div>

        <ul className="space-y-4 list-disc pl-4 text-[12px]">
            <li>写真・動画の撮影並びに店内での録音行為</li>
            <li>コンパニオンを肉体的・精神的に傷付ける行為</li>
            <li>店外でのプライベートな誘い、直引き行為や勧誘・スカウト行為</li>
            <li>その他、違法行為や当店規約に違反する行為</li>
        </ul>

        <div className="text-[#E02424] text-[12px] font-medium text-justify space-y-4 border border-[#E02424] bg-[#FFF5F5] p-5">
            <p>当項の悪質な違反ケースには損害賠償・慰謝料の請求や刑事告訴等、厳重に対処いたします。</p>
            <p>サービス中の器物破損や怪我・死亡事故について当店は一切の責任を負いかねます。</p>
            <p>サービス時間終了前に禁止事項違反などの止むを得ない事情で、コンパニオンがサービスを中断した場合、理由の如何に関わらず料金の払い戻しは出来かねますのでご了承ください。</p>
        </div>
    </div>
);

const TermsContent = () => (
    <div className="space-y-6 animate-in fade-in duration-500 font-light text-[11px] leading-relaxed tracking-wider text-[#555] whitespace-pre-wrap">
        <p className="font-bold text-sm text-black border-b border-black pb-2 mb-4">利用規約</p>
        {"E-girls博多（以下、「当店」という）が提供するサービスのご利用に関し、以下の通り利用規約（以下、「本規約」という）を定めます。\n\n"}
        <p className="font-bold text-black mt-4">第1条（適用対象）</p>
        {"当店のサービスを利用するすべてのお客様に適用されます。\n\n"}
        <p className="font-bold text-black mt-4">第2条（ご利用をお断りする方）</p>
        {"当店では、以下に該当するお客様のご利用を固くお断りいたします。\n\n" +
         "・18歳未満及び高校生の方\n" +
         "・暴力団、暴力団関係者、刺青(タトゥー含む)がある方\n" +
         "・泥酔者や明らかに理性的言動が見込めないと判断された方\n" +
         "・慢性のアルコール中毒者、薬物を服用・所持している疑いのある方\n" +
         "・深刻な伝染病等の疫病をお持ちの方\n" +
         "・不衛生の方、又は当店判断によりそう見受けられる方\n" +
         "・同業他社、スカウト、引き抜き目的の方\n" +
         "・過去に当店規約に違反された方\n\n"}
        <p className="font-bold text-black mt-4">第3条（サービス内容）</p>
        {"当店は、リラクゼーションおよび付帯するサービスを提供するものであり、法令で禁止されている売春行為など、違法なサービスを提供するものではありません。\n\n"}
        <p className="font-bold text-black mt-4">第4条（禁止事項）</p>
        {"当店では、サイト内の「当店のご利用ルール」に記載された禁止事項ならびに、キャストが嫌がる行為、店舗への営業妨害、スカウト行為等を固く禁じます。これらに違反した場合、サービスの即時中断、退店処分、および規定の違約金・罰金をご請求いたします。その際、利用料金の返金は一切行いません。\n\n"}
        <p className="font-bold text-black mt-4">第5条（予約とキャンセル）</p>
        {"ご予約後に自己都合でのキャンセルを繰り返す場合、不当な予約枠の占有とみなし、以後のご利用をお断りする場合がございます。\n\n"}
        <p className="font-bold text-black mt-4">第6条（免責事項）</p>
        {"当店サービス内で発生したお客様同士のトラブルや、キャストへの不適切な接触によって生じた一切の損害について、当店は法的責任を負いかねます。"}
    </div>
);

const PrivacyContent = () => (
    <div className="space-y-6 animate-in fade-in duration-500 font-light text-[11px] leading-relaxed tracking-wider text-[#555] whitespace-pre-wrap">
        <p className="font-bold text-sm text-black border-b border-black pb-2 mb-4">プライバシーポリシー</p>
        {"E-girls博多（以下「当店」といいます）は、お客様の個人情報保護の重要性を深く認識し、以下の方針に基づき個人情報の厳格な保護に努めます。\n\n"}
        <p className="font-bold text-black mt-4">1. 個人情報の収集・利用</p>
        {"当店は、ご予約の管理、サービス向上のための各種認証（電話番号等）、およびお客様の好み・設定の保存のため、必要最小限の個人情報を適正な手段により取得します。\n\n"}
        <p className="font-bold text-black mt-4">2. 第三者提供の制限</p>
        {"お客様よりお預かりした個人情報（お名前、電話番号、ご利用履歴、ご設定等）は、法令に基づく警察等からの正式な要請がある場合を除き、ご本人の同意なしに第三者（所属キャストを含む無関係のスタッフ等）へ提供・漏洩することは決してありません。\n\n"}
        <p className="font-bold text-black mt-4">3. 情報の安全管理対策</p>
        {"当店は、お客様の利用履歴（足あと）や設定情報の漏洩、紛失を防ぐため、システム上の厳重なセキュリティ対策（パスワード保護ルール、通信の暗号化等）を講じます。\n\n"}
        <p className="font-bold text-black mt-4">4. 退会・アカウント削除について</p>
        {"退会および個人情報の削除をご希望のお客様は、コンシェルジュデスクまでご連絡ください。法令に基づく保存期間を除き、速やかにデータを消去いたします。"}
    </div>
);

const TokushohoContent = () => (
    <div className="space-y-6 animate-in fade-in duration-500 font-light text-[11px] leading-relaxed tracking-wider text-[#555] whitespace-pre-wrap">
        <p className="font-bold text-sm text-black border-b border-black pb-2 mb-4">店舗情報</p>
        
        <div className="border border-[#E5E5E5] bg-white text-[12px]">
            <div className="flex border-b border-[#E5E5E5] p-3">
                <div className="w-1/3 text-black font-bold">運営主体</div>
                <div className="w-2/3">E-girls博多</div>
            </div>
            <div className="block border-b border-[#E5E5E5] p-3">
                <div className="w-full text-black font-bold mb-2">所在地</div>
                <div className="w-full mb-3">福岡県福岡市博多区中洲1丁目5番3号</div>
                <div className="w-full h-48 bg-[#F9F9F9]">
                    <iframe 
                        src="https://maps.google.com/maps?q=福岡県福岡市博多区中洲1丁目5番3号&t=&z=16&ie=UTF8&iwloc=&output=embed" 
                        width="100%" 
                        height="100%" 
                        frameBorder="0" 
                        style={{ border: 0 }} 
                        allowFullScreen
                    ></iframe>
                </div>
            </div>
            <div className="flex border-b border-[#E5E5E5] p-3">
                <div className="w-1/3 text-black font-bold">電話番号</div>
                <div className="w-2/3">
                    <a href="tel:092-409-9171" className="text-black font-medium border-b border-black pb-0.5 inline-block">
                        092-409-9171
                    </a>
                </div>
            </div>
            <div className="flex border-b border-[#E5E5E5] p-3">
                <div className="w-1/3 text-black font-bold">営業時間<br/>定休日</div>
                <div className="w-2/3 flex items-center">6:00~24:00・年中無休</div>
            </div>
            <div className="flex border-b border-[#E5E5E5] p-3">
                <div className="w-1/3 text-black font-bold">駐車場</div>
                <div className="w-2/3 leading-normal">店舗付近に有料のコインパーキングが御座います。お気軽にお問合せ下さいませ。</div>
            </div>
            <div className="flex border-b border-[#E5E5E5] p-3">
                <div className="w-1/3 text-black font-bold">サービス<br/>利用料金</div>
                <div className="w-2/3 flex items-center leading-normal">「料金システム」ページに記載された価格となります。</div>
            </div>
            <div className="flex border-b border-[#E5E5E5] p-3">
                <div className="w-1/3 text-black font-bold">支払方法</div>
                <div className="w-2/3 flex items-center">現金・カード</div>
            </div>
            <div className="flex p-3">
                <div className="w-1/3 text-black font-bold">キャンセル<br/>について</div>
                <div className="w-2/3 leading-normal">サービスの性質上、ご予約時間経過後およびサービス提供後のキャンセル・返金はお受けいたしかねます。事前のキャンセル規定につきましては「ご予約・キャンセルの流れ」をご参照ください。</div>
            </div>
        </div>

        <div className="text-center font-bold text-black border border-black p-4 mt-8 space-y-2 bg-[#F9F9F9]">
            <p className="text-[12px]">18歳未満(高校生を含む)の方の利用はお断りいたします。</p>
            <p className="text-[12px]">当店には18歳未満のコンパニオンは在籍しておりません。</p>
        </div>
    </div>
);

// ----------------------------------------------------
// メインページコンポーネント
// ----------------------------------------------------

export default function HelpDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const router = useRouter();
  const { slug } = React.use(params);
  
  const contentMap: Record<string, { title: string, component: React.ReactNode }> = {
      system: { title: "料金システムについて", component: <SystemContent /> },
      flow: { title: "ご予約・キャンセルの流れ", component: <FlowContent /> },
      rules: { title: "当店のご利用ルール", component: <RulesContent /> },
      terms: { title: "利用規約", component: <TermsContent /> },
      privacy: { title: "プライバシーポリシー", component: <PrivacyContent /> },
      tokushoho: { title: "店舗情報", component: <TokushohoContent /> }
  };

  const current = contentMap[slug];

  if (!current) {
    return (
        <div className="min-h-screen flex items-center justify-center font-light tracking-widest text-[#777]">
            ページが見つかりません。
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F9F9] flex flex-col font-light">
      <header className="sticky top-0 z-40 bg-white border-b border-[#E5E5E5] flex items-center px-4 py-4">
        <button onClick={() => router.back()} className="text-black hover:text-[#777777] p-2 -ml-2 transition-colors">
          <ChevronLeft size={24} className="stroke-[1.5]" />
        </button>
        <h1 className="text-sm font-bold tracking-widest absolute left-1/2 -translate-x-1/2 truncate max-w-[200px] text-center">
            {current.title}
        </h1>
      </header>

      <main className="p-6 pb-32 bg-white min-h-[calc(100vh-64px)] border-x border-[#E5E5E5]">
        {current.component}
      </main>
    </div>
  );
}
