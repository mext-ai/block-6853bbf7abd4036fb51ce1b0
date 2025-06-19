import React, { useEffect, useState, useCallback } from 'react';

interface Card {
  id: number;
  symbol: string;
  name: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface BlockProps {
  title?: string;
  description?: string;
}

const Block: React.FC<BlockProps> = ({ title = "WWI Memory Game", description }) => {
  // WWI themed symbols and names
  const cardData = [
    { symbol: '🪖', name: 'Helmet' },
    { symbol: '✈️', name: 'Biplane' },
    { symbol: '💣', name: 'Bomb' },
    { symbol: '🎖️', name: 'Medal' },
    { symbol: '⚔️', name: 'Swords' },
    { symbol: '🏴', name: 'Flag' },
    { symbol: '📰', name: 'News' },
    { symbol: '🌍', name: 'Europe' }
  ];

  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [moves, setMoves] = useState<number>(0);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameCompleted, setGameCompleted] = useState<boolean>(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState<number>(0);

  // Initialize game
  const initializeGame = useCallback(() => {
    const duplicatedCards = [...cardData, ...cardData];
    const shuffledCards = duplicatedCards
      .sort(() => Math.random() - 0.5)
      .map((card, index) => ({
        id: index,
        symbol: card.symbol,
        name: card.name,
        isFlipped: false,
        isMatched: false
      }));
    
    setCards(shuffledCards);
    setFlippedCards([]);
    setMatchedPairs(0);
    setMoves(0);
    setGameStarted(false);
    setGameCompleted(false);
    setElapsedTime(0);
  }, []);

  // Initialize game on mount
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameStarted && !gameCompleted) {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [gameStarted, gameCompleted, startTime]);

  // Handle card click
  const handleCardClick = (cardId: number) => {
    if (!gameStarted) {
      setGameStarted(true);
      setStartTime(Date.now());
    }

    const card = cards[cardId];
    if (card.isFlipped || card.isMatched || flippedCards.length >= 2) {
      return;
    }

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    // Update card state
    setCards(prevCards =>
      prevCards.map(c =>
        c.id === cardId ? { ...c, isFlipped: true } : c
      )
    );

    // Check for match when two cards are flipped
    if (newFlippedCards.length === 2) {
      setMoves(moves + 1);
      const [firstCard, secondCard] = newFlippedCards.map(id => cards[id]);

      if (firstCard.symbol === secondCard.symbol) {
        // Match found
        setTimeout(() => {
          setCards(prevCards =>
            prevCards.map(c =>
              newFlippedCards.includes(c.id) ? { ...c, isMatched: true } : c
            )
          );
          setMatchedPairs(prev => prev + 1);
          setFlippedCards([]);
        }, 500);
      } else {
        // No match - flip cards back
        setTimeout(() => {
          setCards(prevCards =>
            prevCards.map(c =>
              newFlippedCards.includes(c.id) ? { ...c, isFlipped: false } : c
            )
          );
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  // Check for game completion
  useEffect(() => {
    if (matchedPairs === 8 && gameStarted) {
      setGameCompleted(true);
      // Send completion event
      const completionData = {
        type: 'BLOCK_COMPLETION',
        blockId: 'ww1-memory-game',
        completed: true,
        score: Math.max(100 - moves * 2, 10), // Score based on moves
        maxScore: 100,
        timeSpent: elapsedTime,
        data: { moves, timeInSeconds: Math.floor(elapsedTime / 1000) }
      };
      window.postMessage(completionData, '*');
      window.parent.postMessage(completionData, '*');
    }
  }, [matchedPairs, gameStarted, moves, elapsedTime]);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  const cardStyle = (card: Card) => ({
    width: '80px',
    height: '100px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: card.isMatched ? '#4CAF50' : card.isFlipped ? '#FFF' : '#8B4513',
    border: '2px solid #654321',
    borderRadius: '8px',
    cursor: card.isMatched ? 'default' : 'pointer',
    fontSize: '24px',
    fontWeight: 'bold',
    color: card.isFlipped || card.isMatched ? '#333' : '#8B4513',
    transition: 'all 0.3s ease',
    transform: card.isFlipped || card.isMatched ? 'rotateY(0deg)' : 'rotateY(180deg)',
    transformStyle: 'preserve-3d' as const,
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
    userSelect: 'none' as const
  });

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #2C1810 0%, #8B4513 50%, #D2B48C 100%)',
      padding: '20px',
      fontFamily: '"Times New Roman", serif',
      color: '#F5DEB3'
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '30px',
        background: 'rgba(0,0,0,0.3)',
        padding: '20px',
        borderRadius: '10px',
        border: '2px solid #8B4513'
      }}>
        <h1 style={{
          fontSize: '2.5rem',
          margin: '0 0 10px 0',
          textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
          color: '#F5DEB3'
        }}>
          {title}
        </h1>
        <p style={{
          fontSize: '1.1rem',
          margin: '0 0 20px 0',
          opacity: 0.9
        }}>
          Match pairs of WWI-themed cards. Remember the Great War of 1914-1918!
        </p>
        
        {/* Game Stats */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '30px',
          flexWrap: 'wrap',
          fontSize: '1.1rem'
        }}>
          <div>
            <strong>Moves:</strong> {moves}
          </div>
          <div>
            <strong>Pairs Found:</strong> {matchedPairs}/8
          </div>
          <div>
            <strong>Time:</strong> {formatTime(elapsedTime)}
          </div>
        </div>
      </div>

      {/* Game Board */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '15px',
        maxWidth: '400px',
        margin: '0 auto',
        padding: '20px',
        background: 'rgba(0,0,0,0.2)',
        borderRadius: '15px',
        border: '3px solid #8B4513'
      }}>
        {cards.map((card) => (
          <div
            key={card.id}
            style={cardStyle(card)}
            onClick={() => handleCardClick(card.id)}
          >
            {card.isFlipped || card.isMatched ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '28px', marginBottom: '4px' }}>
                  {card.symbol}
                </div>
                <div style={{ fontSize: '10px', fontWeight: 'normal' }}>
                  {card.name}
                </div>
              </div>
            ) : (
              <div style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#654321'
              }}>
                1914
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Game Completion */}
      {gameCompleted && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #8B4513, #D2B48C)',
            padding: '40px',
            borderRadius: '20px',
            textAlign: 'center',
            border: '4px solid #654321',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
          }}>
            <h2 style={{
              fontSize: '2.5rem',
              margin: '0 0 20px 0',
              color: '#2C1810'
            }}>
              🎖️ Victory! 🎖️
            </h2>
            <p style={{
              fontSize: '1.3rem',
              margin: '0 0 15px 0',
              color: '#2C1810'
            }}>
              You've completed the WWI Memory Challenge!
            </p>
            <div style={{
              fontSize: '1.1rem',
              color: '#2C1810',
              marginBottom: '25px'
            }}>
              <div>Total Moves: {moves}</div>
              <div>Time: {formatTime(elapsedTime)}</div>
              <div>Score: {Math.max(100 - moves * 2, 10)}/100</div>
            </div>
            <button
              onClick={initializeGame}
              style={{
                padding: '12px 24px',
                fontSize: '1.1rem',
                backgroundColor: '#2C1810',
                color: '#F5DEB3',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'all 0.3s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1a0f08'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2C1810'}
            >
              Play Again
            </button>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div style={{
        maxWidth: '600px',
        margin: '30px auto 0',
        textAlign: 'center',
        background: 'rgba(0,0,0,0.3)',
        padding: '20px',
        borderRadius: '10px',
        border: '2px solid #8B4513'
      }}>
        <h3 style={{ color: '#F5DEB3', marginBottom: '15px' }}>How to Play</h3>
        <p style={{ opacity: 0.9, lineHeight: 1.6 }}>
          Click on cards to reveal WWI-themed symbols. Find matching pairs by remembering their locations. 
          Complete the game with the fewest moves possible! Each symbol represents an important element 
          from the Great War of 1914-1918.
        </p>
      </div>
    </div>
  );
};

export default Block;