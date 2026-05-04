const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, '../src/app/mypage/help/page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

const targetLinks = `<Link href="/mypage/help/system" className="flex items-center justify-between p-4 border-b border-[#E5E5E5] hover:bg-[#F9F9F9]">
                    <span className="text-xs tracking-widest">料金システムについて</span>
                    <ChevronRight size={16} className="text-[#777777]" />
                </Link>
                <Link href="/mypage/help/flow" className="flex items-center justify-between p-4 border-b border-[#E5E5E5] hover:bg-[#F9F9F9]">
                    <span className="text-xs tracking-widest">ご予約・キャンセルの流れ</span>
                    <ChevronRight size={16} className="text-[#777777]" />
                </Link>
                <Link href="/mypage/help/rules" className="flex items-center justify-between p-4 hover:bg-[#F9F9F9]">
                    <span className="text-xs tracking-widest text-[#E02424]">当店のご利用ルール（禁止事項）</span>
                    <ChevronRight size={16} className="text-[#777777]" />
                </Link>`;

const replacementLinks = `<Link href="/mypage/help/about" className="flex items-center justify-between p-4 border-b border-[#E5E5E5] hover:bg-[#F9F9F9]">
                    <span className="text-xs tracking-widest">HimeMatchのご利用ガイド</span>
                    <ChevronRight size={16} className="text-[#777777]" />
                </Link>
                <Link href="/mypage/help/flow" className="flex items-center justify-between p-4 hover:bg-[#F9F9F9]">
                    <span className="text-xs tracking-widest">ご予約・キャンセルの流れ</span>
                    <ChevronRight size={16} className="text-[#777777]" />
                </Link>`;

if (content.includes(targetLinks)) {
    content = content.replace(targetLinks, replacementLinks);
    fs.writeFileSync(pagePath, content, 'utf8');
} else {
    console.error("Link section not found in page.tsx");
}

const slugPath = path.join(__dirname, '../src/app/mypage/help/[slug]/page.tsx');
let slugContent = fs.readFileSync(slugPath, 'utf8');

// Replace SystemContent and RulesContent with AboutContent
const aboutContent = `const AboutContent = () => (
    <div className="space-y-8 animate-in fade-in duration-500 font-light text-[13px] leading-loose tracking-widest text-[#333]">
        <section>
            <h3 className="font-bold text-black border-b border-black pb-2 mb-4">HimeMatchとは？</h3>
            <p>HimeMatchは、あなたと理想のキャストをつなぐ総合ポータルサイトです。エリア内の様々な店舗のキャスト情報、出勤情報、SNS投稿などをタイムラインでリアルタイムにチェックすることができます。</p>
        </section>

        <section>
            <h3 className="font-bold text-black border-b border-black pb-2 mb-4">主な機能と使い方</h3>
            <ul className="list-disc pl-4 space-y-4">
                <li><span className="font-bold border-b border-black/20 pb-0.5 inline-block mb-1">キャストを探す・フォローする</span><br/>気になったキャストは「フォロー」することで、フォロワー限定の特別な画像や動画を閲覧できるようになります。</li>
                <li><span className="font-bold border-b border-black/20 pb-0.5 inline-block mb-1">ダイレクトメッセージ (DM)</span><br/>会員登録（無料）をしていただくと、お気に入りのキャストと直接メッセージのやり取りが可能になります。ご予約の相談などにご活用ください。</li>
                <li><span className="font-bold border-b border-black/20 pb-0.5 inline-block mb-1">リアルタイム出勤情報</span><br/>「本日出勤」タブや各キャストのプロフィールページから、その日の出勤状況や空き枠などをひと目で確認できます。</li>
            </ul>
        </section>
    </div>
);

`;

// Find and replace contentMap
slugContent = slugContent.replace(/const contentMap: Record<string, { title: string, component: React\.ReactNode }> = {[\s\S]*?};/, 
`const contentMap: Record<string, { title: string, component: React.ReactNode }> = {
      about: { title: "HimeMatchのご利用ガイド", component: <AboutContent /> },
      flow: { title: "ご予約・キャンセルの流れ", component: <FlowContent /> },
      terms: { title: "利用規約", component: <TermsContent /> },
      privacy: { title: "プライバシーポリシー", component: <PrivacyContent /> },
      tokushoho: { title: "店舗情報", component: <TokushohoContent /> }
  };`);

slugContent = slugContent.replace(/「料金システム」ページに記載された価格となります。/, "各店舗ごとに異なります。詳細は各店舗またはキャストのページをご確認ください。");

// Insert AboutContent after FlowContent or before FlowContent
slugContent = slugContent.replace(/const FlowContent = \(\) => \(/, aboutContent + "const FlowContent = () => (");

// Remove SystemContent and RulesContent entirely using regex (simplistic but works for this structure)
// We'll leave them in the file but unused if regex is too complex, but let's try to remove them.
slugContent = slugContent.replace(/const SystemContent = \(\) => \([\s\S]*?\}\n\);\n\n/, "");
slugContent = slugContent.replace(/const RulesContent = \(\) => \([\s\S]*?\}\n\);\n\n/, "");

// Also remove them if they end up being caught differently
fs.writeFileSync(slugPath, slugContent, 'utf8');

console.log("Successfully updated help pages.");
