import React, { useState, useEffect } from 'react';
import { Search, MapPin, Phone, School, Truck, Utensils, Info, X, Clock, Calendar, CheckCircle2, XCircle, ExternalLink, RefreshCw } from 'lucide-react';

/**
 * 【設定手順】
 * 1. Googleスプレッドシートの「ファイル」>「共有」>「ウェブに公開」を開く
 * 2. 形式を「コンマ区切り値(.csv)」にして公開
 * 3. 発行されたURLを下のダブルクォーテーション内 (" ") に貼り付けてください
 */
const SPREADSHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/1ySyyyqHGJuNsiV0E4GVt5PrKH5R3leWOv6RcTL0db44/edit?usp=sharing"; 

const App = () => {
  const [facilities, setFacilities] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCSVData = async (retries = 5, delay = 1000) => {
    setLoading(true);
    try {
      let csvText = "";
      
      if (SPREADSHEET_CSV_URL) {
        // 指数バックオフによるリトライ処理
        let response;
        for (let i = 0; i < retries; i++) {
          try {
            response = await fetch(SPREADSHEET_CSV_URL);
            if (response.ok) break;
          } catch (e) {
            if (i === retries - 1) throw e;
            await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
          }
        }
        
        if (!response.ok) throw new Error('データの取得に失敗しました');
        csvText = await response.text();
      } else {
        // URLが未設定の場合は、プロトタイプ用の初期データを表示
        csvText = `事業所名,郵便番号,住所,電話番号,FAX番号,開所日,閉所日,開所時間,閉所時間,学校休業日開所時間,学校休業日閉所時間,主な通学先,送迎,食事,アピールポイント,pic1,pic2,pic3
放課後等デイサービス　ここ,424-0114,静岡市清水区庵原町150-31,054-366-3705,054-366-3705,月・火・水・木・金,土・日・祝,13:00,18:00,9:00,17:00,"庵原小・袖師小・飯田小・飯田東小・高部小・高部東小・清水第二中・清水第八中・飯田中・特別支援学校",有,有（別料金）,"「ここ」とは、年齢や障がいに関係なく、誰もが自分らしく充実した暮らしをしてほしい。という視点から〈みんなの居場所〉でありたい。という思いからつけました。パソコン教室や陶芸教室等、いろいろな活動を通してコミュニケーションを大切にする事と共に個人個人の思いも大事にしています。",https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/8ld1dO6S797spOZft9yt/pub/AuVNMbUKWwPGjmhQ4RjY.JPG,,
かぶとむしクラブ江尻東,424-0815,静岡市清水区江尻東1-5-30　ピア21　2階,054－659-7378,054-659-7378,月・火・水・木・金,土・日・祝,13:00,18:00,10:00,17:00,"辻小・江尻小・入江小・不二見小・清水小・駒越小・高部小・高部東小・飯田東小",有,無,"2023年7月1日に開所しました。児童の個性を大切にし、ひとりひとりに合わせて丁寧に支援します。工作やレクリエーションなど普段の生活の中で基礎的な生活習慣や、コミュニケーション力をつけ、長期お休みには、外にでて体験学習をしたり、公園へのお出掛け、体育館を借りてレクリエーションや映画館ごっこなど楽しみながらその場所に合った過ごし方を考え学んでいきます。",https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/8ld1dO6S797spOZft9yt/pub/eGV0BfsxGMs65MtdTE8X.jpg,https://storage.googleapis.com/glide-prod.appspot.com/uploads-v2/8ld1dO6S797spOZft9yt/pub/MBcr8dvpNs9luEJn6Kp0.jpg,`;
      }

      const lines = csvText.trim().split('\n');
      const headers = lines[0].split(',');
      const data = lines.slice(1).map(line => {
        const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/); 
        const obj = {};
        headers.forEach((header, i) => {
          let val = values[i]?.replace(/^"|"$/g, '').replace(/""/g, '"').trim();
          // HTMLタグが混入している場合の簡易除去
          val = val?.replace(/<[^>]*>?/gm, '');
          obj[header.trim()] = val;
        });
        return obj;
      });
      setFacilities(data);
      setError(null);
    } catch (err) {
      setError("スプレッドシートの読み込みに失敗しました。URLが正しいか、「ウェブに公開」がCSV形式になっているか確認してください。");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCSVData();
  }, []);

  const filteredFacilities = facilities.filter(f => 
    f['事業所名']?.includes(searchTerm) || f['主な通学先']?.includes(searchTerm) || f['住所']?.includes(searchTerm)
  );

  const openGoogleMaps = (address) => {
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-10 font-sans text-gray-900">
      {/* Header */}
      <header className="bg-blue-600 text-white p-6 shadow-md sticky top-0 z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <School size={28} /> 放デイ・ガイド
            </h1>
            <button 
              onClick={() => fetchCSVData()} 
              className="p-2 hover:bg-blue-500 rounded-full transition-colors flex items-center gap-2 text-sm"
              title="最新データに更新"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
              <span className="hidden sm:inline">更新</span>
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="事業所名・学校名・住所で検索..."
              className="w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300 shadow-inner border-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* Main List */}
      <main className="max-w-4xl mx-auto p-4 mt-4">
        {loading && facilities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <RefreshCw size={40} className="animate-spin mb-4 text-blue-400" />
            <p className="animate-pulse">スプレッドシートから読み込み中...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-8 rounded-3xl text-center border border-red-100 shadow-sm">
            <XCircle size={48} className="mx-auto mb-4 opacity-50" />
            <p className="font-bold mb-4">{error}</p>
            <button onClick={() => fetchCSVData()} className="bg-white px-6 py-2 rounded-full shadow-sm text-sm font-bold border hover:bg-red-50 transition-colors">再読み込み</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredFacilities.map((facility, index) => (
              <div 
                key={index} 
                className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all overflow-hidden cursor-pointer border border-gray-100 group flex flex-col h-full"
                onClick={() => setSelectedFacility(facility)}
              >
                <div className="h-48 bg-gray-200 relative overflow-hidden">
                  <img 
                    src={facility.pic1 || 'https://images.unsplash.com/photo-1594608661623-aa0bd3a69d98?auto=format&fit=crop&w=400&q=80'} 
                    alt={facility['事業所名']}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1594608661623-aa0bd3a69d98?auto=format&fit=crop&w=400&q=80' }}
                  />
                  <div className="absolute top-2 right-2 flex flex-col gap-1">
                    {facility['送迎'] === '有' && (
                      <span className="bg-green-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 shadow-sm">
                        <Truck size={10} /> 送迎あり
                      </span>
                    )}
                    {facility['食事']?.includes('有') && (
                      <span className="bg-orange-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 shadow-sm">
                        <Utensils size={10} /> 食事あり
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-5 flex flex-col flex-grow">
                  <h2 className="text-lg font-bold text-gray-800 mb-2 line-clamp-1">{facility['事業所名']}</h2>
                  <div className="space-y-1 mb-4 text-gray-500 text-xs">
                    <div className="flex items-center">
                      <MapPin size={14} className="mr-1 flex-shrink-0" />
                      <span className="truncate">{facility['住所']}</span>
                    </div>
                    <div className="flex items-center">
                      <Phone size={14} className="mr-1 flex-shrink-0" />
                      <span>{facility['電話番号']}</span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed mb-4 italic flex-grow">
                    {facility['アピールポイント']}
                  </p>
                  <div className="w-full py-2 bg-blue-50 text-blue-600 rounded-lg text-center font-bold text-sm group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    詳細を見る
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Detail Modal */}
      {selectedFacility && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm overflow-hidden">
          <div className="bg-white w-full max-w-3xl max-h-[95vh] rounded-t-3xl sm:rounded-3xl overflow-y-auto relative shadow-2xl animate-in slide-in-from-bottom duration-300">
            <button 
              onClick={() => setSelectedFacility(null)}
              className="absolute top-4 right-4 bg-white/80 backdrop-blur-md p-2 rounded-full text-gray-600 hover:bg-gray-200 z-10 shadow-md transition-colors"
            >
              <X size={24} />
            </button>
            
            <img 
              src={selectedFacility.pic1 || 'https://images.unsplash.com/photo-1594608661623-aa0bd3a69d98?auto=format&fit=crop&w=800&q=80'} 
              className="w-full h-64 sm:h-80 object-cover"
              alt="事業所写真"
              onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1594608661623-aa0bd3a69d98?auto=format&fit=crop&w=800&q=80' }}
            />
            
            <div className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                <h2 className="text-2xl font-black text-gray-900 leading-tight">{selectedFacility['事業所名']}</h2>
                <div className="flex gap-2 flex-shrink-0">
                  <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${selectedFacility['送迎'] === '有' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                    {selectedFacility['送迎'] === '有' ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                    送迎：{selectedFacility['送迎']}
                  </div>
                  <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${selectedFacility['食事']?.includes('有') ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-400'}`}>
                    {selectedFacility['食事']?.includes('有') ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                    食事：{selectedFacility['食事']}
                  </div>
                </div>
              </div>
              
              <div className="space-y-8">
                {/* Access */}
                <section>
                  <h3 className="flex items-center font-bold text-gray-800 mb-3 text-lg border-l-4 border-blue-500 pl-3">
                    アクセス・連絡先
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <button 
                      onClick={() => openGoogleMaps(selectedFacility['住所'])}
                      className="text-left bg-gray-50 p-4 rounded-2xl border border-gray-100 hover:border-blue-300 hover:bg-blue-50 transition-all group/map shadow-sm"
                    >
                      <p className="text-gray-400 font-medium mb-1 flex justify-between items-center text-xs uppercase tracking-wider">
                        所在地 <ExternalLink size={14} className="opacity-0 group-hover/map:opacity-100 text-blue-500 transition-opacity" />
                      </p>
                      <p className="font-bold text-gray-800 leading-relaxed text-base">
                        〒{selectedFacility['郵便番号']}<br/>{selectedFacility['住所']}
                      </p>
                      <div className="mt-2 text-blue-600 text-[10px] font-bold flex items-center gap-1">
                        <MapPin size={12} /> Googleマップで開く
                      </div>
                    </button>
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-center">
                      <p className="text-gray-400 font-medium mb-1 text-xs uppercase tracking-wider">電話番号</p>
                      <a href={`tel:${selectedFacility['電話番号']}`} className="text-2xl font-black text-blue-600 flex items-center gap-2 hover:underline py-1">
                        <Phone size={24} />
                        {selectedFacility['電話番号']}
                      </a>
                    </div>
                  </div>
                </section>

                {/* Schedule */}
                <section>
                  <h3 className="flex items-center font-bold text-gray-800 mb-3 text-lg border-l-4 border-blue-500 pl-3">
                    営業時間・スケジュール
                  </h3>
                  <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm flex flex-col sm:flex-row text-center">
                    <div className="p-4 flex-1 bg-green-50/40 border-b sm:border-b-0 sm:border-r border-gray-100">
                      <p className="text-gray-500 flex items-center justify-center gap-1 mb-2 text-xs font-bold uppercase tracking-widest">
                        <Calendar size={14} className="text-green-600" /> 開所日
                      </p>
                      <p className="font-bold text-sm mb-2 text-gray-800">{selectedFacility['開所日']}</p>
                      <div className="inline-block px-3 py-1 bg-red-100 text-red-600 rounded-lg text-[10px] font-black">
                        閉所：{selectedFacility['閉所日']}
                      </div>
                    </div>
                    <div className="p-4 flex-1 border-b sm:border-b-0 sm:border-r border-gray-100">
                      <p className="text-gray-500 flex items-center justify-center gap-1 mb-2 text-xs font-bold uppercase tracking-widest">
                        <Clock size={14} className="text-blue-500" /> 平日
                      </p>
                      <p className="text-xl font-black text-blue-700">
                        {selectedFacility['開所時間']}<span className="text-xs mx-1 text-gray-400">〜</span>{selectedFacility['閉所時間']}
                      </p>
                    </div>
                    <div className="p-4 flex-1 bg-orange-50/40">
                      <p className="text-gray-500 flex items-center justify-center gap-1 mb-2 text-xs font-bold uppercase tracking-widest">
                        <Clock size={14} className="text-orange-500" /> 学校休業日
                      </p>
                      {selectedFacility['学校休業日開所時間'] ? (
                        <p className="text-xl font-black text-orange-700">
                          {selectedFacility['学校休業日開所時間']}<span className="text-xs mx-1 text-gray-400">〜</span>{selectedFacility['学校休業日閉所時間']}
                        </p>
                      ) : (
                        <p className="text-gray-400 font-medium">設定なし</p>
                      )}
                    </div>
                  </div>
                </section>

                {/* Schools */}
                <section>
                  <h3 className="flex items-center font-bold text-gray-800 mb-3 text-lg border-l-4 border-blue-500 pl-3">
                    主な通学先
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedFacility['主な通学先']?.split('・').map((school, i) => (
                      <span key={i} className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 shadow-sm">
                        {school}
                      </span>
                    ))}
                  </div>
                </section>

                {/* Appeal Message */}
                <section>
                  <h3 className="flex items-center font-bold text-gray-800 mb-3 text-lg border-l-4 border-blue-500 pl-3">
                    事業所からのメッセージ
                  </h3>
                  <div className="bg-blue-50/30 p-6 rounded-3xl text-gray-700 leading-relaxed text-sm whitespace-pre-wrap border border-blue-100 relative shadow-inner">
                    <span className="absolute -top-3 left-6 text-4xl text-blue-200 font-serif">“</span>
                    {selectedFacility['アピールポイント']}
                    <span className="absolute -bottom-6 right-6 text-4xl text-blue-200 font-serif rotate-180">“</span>
                  </div>
                </section>

                {/* Photos */}
                {(selectedFacility.pic2 || selectedFacility.pic3) && (
                  <section>
                    <h3 className="font-bold text-gray-800 mb-3 text-sm flex items-center">ギャラリー</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {selectedFacility.pic2 && <img src={selectedFacility.pic2} alt="写真2" className="rounded-2xl h-44 w-full object-cover shadow-sm border border-gray-100" onError={(e) => e.target.style.display='none'} />}
                      {selectedFacility.pic3 && <img src={selectedFacility.pic3} alt="写真3" className="rounded-2xl h-44 w-full object-cover shadow-sm border border-gray-100" onError={(e) => e.target.style.display='none'} />}
                    </div>
                  </section>
                )}
              </div>

              {/* Action Button */}
              <div className="mt-12 pt-8 border-t border-gray-100 sticky bottom-0 bg-white/80 backdrop-blur-md pb-4 sm:pb-0">
                <a 
                  href={`tel:${selectedFacility['電話番号']}`} 
                  className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-3 shadow-xl shadow-blue-200 active:scale-[0.98] transition-all text-xl hover:bg-blue-700"
                >
                  <Phone size={24} fill="currentColor" /> 電話でお問い合わせ
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;