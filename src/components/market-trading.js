"use client";

import React, { useState, useEffect } from 'react';
import { Timer, Users, Settings, TrendingUp } from 'lucide-react';

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

    return () => clearInterval(timer);
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
          [child]: parseInt(value)
        }
      }));
    } else {
      setGameSettings(prev => ({
        ...prev,
        [name]: parseInt(value)
      }));
    }
  };

  // ゲーム初期化
  const initializeGame = () => {
    // 買い手の生成
    const newBuyers = Array.from({ length: gameSettings.numBuyers }, (_, i) => ({
      id: `buyer-${i + 1}`,
      type: 'buyer',
      name: `Buyer ${i + 1}`,
      reservePrice: Math.floor(Math.random() * 
        (gameSettings.priceRange.max - gameSettings.priceRange.min) + 
        gameSettings.priceRange.min),
      trades: []
    }));

    // 売り手の生成
    const newSellers = Array.from({ length: gameSettings.numSellers }, (_, i) => ({
      id: `seller-${i + 1}`,
      type: 'seller',
      name: `Seller ${i + 1}`,
      reservePrice: Math.floor(Math.random() * 
        (gameSettings.priceRange.max - gameSettings.priceRange.min) + 
        gameSettings.priceRange.min),
      trades: []
    }));

    setPlayers({
      buyers: newBuyers,
      sellers: newSellers
    });

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

  // 取引の登録
  const recordTrade = (buyerId, sellerId, price) => {
    const buyer = players.buyers.find(b => b.id === buyerId);
    const seller = players.sellers.find(s => s.id === sellerId);

    if (price <= buyer.reservePrice && price >= seller.reservePrice) {
      const newTrade = {
        round: gameState.currentRound,
        timestamp: new Date(),
        buyerId,
        sellerId,
        price,
        buyerName: buyer.name,
        sellerName: seller.name
      };

      setTrades(prev => [...prev, newTrade]);
      
      // プレイヤーの取引履歴更新
      setPlayers(prev => ({
        buyers: prev.buyers.map(b => 
          b.id === buyerId 
            ? { ...b, trades: [...b.trades, newTrade] }
            : b
        ),
        sellers: prev.sellers.map(s => 
          s.id === sellerId 
            ? { ...s, trades: [...s.trades, newTrade] }
            : s
        )
      }));

      return true;
    }
    return false;
  };

  // ラウンド終了
  const endRound = () => {
    if (gameState.currentRound >= gameSettings.numRounds) {
      setGameState(prev => ({
        ...prev,
        isRoundActive: false,
        gameStatus: 'finished'
      }));
    } else {
      setGameState(prev => ({
        ...prev,
        currentRound: prev.currentRound + 1,
        timeRemaining: gameSettings.roundDuration,
        isRoundActive: false,
        gameStatus: 'roundEnd'
      }));
    }
  };

  // ラウンド開始
  const startRound = () => {
    setGameState(prev => ({
      ...prev,
      isRoundActive: true,
      gameStatus: 'playing'
    }));
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="bg-white shadow-lg rounded-lg p-8">
        {/* ヘッダー */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Market Trading Game</h2>
          <div className="flex items-center gap-4">
            {gameState.gameStatus !== 'setup' && (
              <>
                <span className="text-lg font-semibold text-gray-900">
                  Round {gameState.currentRound}/{gameSettings.numRounds}
                </span>
                <div className="flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-lg">
                  <Timer className="w-5 h-5 text-blue-600" />
                  <span className="text-lg font-semibold text-blue-600">
                    {Math.floor(gameState.timeRemaining / 60)}:
                    {(gameState.timeRemaining % 60).toString().padStart(2, '0')}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 設定パネル */}
        {isSettingsOpen && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Game Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  max="600"
                  step="30"
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
                  max="1000"
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
                  min="0"
                  max="1000"
                  className="border-2 rounded-md p-2 text-gray-900"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={initializeGame}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Start Game
              </button>
            </div>
          </div>
        )}

        {/* プレイヤー情報とトレード画面 */}
        {gameState.gameStatus !== 'setup' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
            {/* 買い手セクション */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Buyers</h3>
              <div className="space-y-4">
                {players.buyers.map(buyer => (
                  <div key={buyer.id} className="bg-white p-4 rounded-lg shadow">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">{buyer.name}</span>
                      <span className="text-blue-600">
                        Reserve: {buyer.reservePrice}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      Trades: {buyer.trades.length}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 売り手セクション */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Sellers</h3>
              <div className="space-y-4">
                {players.sellers.map(seller => (
                  <div key={seller.id} className="bg-white p-4 rounded-lg shadow">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">{seller.name}</span>
                      <span className="text-blue-600">
                        Reserve: {seller.reservePrice}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      Trades: {seller.trades.length}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* アクションボタン */}
        {gameState.gameStatus !== 'setup' && !gameState.isRoundActive && gameState.gameStatus !== 'finished' && (
          <button
            onClick={startRound}
            className="w-full mb-6 px-6 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700"
          >
            Start Round {gameState.currentRound}
          </button>
        )}

        {/* 取引履歴 */}
        {trades.length > 0 && (
          <div className="mt-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Trade History</h3>
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
                  {trades.map((trade, i) => (
                    <tr key={i} className="border-b hover:bg-gray-50">
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
                setIsSettings
onClick={() => {
                setIsSettingsOpen(true);
                setGameState(prev => ({
                  ...prev,
                  gameStatus: 'setup'
                }));
              }}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Start New Game
            </button>
          </div>
        )}

        {/* 取引入力フォーム */}
        {gameState.isRoundActive && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Record Trade</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const buyer = formData.get('buyer');
              const seller = formData.get('seller');
              const price = parseInt(formData.get('price'));
              
              if (recordTrade(buyer, seller, price)) {
                e.target.reset();
              } else {
                alert('Trade not possible with these terms');
              }
            }} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <select 
                  name="buyer" 
                  required
                  className="w-full border-2 rounded-md p-2"
                >
                  <option value="">Select Buyer</option>
                  {players.buyers.map(buyer => (
                    <option key={buyer.id} value={buyer.id}>{buyer.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <select 
                  name="seller" 
                  required
                  className="w-full border-2 rounded-md p-2"
                >
                  <option value="">Select Seller</option>
                  {players.sellers.map(seller => (
                    <option key={seller.id} value={seller.id}>{seller.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <input
                  type="number"
                  name="price"
                  placeholder="Price"
                  required
                  min={gameSettings.priceRange.min}
                  max={gameSettings.priceRange.max}
                  className="w-full border-2 rounded-md p-2"
                />
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Record Trade
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketTrading;
