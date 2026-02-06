import { useEffect, useState } from 'react'

const heartEmojis = ['💖', '💕', '💗', '💓', '💝', '💘', '❤️', '🩷']

export const useHeartCursor = () => {
    const [hearts, setHearts] = useState([])

    useEffect(() => {
        let heartId = 0

        const createHeart = (x, y) => {
            const id = heartId++
            const heart = {
                id,
                x,
                y,
                size: Math.random() * 30 + 30, // Bigger hearts: 30-60px
                opacity: 1,
                velocityX: (Math.random() - 0.5) * 3,
                velocityY: -Math.random() * 4 - 3,
                rotation: Math.random() * 360,
                emoji: heartEmojis[Math.floor(Math.random() * heartEmojis.length)],
                scale: 1
            }

            setHearts(prev => [...prev.slice(-30), heart]) // Keep more hearts

            setTimeout(() => {
                setHearts(prev => prev.filter(h => h.id !== id))
            }, 3000) // Longer lifetime
        }

        const handleMouseMove = (e) => {
            // More frequent hearts (50% chance)
            if (Math.random() > 0.5) {
                createHeart(e.clientX, e.clientY)
            }
        }

        const handleClick = (e) => {
            // Burst of hearts on click
            for (let i = 0; i < 5; i++) {
                setTimeout(() => createHeart(e.clientX, e.clientY), i * 50)
            }
        }

        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('click', handleClick)

        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('click', handleClick)
        }
    }, [])

    return hearts
}

export const HeartCursorEffect = ({ hearts }) => {
    return (
        <div className="heart-cursor-container">
            {hearts.map(heart => (
                <div
                    key={heart.id}
                    className="cursor-heart"
                    style={{
                        left: heart.x,
                        top: heart.y,
                        fontSize: `${heart.size}px`,
                        '--rotate': `${heart.rotation}deg`,
                        '--velocity-x': `${heart.velocityX}px`,
                        '--velocity-y': `${heart.velocityY}px`
                    }}
                >
                    {heart.emoji}
                </div>
            ))}
        </div>
    )
}
