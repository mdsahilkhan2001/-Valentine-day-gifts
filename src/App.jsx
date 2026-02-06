import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import Confetti from 'react-confetti'
import {
  HandHeart,
  Heart,
  HeartHandshake,
  HeartPulse,
  HeartPlus,
  MessageCircleHeart,
  MessageSquareHeart,
  Mail,
  Sparkles,
  Gift,
  Smile,
  Clover,
  Check,
  Copy,
  Share2,
  ExternalLink
} from 'lucide-react'
import './App.css'
import { useHeartCursor, HeartCursorEffect } from './HeartCursor'

const noMessages = [
  'Are you sure? My heart is waiting... 💕',
  'Think again… You make my world brighter! ✨',
  'You know you want to click Yes 😏',
  'Don\'t be shy, say yes 💘',
  'My heart says Yes. Yours? 💓',
  'Every moment with you is special 🌹',
  'You\'re the reason I smile every day 😊',
  'Please? You mean everything to me! 💝'
]

// Sound effect functions using Web Audio API
const playSound = (frequency, duration, type = 'sine') => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.value = frequency
    oscillator.type = type

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + duration)
  } catch (error) {
    // Silently fail if audio is not supported
  }
}

const playHoverSound = () => playSound(800, 0.1)
const playClickSound = () => playSound(600, 0.15)
const playSuccessSound = () => {
  playSound(523, 0.15)
  setTimeout(() => playSound(659, 0.15), 100)
  setTimeout(() => playSound(784, 0.3), 200)
}

const useWindowSize = () => {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  })

  useEffect(() => {
    const handleResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight })
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return size
}

const iconSet = [
  HandHeart,
  Heart,
  HeartHandshake,
  HeartPulse,
  HeartPlus,
  MessageCircleHeart,
  MessageSquareHeart,
  Mail,
  Sparkles,
  Gift,
  Smile,
  Clover
]

const FloatingIcons = ({ count = 22 }) => {
  const icons = useMemo(
    () =>
      Array.from({ length: count }, (_, index) => ({
        left: Math.random() * 100,
        size: 20 + Math.random() * 20,
        duration: 8 + Math.random() * 10,
        delay: Math.random() * 6,
        opacity: 0.35 + Math.random() * 0.55,
        Icon: iconSet[index % iconSet.length],
        rotate: -8 + Math.random() * 16
      })),
    [count]
  )

  return (
    <div className="floating-icons" aria-hidden="true">
      {icons.map((icon, index) => (
        <span
          key={`icon-${index}`}
          className="icon"
          style={{
            left: `${icon.left}%`,
            width: `${icon.size}px`,
            height: `${icon.size}px`,
            opacity: icon.opacity,
            animationDuration: `${icon.duration}s`,
            animationDelay: `${icon.delay}s`,
            '--spin': `${icon.rotate}deg`
          }}
        >
          <icon.Icon size={icon.size} strokeWidth={2.1} />
        </span>
      ))}
    </div>
  )
}

const Illustration = () => (
  <div className="illustration" aria-hidden="true">
    <svg viewBox="0 0 360 260" role="img">
      <defs>
        <linearGradient id="heartGlow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ff98c3" />
          <stop offset="100%" stopColor="#ff4d88" />
        </linearGradient>
      </defs>
      <path
        d="M180 230c-58-38-120-82-120-138 0-34 24-58 56-58 22 0 40 12 52 30 12-18 30-30 52-30 32 0 56 24 56 58 0 56-62 100-120 138z"
        fill="url(#heartGlow)"
      />
      <circle cx="120" cy="120" r="22" fill="#fff" opacity="0.8" />
      <circle cx="240" cy="120" r="22" fill="#fff" opacity="0.8" />
      <circle cx="120" cy="120" r="10" fill="#ff5c93" />
      <circle cx="240" cy="120" r="10" fill="#ff5c93" />
      <path
        d="M150 165c12 16 48 16 60 0"
        stroke="#fff"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M92 64c10-14 36-18 52 0"
        stroke="#ffe6f0"
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />
      <path
        d="M216 64c10-14 36-18 52 0"
        stroke="#ffe6f0"
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />
    </svg>
  </div>
)

function App() {
  const [stage, setStage] = useState('generate')
  const [noCount, setNoCount] = useState(0)
  const [noPosition, setNoPosition] = useState({ left: 220, top: 120 })
  const [fromName, setFromName] = useState('')
  const [toName, setToName] = useState('')
  const [customMessage, setCustomMessage] = useState('')
  const [link, setLink] = useState('')
  const [copied, setCopied] = useState(false)
  const containerRef = useRef(null)
  const { width, height } = useWindowSize()
  const iconCount = width < 600 ? 14 : 22
  const hearts = useHeartCursor()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const from = params.get('from')
    const to = params.get('to')
    const msg = params.get('msg')
    if (from || to) {
      setFromName(from || 'You')
      setToName(to || 'Your Valentine')
      setCustomMessage(msg || '')
      setStage('ask')
    }
  }, [])

  const yesScale = Math.min(1 + noCount * 0.08, 1.6)
  const message = noCount
    ? noMessages[Math.min(noCount - 1, noMessages.length - 1)]
    : ''

  const generateLink = () => {
    const from = fromName.trim() || 'You'
    const to = toName.trim() || 'Your Valentine'
    const msg = customMessage.trim()
    const base = window.location.origin
    let nextLink = `${base}/?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`
    if (msg) {
      nextLink += `&msg=${encodeURIComponent(msg)}`
    }
    setLink(nextLink)
    setCopied(false)
    playClickSound()
  }

  const handleCopy = async () => {
    if (!link) return
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      playClickSound()
      setTimeout(() => setCopied(false), 3000)
    } catch {
      setCopied(false)
    }
  }

  const handleOpenLink = () => {
    if (!link) return
    window.open(link, '_blank')
    playClickSound()
  }

  const handleShare = async () => {
    if (!link) return
    playClickSound()
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Will You Be My Valentine? 💖',
          text: `${fromName.trim() || 'Someone special'} has a question for you!`,
          url: link
        })
      } catch (error) {
        // User cancelled share or share not supported
        handleCopy()
      }
    } else {
      handleCopy()
    }
  }

  const moveNoButton = () => {
    const container = containerRef.current
    if (!container) return

    const rect = container.getBoundingClientRect()
    const buttonWidth = 140
    const buttonHeight = 52
    const padding = 12

    const maxLeft = Math.max(padding, rect.width - buttonWidth - padding)
    const maxTop = Math.max(padding, rect.height - buttonHeight - padding)

    const left = padding + Math.random() * (maxLeft - padding)
    const top = padding + Math.random() * (maxTop - padding)

    setNoPosition({ left, top })
  }

  const handleNoAttempt = () => {
    setNoCount((prev) => prev + 1)
    moveNoButton()
    playHoverSound()
  }

  const handleNoPointerDown = (event) => {
    if (event.pointerType === 'touch') {
      event.preventDefault()
      handleNoAttempt()
    }
  }

  const fromLabel = fromName.trim() || 'You'
  const toLabel = toName.trim() || 'Your Valentine'

  return (
    <div className="app">
      <FloatingIcons count={iconCount} />
      <HeartCursorEffect hearts={hearts} />
      {stage === 'yes' && (
        <Confetti
          width={width}
          height={height}
          numberOfPieces={240}
          recycle={false}
        />
      )}
      <AnimatePresence mode="wait">
        {stage === 'generate' && (
          <motion.section
            key="generate"
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
          >
            <motion.p
              className="eyebrow"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Share the Love 💕
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
            >
              Create Your Valentine's Moment
            </motion.h1>
            <motion.p
              className="subtitle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Craft a personalized love message to make their heart flutter. ✨
            </motion.p>
            <motion.div
              className="input-row"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <input
                className="text-input"
                type="text"
                placeholder="Your name"
                value={fromName}
                onChange={(event) => setFromName(event.target.value)}
              />
              <input
                className="text-input"
                type="text"
                placeholder="Their name"
                value={toName}
                onChange={(event) => setToName(event.target.value)}
              />
            </motion.div>
            <motion.div
              className="input-row"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <input
                className="text-input full-width"
                type="text"
                placeholder="Custom message (optional)"
                value={customMessage}
                onChange={(event) => setCustomMessage(event.target.value)}
                maxLength={100}
              />
            </motion.div>
            <motion.button
              className="btn primary"
              type="button"
              onClick={generateLink}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Generate ✨
            </motion.button>
            {link && (
              <motion.div
                className="link-area"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <p className="small-note">✨ Share this magical link:</p>
                <motion.div
                  className="link-box"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {link}
                </motion.div>
                <div className="link-actions">
                  <motion.button
                    className="btn primary icon-btn"
                    type="button"
                    onClick={handleCopy}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {copied ? (
                      <>
                        <Check size={18} />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={18} />
                        <span>Copy Link</span>
                      </>
                    )}
                  </motion.button>
                  <motion.button
                    className="btn secondary icon-btn"
                    type="button"
                    onClick={handleOpenLink}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <ExternalLink size={18} />
                    <span>Open</span>
                  </motion.button>
                  <motion.button
                    className="btn accent icon-btn"
                    type="button"
                    onClick={handleShare}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Share2 size={18} />
                    <span>Share</span>
                  </motion.button>
                </div>
                <motion.button
                  className="btn ghost continue-btn"
                  type="button"
                  onClick={() => setStage('ask')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Continue to Preview →
                </motion.button>
              </motion.div>
            )}
          </motion.section>
        )}

        {stage === 'ask' && (
          <motion.section
            key="ask"
            className="card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
          >
            <div className="name-tag-wrap">
              <p className="name-tag">From {fromLabel} to {toLabel} 💞</p>
            </div>

            {/* Celebration Badge */}
            <motion.div
              className="celebration-badge"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: 'spring', bounce: 0.6 }}
            >
              <span className="badge-icon">🎉</span>
              <span className="badge-text">They Said Yes!</span>
            </motion.div>

            <motion.p
              className="eyebrow"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Valentine's Day Special
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, type: 'spring', bounce: 0.4 }}
            >
              {customMessage || 'Will you be my Valentine?'}
            </motion.h1>
            <motion.p
              className="subtitle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Your "yes" would make this the best Valentine's Day ever! 💕
            </motion.p>
            <div className="button-area" ref={containerRef}>
              <motion.button
                className="btn yes"
                style={{ transform: `scale(${yesScale})` }}
                whileHover={{ scale: yesScale + 0.05 }}
                whileTap={{ scale: yesScale - 0.02 }}
                onMouseEnter={playHoverSound}
                onClick={() => {
                  playSuccessSound()
                  setStage('yes')
                }}
              >
                Yes 💖
              </motion.button>
              <button
                className="btn no"
                style={{ left: `${noPosition.left}px`, top: `${noPosition.top}px` }}
                onMouseEnter={moveNoButton}
                onPointerDown={handleNoPointerDown}
                onClick={handleNoAttempt}
              >
                No 😅
              </button>
            </div>
            {message && <p className="message">{message}</p>}
          </motion.section>
        )}

        {stage === 'yes' && (
          <motion.section
            key="yes"
            className="card success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, type: 'spring' }}
          >
            <div className="name-tag-wrap">
              <p className="name-tag">From {fromLabel} to {toLabel} 💞</p>
            </div>
            <motion.p
              className="eyebrow celebration-eyebrow"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Perfect! 🎊
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, type: 'spring', bounce: 0.5 }}
            >
              You've Made My Heart Skip a Beat! 💖
            </motion.h1>
            <motion.p
              className="subtitle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              This is the start of something beautiful! You just made my day 💕
            </motion.p>

            {/* Animated Valentine GIF Images */}
            <div className="valentine-images enhanced">
              <motion.img
                src="/assets/image1.gif"
                alt="Valentine celebration"
                className="valentine-gif main-gif featured"
                initial={{ opacity: 0, scale: 0, rotate: -10 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ delay: 0.8, type: 'spring', bounce: 0.4 }}
                whileHover={{ scale: 1.1, rotate: 5 }}
              />
              <motion.img
                src="/assets/image2.gif"
                alt="Hearts"
                className="valentine-gif side-gif left enhanced"
                initial={{ opacity: 0, x: -50, rotate: -20 }}
                animate={{ opacity: 1, x: 0, rotate: 0 }}
                transition={{ delay: 1, type: 'spring' }}
                whileHover={{ scale: 1.15, rotate: -10 }}
              />
            </div>

            <motion.div
              className="illustration-container"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
            >
              <Illustration />
            </motion.div>

            <motion.p
              className="message success-message"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
            >
              Together, let's create memories that will last forever. Every moment with you is a treasure. 💖✨
            </motion.p>

            {/* Celebration Button */}
            <motion.button
              className="btn celebration-btn"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                playSuccessSound()
              }}
            >
              🎉 Celebrate! 🎉
            </motion.button>

            {/* Animated Sparkles */}
            <div className="sparkles-container">
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="sparkle"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                    rotate: [0, 180, 360]
                  }}
                  transition={{
                    duration: 2,
                    delay: 0.5 + i * 0.15,
                    repeat: Infinity,
                    repeatDelay: 2
                  }}
                  style={{
                    left: `${5 + i * 8}%`,
                    top: `${10 + (i % 3) * 30}%`
                  }}
                >
                  ✨
                </motion.div>
              ))}
            </div>

            {/* Floating hearts decoration */}
            <div className="floating-hearts enhanced">
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="floating-heart"
                  initial={{ opacity: 0, y: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    y: [-20, -120],
                    x: [0, (i % 2 === 0 ? 30 : -30)],
                    rotate: [0, (i % 2 === 0 ? 360 : -360)]
                  }}
                  transition={{
                    duration: 4,
                    delay: 1.5 + i * 0.2,
                    repeat: Infinity,
                    repeatDelay: 1
                  }}
                  style={{ left: `${5 + i * 8}%` }}
                >
                  {['💖', '💕', '💗', '💓'][i % 4]}
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div >
  )
}

export default App
