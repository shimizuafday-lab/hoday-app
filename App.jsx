import React, { useState, useEffect } from 'react';
import { Search, MapPin, Phone, School, Truck, Utensils, X, Clock, Calendar, RefreshCw, ChevronRight } from 'lucide-react';

// ==========================================
// 【重要】スプレッドシートのCSV URLをここに貼り付けてください
// ==========================================
const SPREADSHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ-3HsrNideEQfqOrC604NY0NkwaQ7sxjMog2vuwVymliZN6XMsE58_wA-rErOJMMHP9Y49BIUiLDq1/pub?output=csv"; 

const App = () => {
  const [facilities, setFacilities] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCSVData = async () => {
    setLoading(true);
    try {
      const response = await fetch(SPREADSHEET_CSV_URL);
      if (!response.ok) throw new Error('データの取得に失敗しました。');
      const csvText = await response.text();

      const lines = csvText.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      const data = lines.slice(1).map(line => {
        const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/); 
        const obj = {};
        headers.forEach((header, i) => {
          let val = values[i]?.replace(/^"|"$/g, '').replace(/""/g, '"').trim();
          // HTMLタグを除去
          val = val?.replace(/<[^>]*>?/gm, '');
          obj[header] = val;
        });
        return obj;
      });
      setFacilities(data);
    } catch (err) {
      setError("データの読み込みに失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCSVData();
  }, []);

  // モーダル表示時に背景スクロールを禁止
  useEffect(() => {
    if (selectedFacility) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [selectedFacility]);

  const filtered = facilities.filter(f => 
    f['事業所名']?.includes(searchTerm) || f['住所']?.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-10 font-sans text-gray-900">
      {/* ヘッダー */}
      <header className="bg-blue-600 text-white p-6 shadow-md sticky top-0 z-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-xl font-bold mb-4 flex items-center gap-2">
            <School size={24} /> 放デイ・ガイド
          </h1>
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="事業所名や住所で検索..."
              className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 focus:outline-none shadow-inner border-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-4xl mx-auto p-4 mt-4">
        {loading ? (
          <div className="text-center py-20 text-gray-400">
            <RefreshCw className="animate-spin mx-auto mb-4" size={40} />
            <p>読み込み中...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((f, i) => (
              <div 
                key={i} 
                className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all overflow-hidden cursor-pointer border border-gray-100 flex flex-col group"
                onClick={() => setSelectedFacility(f)}
              >
                {/* カード画像エリア */}
                <div className="h-48 w-full bg-gray-200 relative overflow-hidden">
                  <img 
                    src={f.pic1 || 'https://images.unsplash.com/photo-1594608661623-aa0bd3a69d98?w=500'} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    alt={f['事業所名']}
                  />
                  <div className="absolute top-3 left-3 flex gap-1">
                    {f['送迎']?.includes('有') && (
                      <span className="bg-blue-600/90 text-white text-[10px] px-2 py-1 rounded-md font-bold backdrop-blur-sm flex items-center gap-1">
                        <Truck size={12} /> 送迎あり
                      </span>
                    )}
                    {f['食事']?.includes('有') && (
                      <span className="bg-orange-500/90 text-white text-[10px] px-2 py-1 rounded-md font-bold backdrop-blur-sm flex items-center gap-1">
                        <Utensils size={12} /> 食事あり
                      </span>
                    )}
                  </div>
                </div>

                {/* カードテキストエリア */}
                <div className="p-5 flex-grow flex flex-col">
                  <h2 className="text-lg font-bold mb-2 text-gray-800 line-clamp-1">{f['事業所名']}</h2>
                  <div className="text-gray-500 text-xs mb-4 flex items-start gap-1">
                    <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                    <span className="line-clamp-1">{f['住所']}</span>
                  </div>
                  <div className="mt-auto flex items-center justify-end">
                    <div className="text-gray-300 group-hover:text-blue-500 transition-colors">
                      <ChevronRight size={20} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 詳細モーダル */}
      {selectedFacility && (
        <div 
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-0 sm:p-4 backdrop-blur-sm"
          onClick={() => setSelectedFacility(null)}
        >
          <div 
            className="bg-white w-full max-w-2xl h-full sm:h-auto sm:max-h-[90vh] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col relative"
            onClick={e => e.stopPropagation()}
          >
            {/* 閉じるボタン */}
            <button 
              onClick={() => setSelectedFacility(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-white/80 rounded-full shadow hover:bg-white transition-colors"
            >
              <X size={24} />
            </button>

            {/* スクロール可能エリア */}
            <div className="flex-grow overflow-y-auto scroll-smooth">
              {/* 画像エリア */}
              <div className="w-full">
                <img 
                  src={selectedFacility.pic1 || 'https://images.unsplash.com/photo-1594608661623-aa0bd3a69d98?w=800'} 
                  className="w-full aspect-video object-cover" 
                  alt="メイン写真" 
                />
                <div className="grid grid-cols-2 gap-0.5 mt-0.5">
                  {selectedFacility.pic2 && <img src={selectedFacility.pic2} className="w-full aspect-video object-cover" alt="写真2" />}
                  {selectedFacility.pic3 && <img src={selectedFacility.pic3} className="w-full aspect-video object-cover" alt="写真3" />}
                </div>
              </div>

              {/* コンテンツ詳細 */}
              <div className="p-6 sm:p-10">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 leading-tight">{selectedFacility['事業所名']}</h2>
                
                <div className="space-y-6">
                  {/* 住所 */}
                  <div className="bg-gray-50 p-5 rounded-2xl flex items-start gap-3">
                    <MapPin className="text-blue-500 mt-1 flex-shrink-0" size={20} />
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">所在地</p>
                      <p className="font-bold text-gray-800">{selectedFacility['住所']}</p>
                    </div>
                  </div>

                  {/* 営業時間・営業日・閉所日 */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100/50">
                      <div className="flex items-center gap-2 mb-2 text-blue-500">
                        <Clock size={16} />
                        <span className="text-xs font-bold uppercase tracking-wider">営業時間</span>
                      </div>
                      <p className="text-lg font-bold text-blue-900">
                        {selectedFacility['開所時間'] || '00:00'} - {selectedFacility['閉所時間'] || '00:00'}
                      </p>
                    </div>
                    <div className="bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100/50">
                      <div className="flex items-center gap-2 mb-2 text-emerald-500">
                        <Calendar size={16} />
                        <span className="text-xs font-bold uppercase tracking-wider">営業日</span>
                      </div>
                      <p className="text-lg font-bold text-emerald-900">{selectedFacility['開所日'] || '月〜金'}</p>
                      
                      {/* 閉所日を追加 */}
                      {selectedFacility['閉所日'] && (
                        <p className="text-sm text-emerald-700 mt-1 font-medium flex items-center gap-1.5">
                          <span className="text-[10px] bg-white px-1.5 py-0.5 rounded border border-emerald-200 text-emerald-600 font-bold">休</span>
                          {selectedFacility['閉所日']}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* サービス・通学先エリア */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* サービス詳細 */}
                    <div className="bg-orange-50/50 p-5 rounded-2xl border border-orange-100/50">
                       <div className="flex items-center gap-2 mb-3 text-orange-500">
                         <Truck size={16} />
                         <span className="text-xs font-bold uppercase tracking-wider">サービス</span>
                       </div>
                       <div className="space-y-3">
                         <div className="flex items-center justify-between">
                           <span className="text-sm font-bold text-gray-600 flex items-center gap-1.5">
                             <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                             送迎
                           </span>
                           <span className="text-sm font-bold text-orange-800 bg-white px-2 py-0.5 rounded-md shadow-sm border border-orange-100">
                             {selectedFacility['送迎'] || '要確認'}
                           </span>
                         </div>
                         <div className="flex items-center justify-between border-t border-orange-100/60 pt-2">
                           <span className="text-sm font-bold text-gray-600 flex items-center gap-1.5">
                             <span className="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
                             食事
                           </span>
                           <span className="text-sm font-bold text-orange-800 bg-white px-2 py-0.5 rounded-md shadow-sm border border-orange-100">
                             {selectedFacility['食事'] || '要確認'}
                           </span>
                         </div>
                       </div>
                    </div>

                    {/* 主な通学先 */}
                    <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100/50">
                       <div className="flex items-center gap-2 mb-3 text-indigo-500">
                         <School size={16} />
                         <span className="text-xs font-bold uppercase tracking-wider">主な通学先</span>
                       </div>
                       <div className="flex flex-wrap gap-1.5">
                         {selectedFacility['主な通学先'] ? (
                           selectedFacility['主な通学先'].split(/・|、|,/).map((school, i) => (
                             school.trim() && (
                               <span key={i} className="text-xs font-bold text-indigo-700 bg-white px-2 py-1 rounded-md border border-indigo-100 shadow-sm">
                                 {school.trim()}
                               </span>
                             )
                           ))
                         ) : (
                           <span className="text-sm text-gray-400">登録なし</span>
                         )}
                       </div>
                    </div>
                  </div>

                  {selectedFacility['アピールポイント'] && (
                    <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100/50">
                      <p className="text-amber-900 font-medium leading-relaxed whitespace-pre-wrap">
                        {selectedFacility['アピールポイント']}
                      </p>
                    </div>
                  )}

                  {/* 連絡先セクション */}
                  <div className="pt-4 space-y-4">
                    <div className="flex items-center justify-between p-4 border-2 border-gray-50 rounded-2xl">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 mb-1">電話番号</p>
                        <p className="text-xl font-bold text-gray-800">{selectedFacility['電話番号'] || '登録なし'}</p>
                      </div>
                      <a 
                        href={`tel:${selectedFacility['電話番号']}`} 
                        className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-100 flex items-center gap-2 active:scale-95 transition-all"
                      >
                        <Phone size={18} /> 発信
                      </a>
                    </div>

                    <button 
                      onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedFacility['住所'])}`, '_blank')}
                      className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl hover:bg-gray-800 active:scale-[0.98] transition-all"
                    >
                      <MapPin size={18} /> Googleマップで見る
                    </button>
                  </div>
                </div>
                
                {/* フッター余白 */}
                <div className="h-10"></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
