const fs = require('fs');
const path = require('path');

const slugPath = path.join(__dirname, '../src/app/mypage/help/[slug]/page.tsx');
let slugContent = fs.readFileSync(slugPath, 'utf8');

// 1. Add import for useUser
if (!slugContent.includes('useUser')) {
    slugContent = slugContent.replace(
        'import { ChevronLeft } from "lucide-react";',
        'import { ChevronLeft } from "lucide-react";\nimport { useUser } from "@/providers/UserProvider";'
    );
}

// 2. Replace AboutContent
const targetAboutContentRegex = /const AboutContent = \(\) => \([\s\S]*?\}\n\);\n/;
const replacementAboutContent = `const AboutContent = () => {
    const { user } = useUser();

    return (
        <div className="space-y-8 animate-in fade-in duration-500 font-light text-[13px] leading-loose tracking-widest text-[#333]">
            {/* 全ユーザー共通の概要 */}
            <section>
                <h3 className="font-bold text-black border-b border-black pb-2 mb-4">HimeMatchとは？</h3>
                <p>HimeMatchは、あなたと理想のキャストをつなぐ最高級の総合ポータルサイトです。<br/>最新の出勤情報、SNS連携、シームレスな予約システムを統合し、これまでにないスマートでプレミアムな夜のエンターテインメント体験を提供します。</p>
            </section>

            {/* ロール別のチュートリアル */}
            <section>
                <h3 className="font-bold text-black border-b border-black pb-2 mb-4">
                    {user?.role === 'store' ? '店舗向けチュートリアル' : 
                     user?.role === 'cast' ? 'キャスト向けチュートリアル' : 
                     user?.role === 'user' ? '会員様向けチュートリアル' : 
                     'ご利用チュートリアル'}
                </h3>
                
                {!user && (
                    <ul className="list-disc pl-4 space-y-4">
                        <li><span className="font-bold border-b border-black/20 pb-0.5 inline-block mb-1">無料会員登録のメリット</span><br/>会員登録をしていただくと、すべての機能がフルにご利用いただけます。まずは無料会員登録をして、すべての機能を体験してみてください。</li>
                        <li><span className="font-bold border-b border-black/20 pb-0.5 inline-block mb-1">キャストと直接DM</span><br/>気になるキャストと直接メッセージのやり取りができ、来店前のコミュニケーションが楽しめます。</li>
                        <li><span className="font-bold border-b border-black/20 pb-0.5 inline-block mb-1">限定タイムラインの閲覧</span><br/>お気に入りのキャストをフォローすると、フォロワー限定の特別な画像や動画がアンロックされます。</li>
                        <li><span className="font-bold border-b border-black/20 pb-0.5 inline-block mb-1">スマートなネット予約</span><br/>24時間いつでも、お目当てのキャストの空き状況を確認してスムーズに予約が完了します。</li>
                    </ul>
                )}

                {user?.role === 'user' && (
                    <ul className="list-disc pl-4 space-y-4">
                        <li><span className="font-bold border-b border-black/20 pb-0.5 inline-block mb-1">出勤情報の確認と予約</span><br/>「本日出勤」タブやキャストのプロフィールから、リアルタイムの出勤・空き枠情報を確認できます。「予約する」ボタンからスムーズにネット予約が可能です。</li>
                        <li><span className="font-bold border-b border-black/20 pb-0.5 inline-block mb-1">お気に入りのフォロー</span><br/>タイムラインで気になるキャストを見つけたら、「フォロー」しましょう。フォロワー限定の特別な投稿がタイムラインに表示されるようになります。</li>
                        <li><span className="font-bold border-b border-black/20 pb-0.5 inline-block mb-1">ダイレクトメッセージ (DM)</span><br/>キャストのプロフィールにある「メッセージ」ボタンから、直接DMを送ることができます。来店前の要望やお店の場所の確認などに活用してください。</li>
                    </ul>
                )}

                {user?.role === 'cast' && (
                    <ul className="list-disc pl-4 space-y-4">
                        <li><span className="font-bold border-b border-black/20 pb-0.5 inline-block mb-1">プロフィールの充実</span><br/>あなたの魅力が伝わるように、プロフィール画像やカバー画像を魅力的なものに設定しましょう。マイページからいつでも更新可能です。</li>
                        <li><span className="font-bold border-b border-black/20 pb-0.5 inline-block mb-1">タイムライン投稿</span><br/>日常の様子や出勤の告知などをタイムラインに投稿してファンを増やしましょう。「フォロワー限定」に設定して、特別感を演出することも可能です。</li>
                        <li><span className="font-bold border-b border-black/20 pb-0.5 inline-block mb-1">お客様とのDM</span><br/>お客様から届いたメッセージには丁寧に返信しましょう。来店前の安心感につながり、指名獲得のチャンスが広がります。</li>
                        <li><span className="font-bold border-b border-black/20 pb-0.5 inline-block mb-1">出勤シフトの管理</span><br/>自身の出勤予定や予約状況を確認し、スムーズな接客の準備に役立ててください。</li>
                    </ul>
                )}

                {user?.role === 'store' && (
                    <ul className="list-disc pl-4 space-y-4">
                        <li><span className="font-bold border-b border-black/20 pb-0.5 inline-block mb-1">店舗公式アカウントの運用</span><br/>店舗公式として、イベント情報やおすすめキャストの紹介などをタイムラインに投稿し、集客に活用しましょう。</li>
                        <li><span className="font-bold border-b border-black/20 pb-0.5 inline-block mb-1">在籍キャストのサポート</span><br/>所属するキャストのアカウントを一元管理できます。各キャストのプロフィールや投稿状況をサポートしてください。</li>
                        <li><span className="font-bold border-b border-black/20 pb-0.5 inline-block mb-1">予約・シフトの管理</span><br/>CTI・予約管理システムと連携し、店舗全体の予約状況やキャストの出勤シフトをリアルタイムに把握・調整できます。</li>
                    </ul>
                )}
            </section>
        </div>
    );
};
`;

if (slugContent.match(targetAboutContentRegex)) {
    slugContent = slugContent.replace(targetAboutContentRegex, replacementAboutContent);
    fs.writeFileSync(slugPath, slugContent, 'utf8');
    console.log("Successfully updated AboutContent with role-based tutorials.");
} else {
    console.error("AboutContent not found in page.tsx. Regex didn't match.");
}
