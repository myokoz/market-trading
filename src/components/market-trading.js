"use client";

import React, { useState, useEffect } from 'react';
import { Timer, Users, Settings, TrendingUp, ArrowRightLeft } from 'lucide-react';

const MarketTrading = () => {
  // ゲーム設定
  const [gameSettings, setGameSettings] = useState({
    numBuyers: 4,
    numSellers: 4,
    roundDuration: 300, // 5分（秒単位）
    numRounds: 3,
    priceRange: {
      min: 0,
      max: 1000
    }
  });

  // プレイヤー設定
  const [players, setPlayers] = useState({
    buyers: [],
    sellers: []
  });

  // ゲーム状態
  const [gameState, setGameState] = useState({
    currentRound: 1,
    timeRemaining: gameSettings.roundDuration,
    isRoundActive: false,
    gameStatus: 'setup' // setup, playing, roundEnd, finished
  });

  // 取引履歴
  const [trades, setTrades] = useState([]);

  // 現在の取引入力
  const [currentTrade, setCurrentTrade] = useState({
    buyerId: '',
    sellerId: '',
    price: ''
  });

  // 設定モード
  const [isSettingsOpen, setIsSettingsOpen] = useState(true);

  // タイマー効果
  useEffect(() => {
    let timer;
    if (gameState.isRoundActive && gameState.timeRemaining > 0) {
      timer = setInterval(() => {
        setGameState(prev => ({
          ...prev,
          timeRemaining: prev.timeRemaining - 1
        }));
      }, 1000);
    } else if (gameState.timeRemaining === 0 && gameState.isRoundActive) {
      endRound();
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [gameState.isRoundActive, gameState.timeRemaining]);

  // 設定変更ハンドラー
  const handleSettingsChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setGameSettings(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: Number(value)
        }
      }));
    } else {
      setGameSettings(prev => ({
        ...prev,
        [name]: Number(value)
      }));
    }
  };

  // ゲーム初期化
  const initializeGame = () => {
    const generatePrice = () =>
      Math.floor(Math.random() * (gameSettings.priceRange.max - gameSettings.priceRange.min)) + gameSettings.priceRange.min;

    const newBuyers = Array.from({ length: gameSettings.numBuyers }, (_, i) => ({
      id: `buyer-${i + 1}`,
      type: 'buyer',
      name: `Buyer ${i + 1}`,
      reservePrice: generatePrice(),
      trades: []
    }));

    const newSellers = Array.from({ length: gameSettings.numSellers }, (_, i) => ({
      id: `seller-${i + 1}`,
      type: 'seller',
      name: `Seller ${i + 1}`,
      reservePrice: generatePrice(),
      trades: []
    }));

    setPlayers({ buyers: newBuyers, sellers: newSellers });
    setGameState(prev => ({
      ...prev,
      currentRound: 1,
      timeRemaining: gameSettings.roundDuration,
      isRoundActive: false,
      gameStatus: 'playing'
    }));
    setTrades([]);
    setIsSettingsOpen(false);
  };

  // ラウンド終了
  const endRound = () => {
    setGameState(prev => {
      // 最後のラウンドかどうかを確認
      const isLastRound = prev.currentRound >= gameSettings.numRounds;
      
      return {
        ...prev,
        isRoundActive: false,
        gameStatus: isLastRound ? 'finished' : 'roundEnd',
        currentRound: isLastRound ? prev.currentRound : prev.currentRound + 1,
        timeRemaining: gameSettings.roundDuration
      };
    });
  };

  // ラウンド開始
  const startRound = () => {
    setGameState(prev => ({
      ...prev,
      isRoundActive: true,
      gameStatus: 'playing'
    }));
  };

  // 取引入力の変更を処理
  const handleTradeChange = (e) => {
    const { name, value } = e.target;
    setCurrentTrade(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 取引を登録する
  const registerTrade = () => {
    if (!currentTrade.buyerId || !currentTrade.sellerId || !currentTrade.price) {
      alert('Please select both buyer, seller and enter a price.');
      return;
    }

    // 価格を数値に変換
    const price = Number(currentTrade.price);
    
    // 買い手と売り手を特定
    const buyer = players.buyers.find(b => b.id === currentTrade.buyerId);
    const seller = players.sellers.find(s => s.id === currentTrade.sellerId);
    
    if (!buyer || !seller) {
      alert('Invalid buyer or seller selection.');
      return;
    }
    
    // 予約価格をチェック (買い手の予約価格以下、売り手の予約価格以上の場合のみ取引成立)
    if (price > buyer.reservePrice || price < seller.reservePrice) {
      alert(`Trade not possible at this price. Buyer max: ${buyer.reservePrice}, Seller min: ${seller.reservePrice}`);
      return;
    }
    
    // 新しい取引を作成
    const newTrade = {
      id: `trade-${trades.length + 1}`,
      round: gameState.currentRound,
      timestamp: new Date().toISOString(),
      buyerId: buyer.id,
      buyerName: buyer.name,
      sellerId: seller.id,
      sellerName: seller.name,
      price: price
    };
    
    // 取引履歴に追加
    setTrades(prev => [...prev, newTrade]);
    
    // 買い手と売り手の取引履歴を更新
    setPlayers(prev => {
      const updatedBuyers = prev.buyers.map(b => 
        b.id === buyer.id 
          ? { ...b, trades: [...b.trades, newTrade] } 
          : b
      );
      
      const updatedSellers = prev.sellers.map(s => 
        s.id === seller.id 
          ? { ...s, trades: [...s.trades, newTrade] } 
          : s
      );
      
      return {
        buyers: updatedBuyers,
        sellers: updatedSellers
      };
    });
    
    // 入力をリセット
    setCurrentTrade({
      buyerId: '',
      sellerId: '',
      price: ''
    });
  };

  // タイマー表示用フォーマッター
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="bg-white shadow-lg rounded-lg p-8">
        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Market Trading Game</h2>
          <div className="flex items-center gap-4">
            {!isSettingsOpen && (
              <>
                <span className="text-lg font-semibold text-gray-900">
                  Round {gameState.currentRound}/{gameSettings.numRounds}
                </span>
                <div className="flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-lg">
                  <Timer className="w-5 h-5 text-blue-600" />
                  <span className="text-lg font-semibold text-blue-600">
                    {formatTime(gameState.timeRemaining)}
                  </span>
                </div>
              </>
            )}
            {gameState.gameStatus === 'setup' && (
              <button
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <Settings className="w-6 h-6 text-gray-700" />
              </button>
            )}
          </div>
        </div>

        {/* 設定パネル */}
        {isSettingsOpen && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Game Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex flex-col gap-2">
                <label className="text-gray-900 font-medium">Number of Buyers</label>
                <input
                  type="number"
                  name="numBuyers"
                  value={gameSettings.numBuyers}
                  onChange={handleSettingsChange}
                  min="1"
                  max="10"
                  className="border-2 rounded-md p-2 text-gray-900"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-gray-900 font-medium">Number of Sellers</label>
                <input
                  type="number"
                  name="numSellers"
                  value={gameSettings.numSellers}
                  onChange={handleSettingsChange}
                  min="1"
                  max="10"
                  className="border-2 rounded-md p-2 text-gray-900"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-gray-900 font-medium">Round Duration (seconds)</label>
                <input
                  type="number"
                  name="roundDuration"
                  value={gameSettings.roundDuration}
                  onChange={handleSettingsChange}
                  min="60"
                  max="1800"
                  className="border-2 rounded-md p-2 text-gray-900"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-gray-900 font-medium">Number of Rounds</label>
                <input
                  type="number"
                  name="numRounds"
                  value={gameSettings.numRounds}
                  onChange={handleSettingsChange}
                  min="1"
                  max="10"
                  className="border-2 rounded-md p-2 text-gray-900"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-gray-900 font-medium">Minimum Price</label>
                <input
                  type="number"
                  name="priceRange.min"
                  value={gameSettings.priceRange.min}
                  onChange={handleSettingsChange}
                  min="0"
                  max="999"
                  className="border-2 rounded-md p-2 text-gray-900"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-gray-900 font-medium">Maximum Price</label>
                <input
                  type="number"
                  name="priceRange.max"
                  value={gameSettings.priceRange.max}
                  onChange={handleSettingsChange}
                  min="1"
                  max="10000"
                  className="border-2 rounded-md p-2 text-gray-900"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={initializeGame}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Start Game
              </button>
            </div>
          </div>
        )}

        {gameState.gameStatus !== 'setup' && (
          <>
            {/* プレイヤー情報表示 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* バイヤー情報 */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-xl font-semibold text-blue-800 mb-3">Buyers</h3>
                <div className="space-y-3">
                  {players.buyers.map(buyer => (
                    <div key={buyer.id} className="bg-white p-3 rounded-md shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{buyer.name}</span>
                        <span className="text-blue-700 font-semibold">Max: {buyer.reservePrice}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* セラー情報 */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-xl font-semibold text-green-800 mb-3">Sellers</h3>
                <div className="space-y-3">
                  {players.sellers.map(seller => (
                    <div key={seller.id} className="bg-white p-3 rounded-md shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{seller.name}</span>
                        <span className="text-green-700 font-semibold">Min: {seller.reservePrice}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 取引入力セクション */}
            {gameState.isRoundActive && (
              <div className="bg-gray-100 p-4 rounded-lg mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Register New Trade</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-gray-900 font-medium">Buyer</label>
                    <select
                      name="buyerId"
                      value={currentTrade.buyerId}
                      onChange={handleTradeChange}
                      className="border-2 rounded-md p-2 text-gray-900"
                    >
                      <option value="">Select Buyer</option>
                      {players.buyers.map(buyer => (
                        <option key={buyer.id} value={buyer.id}>{buyer.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-gray-900 font-medium">Seller</label>
                    <select
                      name="sellerId"
                      value={currentTrade.sellerId}
                      onChange={handleTradeChange}
                      className="border-2 rounded-md p-2 text-gray-900"
                    >
                      <option value="">Select Seller</option>
                      {players.sellers.map(seller => (
                        <option key={seller.id} value={seller.id}>{seller.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-gray-900 font-medium">Price</label>
                    <input
                      type="number"
                      name="price"
                      value={currentTrade.price}
                      onChange={handleTradeChange}
                      min={gameSettings.priceRange.min}
                      max={gameSettings.priceRange.max}
                      className="border-2 rounded-md p-2 text-gray-900"
                    />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={registerTrade}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <div className="flex items-center gap-2">
                      <ArrowRightLeft className="w-5 h-5" />
                      <span>Register Trade</span>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* アクションボタン */}
            {!gameState.isRoundActive && gameState.gameStatus !== 'finished' && (
              <button
                onClick={startRound}
                className="w-full mb-6 px-6 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700"
              >
                {gameState.gameStatus === 'playing' ? 'Start Round' : `Start Round ${gameState.currentRound}`}
              </button>
            )}

            {/* 取引履歴テーブル */}
            {trades.length > 0 && (
              <div className="mt-8">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-6 h-6 text-gray-800" />
                  <h3 className="text-2xl font-bold text-gray-900">Trade History</h3>
                </div>
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="p-4 text-left text-gray-900 font-semibold border-b">Round</th>
                        <th className="p-4 text-left text-gray-900 font-semibold border-b">Buyer</th>
                        <th className="p-4 text-left text-gray-900 font-semibold border-b">Seller</th>
                        <th className="p-4 text-left text-gray-900 font-semibold border-b">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trades.map((trade) => (
                        <tr key={trade.id} className="border-b hover:bg-gray-50">
                          <td className="p-4 text-gray-900">{trade.round}</td>
                          <td className="p-4 text-gray-900">{trade.buyerName}</td>
                          <td className="p-4 text-gray-900">{trade.sellerName}</td>
                          <td className="p-4 text-gray-900">{trade.price}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ゲーム終了メッセージ */}
            {gameState.gameStatus === 'finished' && (
              <div className="mb-6 p-6 bg-yellow-100 border-l-4 border-yellow-400 rounded-lg">
                <p className="text-xl font-semibold text-yellow-800">
                  Game Over! Total trades: {trades.length}
                </p>
                <button
                  onClick={() => {
                    setIsSettingsOpen(true);
                    setGameState(prev => ({ ...prev, gameStatus: 'setup' }));
                  }}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Start New Game
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MarketTrading;
