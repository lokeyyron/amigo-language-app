import { type ChangeEvent, useEffect, useMemo, useState } from 'react'
import { ASSETS, asset } from './assets'
import {
  checkLoggedIn,
  configureAmigoAuth,
  isAwsMode,
  loginWithEmail,
  logoutFromAmigo,
  registerWithEmail,
} from './services/amigoAuth'
import { amigoCloud, getCloudPrototypeStatus } from './services/amigoCloud'
import './App.css'

configureAmigoAuth()

type View = 'home' | 'lesson' | 'progress' | 'translate' | 'profile'
type Dialog = 'streak' | 'xp' | 'settings' | 'addFriend' | 'alerts' | 'leaderboard' | 'friendsList' | 'about' | null

type Stats = {
  xp: number
  streak: number
  lastPracticeDate: string
  completedLessonIds: string[]
  pronunciationAttempts: number
}

type Profile = {
  name: string
  username: string
  bio: string
  photo: string
  followers: number
  following: number
  friends: string[]
}

type AppSettings = {
  lessonReminders: boolean
  soundEffects: boolean
  pronunciationTips: boolean
  highContrast: boolean
}

type TranslationResult = {
  output: string
  note: string
  matched: boolean
}

type ChoiceLesson = {
  id: string
  type: 'choice'
  title: string
  category: string
  phrase: string
  meaning: string
  prompt: string
  choices: string[]
  answer: string
  xp: number
}

type SpeechLesson = {
  id: string
  type: 'speech'
  title: string
  category: string
  phrase: string
  meaning: string
  prompt: string
  target: string
  xp: number
}

type Lesson = ChoiceLesson | SpeechLesson

type BrowserSpeechRecognition = {
  lang: string
  interimResults: boolean
  maxAlternatives: number
  onstart: (() => void) | null
  onend: (() => void) | null
  onerror: (() => void) | null
  onresult: ((event: Event) => void) | null
  start: () => void
}

type BrowserSpeechRecognitionConstructor = new () => BrowserSpeechRecognition

const STATS_STORAGE_KEY = 'amigo-demo-stats'
const PROFILE_STORAGE_KEY = 'amigo-demo-profile'
const SETTINGS_STORAGE_KEY = 'amigo-demo-settings'
const APP_VERSION = 'Version 1.0.0'

const initialStats: Stats = {
  xp: 670,
  streak: 12,
  lastPracticeDate: '',
  completedLessonIds: ['basics-1'],
  pronunciationAttempts: 0,
}

const initialProfile: Profile = {
  name: 'Luke Aaron Velasquez',
  username: '@lokeyyron',
  bio: 'Learning Bisaya one lesson at a time.',
  photo: '',
  followers: 10,
  following: 9,
  friends: ['Andrew', 'Carlos', 'Keith', 'Ethan'],
}

const initialSettings: AppSettings = {
  lessonReminders: true,
  soundEffects: true,
  pronunciationTips: true,
  highContrast: false,
}

const languages = [
  {
    name: 'Bisaya',
    subtitle: 'Cebuano - Widely spoken',
    status: 'Start',
    unlocked: true,
    color: 'earth',
    icon: ASSETS.languageIcons.bisaya,
  },
  {
    name: 'Maguindanaon',
    subtitle: 'Cotabato - BARMM',
    status: 'Start',
    unlocked: false,
    color: 'sunset',
    icon: ASSETS.languageIcons.maguindanaon,
  },
  {
    name: 'Maranao',
    subtitle: 'Lanao - Lake Province',
    status: 'Start',
    unlocked: false,
    color: 'coral',
    icon: ASSETS.languageIcons.maranao,
  },
  {
    name: 'Tausug',
    subtitle: 'Sulu Archipelago',
    status: 'Go',
    unlocked: false,
    color: 'stone',
    icon: ASSETS.languageIcons.tausug,
  },
  {
    name: 'Dabawenyo',
    subtitle: 'Davao Region',
    status: 'Go',
    unlocked: false,
    color: 'leaf',
    icon: ASSETS.languageIcons.dabawenyo,
  },
  {
    name: 'Chavacano',
    subtitle: 'Zamboanga City',
    status: 'Go',
    unlocked: false,
    color: 'peach',
    icon: ASSETS.languageIcons.chavacano,
  },
]

const lessons: Lesson[] = [
  {
    id: 'basics-1',
    type: 'choice',
    title: 'Greetings & Introduction',
    category: 'Lesson 1',
    phrase: 'Maayong buntag',
    meaning: 'Good morning',
    prompt: 'What does this phrase mean?',
    choices: ['Good morning', 'Good night', 'Thank you'],
    answer: 'Good morning',
    xp: 50,
  },
  {
    id: 'basics-2',
    type: 'choice',
    title: 'Checking In',
    category: 'Lesson 2',
    phrase: 'Kumusta ka?',
    meaning: 'How are you?',
    prompt: 'Choose the correct translation.',
    choices: ['How are you?', 'Where are you from?', 'See you later'],
    answer: 'How are you?',
    xp: 50,
  },
  {
    id: 'intro-1',
    type: 'choice',
    title: 'Where Are You From?',
    category: 'Lesson 3',
    phrase: 'Taga asa ka?',
    meaning: 'Where are you from?',
    prompt: 'Translate this Bisaya phrase.',
    choices: ['What is your name?', 'Where are you from?', 'Good afternoon'],
    answer: 'Where are you from?',
    xp: 60,
  },
  {
    id: 'speaking-1',
    type: 'speech',
    title: 'Pronunciation Practice',
    category: 'Speaking',
    phrase: 'Maayong buntag',
    meaning: 'Good morning',
    prompt: 'Say this phrase out loud.',
    target: 'maayong buntag',
    xp: 75,
  },
  {
    id: 'polite-1',
    type: 'choice',
    title: 'Polite Words',
    category: 'Lesson 4',
    phrase: 'Salamat',
    meaning: 'Thank you',
    prompt: 'Pick the English meaning.',
    choices: ['Thank you', 'Excuse me', 'Good evening'],
    answer: 'Thank you',
    xp: 45,
  },
  {
    id: 'polite-2',
    type: 'choice',
    title: 'Asking Nicely',
    category: 'Lesson 5',
    phrase: 'Palihug',
    meaning: 'Please',
    prompt: 'What does this word mean?',
    choices: ['Please', 'Friend', 'Tomorrow'],
    answer: 'Please',
    xp: 45,
  },
  {
    id: 'family-1',
    type: 'choice',
    title: 'Family Words',
    category: 'Lesson 6',
    phrase: 'Pamilya',
    meaning: 'Family',
    prompt: 'Choose the matching translation.',
    choices: ['Family', 'School', 'Food'],
    answer: 'Family',
    xp: 50,
  },
  {
    id: 'daily-1',
    type: 'choice',
    title: 'Daily Check-in',
    category: 'Lesson 7',
    phrase: 'Maayo ko',
    meaning: 'I am good',
    prompt: 'What does this phrase mean?',
    choices: ['I am good', 'I am going home', 'I am hungry'],
    answer: 'I am good',
    xp: 55,
  },
]

const phrases = [
  { language: 'Bisaya', phrase: 'Kumusta ka?', meaning: 'How are you?' },
  { language: 'Maguindanaon', phrase: 'Mapia ka?', meaning: 'Are you well?' },
]

const friendStreaks = [
  { name: 'Andrew', streak: 13, active: true },
  { name: 'Carlos', streak: 5, active: false },
  { name: 'Keith', streak: 9, active: true },
  { name: 'Ethan', streak: 12, active: true },
]

const friendLeaderboard = [
  { name: 'Keith', xp: 920, rank: 1 },
  { name: 'Andrew', xp: 845, rank: 2 },
  { name: 'Ethan', xp: 710, rank: 4 },
  { name: 'Carlos', xp: 680, rank: 5 },
]

const translationDictionary = [
  { inputs: ['good morning', 'morning'], output: 'Maayong buntag' },
  { inputs: ['how are you', 'how are you?'], output: 'Kumusta ka?' },
  { inputs: ['where are you from', 'where are you from?'], output: 'Taga asa ka?' },
  { inputs: ['thank you', 'thanks'], output: 'Salamat' },
  { inputs: ['please'], output: 'Palihug' },
  { inputs: ['family'], output: 'Pamilya' },
  { inputs: ['i am good', "i'm good", 'i am fine'], output: 'Maayo ko' },
  { inputs: ['good afternoon'], output: 'Maayong hapon' },
  { inputs: ['good evening'], output: 'Maayong gabii' },
  { inputs: ['what is your name', 'what is your name?'], output: 'Unsa imong ngalan?' },
]

const phraseAudioSources: Record<string, string> = {
  [normalizeTranslationInput('Maayong buntag')]: asset('audio/bisaya/maayong-buntag.mp3'),
  [normalizeTranslationInput('Kumusta ka?')]: asset('audio/bisaya/kumusta-ka.mp3'),
  [normalizeTranslationInput('Taga asa ka?')]: asset('audio/bisaya/taga-asa-ka.mp3'),
  [normalizeTranslationInput('Salamat')]: asset('audio/bisaya/salamat.mp3'),
  [normalizeTranslationInput('Palihug')]: asset('audio/bisaya/palihug.mp3'),
  [normalizeTranslationInput('Pamilya')]: asset('audio/bisaya/pamilya.mp3'),
  [normalizeTranslationInput('Maayo ko')]: asset('audio/bisaya/maayo-ko.mp3'),
  [normalizeTranslationInput('Maayong hapon')]: asset('audio/bisaya/maayong-hapon.mp3'),
  [normalizeTranslationInput('Maayong gabii')]: asset('audio/bisaya/maayong-gabii.mp3'),
  [normalizeTranslationInput('Unsa imong ngalan?')]: asset('audio/bisaya/unsa-imong-ngalan.mp3'),
  [normalizeTranslationInput('Mapia ka?')]: asset('audio/bisaya/mapia-ka.mp3'),
}

const aboutTeam = [
  { name: 'Ethan Jeff Mernilo', role: 'Team Leader' },
  { name: 'Luke Aaron Velasquez', role: 'Head Developer · lukevels8@gmail.com · github.com/lokeyyron' },
  { name: 'Carlos Ysmael Miñoza', role: 'cbminoza@up.edu.ph' },
  { name: 'Keith Zheddrick Siao', role: 'zheddrickkeith@gmail.com' },
  { name: 'Andrew Earl Andres', role: '' },
]

function App() {
  const [isSplashVisible, setIsSplashVisible] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [view, setView] = useState<View>('home')
  const [selectedLessonId, setSelectedLessonId] = useState(lessons[0].id)
  const [selectedAnswer, setSelectedAnswer] = useState('')
  const [feedback, setFeedback] = useState('')
  const [notice, setNotice] = useState('')
  const [stats, setStats] = useState<Stats>(() => (isAwsMode() ? initialStats : loadStats()))
  const [profile, setProfile] = useState<Profile>(() => (isAwsMode() ? initialProfile : loadProfile()))
  const [settings, setSettings] = useState<AppSettings>(() => (isAwsMode() ? initialSettings : loadSettings()))
  const [dialog, setDialog] = useState<Dialog>(null)
  const [friendName, setFriendName] = useState('')
  const [transcript, setTranscript] = useState('')
  const [speechStatus, setSpeechStatus] = useState('Ready for microphone practice.')
  const [isListening, setIsListening] = useState(false)
  const [translateInput, setTranslateInput] = useState('Good morning')
  const [translation, setTranslation] = useState<TranslationResult>(() => translateToBisaya('Good morning'))

  const selectedLesson = useMemo(
    () => lessons.find((lesson) => lesson.id === selectedLessonId) ?? lessons[0],
    [selectedLessonId],
  )
  const selectedLessonIndex = useMemo(
    () => Math.max(0, lessons.findIndex((lesson) => lesson.id === selectedLesson.id)),
    [selectedLesson.id],
  )
  const completedCount = lessons.filter((lesson) => stats.completedLessonIds.includes(lesson.id)).length
  const lessonProgress = Math.round((completedCount / lessons.length) * 100)

  useEffect(() => {
    const timer = window.setTimeout(() => setIsSplashVisible(false), 1800)

    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    void checkLoggedIn().then(setIsLoggedIn)
  }, [])

  useEffect(() => {
    if (!isLoggedIn || !isAwsMode()) {
      return
    }

    void Promise.all([
      amigoCloud.loadAsync(STATS_STORAGE_KEY, initialStats),
      amigoCloud.loadAsync(PROFILE_STORAGE_KEY, initialProfile),
      amigoCloud.loadAsync(SETTINGS_STORAGE_KEY, initialSettings),
    ]).then(([nextStats, nextProfile, nextSettings]) => {
      setStats(nextStats)
      setProfile(normalizeProfile(nextProfile))
      setSettings(nextSettings)
    })
  }, [isLoggedIn])

  useEffect(() => {
    amigoCloud.save(STATS_STORAGE_KEY, stats)
  }, [stats])

  useEffect(() => {
    amigoCloud.save(PROFILE_STORAGE_KEY, profile)
  }, [profile])

  useEffect(() => {
    amigoCloud.save(SETTINGS_STORAGE_KEY, settings)
  }, [settings])

  function openLanguage(languageName: string, unlocked: boolean) {
    if (unlocked) {
      openLesson(lessons[0].id)
      return
    }

    setNotice(`${languageName} lessons are coming soon.`)
  }

  function resetLessonState() {
    setSelectedAnswer('')
    setFeedback('')
    setTranscript('')
    setSpeechStatus('Ready for microphone practice.')
    setNotice('')
  }

  function openLesson(lessonId: string) {
    setSelectedLessonId(lessonId)
    resetLessonState()
    setView('lesson')
  }

  function openLessonByIndex(nextIndex: number) {
    const nextLesson = lessons[nextIndex]

    if (nextLesson) {
      openLesson(nextLesson.id)
    }
  }

  function goTo(nextView: View) {
    setView(nextView)
    setNotice('')
    setFeedback('')
  }

  function completeLesson(lesson: Lesson, successMessage: string) {
    const alreadyCompleted = stats.completedLessonIds.includes(lesson.id)
    const earnedXp = alreadyCompleted ? 10 : lesson.xp
    const today = getTodayKey()
    const practicedToday = stats.lastPracticeDate === today

    setStats((currentStats) => ({
      ...currentStats,
      xp: currentStats.xp + earnedXp,
      streak: practicedToday ? currentStats.streak : currentStats.streak + 1,
      lastPracticeDate: today,
      completedLessonIds: currentStats.completedLessonIds.includes(lesson.id)
        ? currentStats.completedLessonIds
        : [...currentStats.completedLessonIds, lesson.id],
    }))

    setFeedback(`${successMessage} +${earnedXp} XP`)
  }

  function chooseAnswer(answer: string) {
    if (selectedLesson.type !== 'choice' || isLessonRewarded(feedback)) {
      return
    }

    setSelectedAnswer(answer)

    if (answer === selectedLesson.answer) {
      completeLesson(selectedLesson, 'Correct!')
      return
    }

    setFeedback(`Almost! The answer is "${selectedLesson.answer}".`)
  }

  function startSpeechPractice() {
    if (selectedLesson.type !== 'speech') {
      return
    }

    if (isLessonRewarded(feedback)) {
      setSpeechStatus('This practice already counted. Pick another lesson for more XP.')
      return
    }

    const Recognition = getSpeechRecognition()

    if (!Recognition) {
      setSpeechStatus('Speech recognition is not available here. Use Chrome or the demo pass button.')
      return
    }

    const recognition = new Recognition()
    recognition.lang = 'fil-PH'
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.onstart = () => {
      setIsListening(true)
      setSpeechStatus('Listening...')
    }
    recognition.onend = () => setIsListening(false)
    recognition.onerror = () => {
      setIsListening(false)
      setSpeechStatus('Microphone check failed. You can still mark it correct for practice.')
    }
    recognition.onresult = (event: Event) => {
      const spokenText = getTranscriptFromEvent(event)
      const matched = isSpeechCloseEnough(spokenText, selectedLesson.target)
      const isLastLesson = selectedLessonIndex >= lessons.length - 1

      setTranscript(spokenText)
      setStats((currentStats) => ({
        ...currentStats,
        pronunciationAttempts: currentStats.pronunciationAttempts + 1,
      }))

      if (matched) {
        completeLesson(selectedLesson, isLastLesson ? 'Lesson completed!' : 'Good!')
        setSpeechStatus(isLastLesson ? 'Good! Lesson completed.' : 'Good! Moving to the next lesson...')
        if (!isLastLesson) {
          window.setTimeout(() => openLessonByIndex(selectedLessonIndex + 1), 1200)
        }
        return
      }

      setSpeechStatus("You're getting it. Try it again.")
    }
    recognition.start()
  }

  function passSpeechDemo() {
    if (selectedLesson.type !== 'speech') {
      return
    }

    if (isLessonRewarded(feedback)) {
      setSpeechStatus('This practice already counted. Pick another lesson for more XP.')
      return
    }

    const isLastLesson = selectedLessonIndex >= lessons.length - 1

    setTranscript(selectedLesson.phrase)
    setStats((currentStats) => ({
      ...currentStats,
      pronunciationAttempts: currentStats.pronunciationAttempts + 1,
    }))
    completeLesson(selectedLesson, isLastLesson ? 'Lesson completed!' : 'Good!')
    setSpeechStatus(isLastLesson ? 'Good! Lesson completed.' : 'Good! Moving to the next lesson...')
    if (!isLastLesson) {
      window.setTimeout(() => openLessonByIndex(selectedLessonIndex + 1), 1200)
    }
  }

  function playAudioPhrase(phrase: string) {
    void playPhraseAudio(phrase)
  }

  function updateProfile(update: Partial<Profile>) {
    setProfile((currentProfile) => ({ ...currentProfile, ...update }))
  }

  function updateSettings(update: Partial<AppSettings>) {
    setSettings((currentSettings) => ({ ...currentSettings, ...update }))
  }

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        updateProfile({ photo: reader.result })
      }
    }
    reader.readAsDataURL(file)
    event.target.value = ''
  }

  function addFriend() {
    const nextFriend = friendName.trim()

    if (!nextFriend) {
      return
    }

    setProfile((currentProfile) => {
      if (currentProfile.friends.includes(nextFriend)) {
        return currentProfile
      }

      return {
        ...currentProfile,
        following: currentProfile.following + 1,
        friends: [...currentProfile.friends, nextFriend],
      }
    })
    setFriendName('')
    setDialog(null)
  }

  function runTranslation() {
    setTranslation(translateToBisaya(translateInput))
  }

  return (
    <main className={`app ${settings.highContrast ? 'high-contrast' : ''}`}>
      {isSplashVisible && <SplashScreen />}
      {!isSplashVisible && !isLoggedIn && (
        <LoginScreen onLogin={() => setIsLoggedIn(true)} onSessionChange={setIsLoggedIn} />
      )}
      {!isSplashVisible && isLoggedIn && (
        <>
      <section className="mobile-shell" aria-label="Amigo app">
        <div className="content-area">
          <div className="view-panel" key={view}>
          {view === 'home' && (
            <>
              <Header stats={stats} onOpenDialog={setDialog} />
              <section className="hero-card tap-card">
                <div>
                  <p className="eyebrow">Maayong buntag!</p>
                  <h2>Padayon, Migo!</h2>
                  <p>You are on a <span>{stats.streak}-day streak</span>. Keep going!</p>
                </div>
              </section>

              <button className="lesson-banner" onClick={() => openLesson(lessons[0].id)}>
                <span className="lesson-tag">Bisaya</span>
                <strong>Greetings & Introduction</strong>
                <small>Lesson 4 - {lessons.length - completedCount} left</small>
                <span className="script-watermark" />
                <span className="play-circle">
                  <PlayButtonIcon />
                </span>
              </button>

              <section className="challenge-card tap-card">
                <div>
                  <p className="eyebrow">Today's challenge</p>
                  <strong>Translate this phrase to Bisaya:</strong>
                  <h3>Where are you from?</h3>
                  <small>+50 XP bonus - Ends in 8h 42m</small>
                </div>
                <button onClick={() => openLesson('intro-1')}>Try it<br />+ 50 XP</button>
              </section>

              <SectionTitle title="Explore Mindanao Languages" description="Languages of Mindanao - discover yours!" />

              {notice && <p className="notice">{notice}</p>}

              <section className="language-grid">
                {languages.map((language) => (
                  <button
                    className={`language-card ${language.color} ${language.unlocked ? '' : 'locked'}`}
                    key={language.name}
                    onClick={() => openLanguage(language.name, language.unlocked)}
                  >
                    <img alt="" className="language-mark" src={language.icon} />
                    <strong>{language.name}</strong>
                    <small>{language.subtitle}</small>
                    <span className="mini-pill">{language.status}</span>
                  </button>
                ))}
                <button
                  className="language-card add-card"
                  onClick={() => setNotice('More language packs can be added later.')}
                >
                  +
                </button>
              </section>

              <section className="phrase-section">
                <h3>Phrases of the day!</h3>
                <div className="phrase-grid">
                  {phrases.map((item) => (
                    <article className="phrase-card tap-card" key={item.phrase}>
                      <small>{item.language}</small>
                      <strong>"{item.phrase}"</strong>
                      <span>{item.meaning}</span>
                      <em>Tap to hear</em>
                    </article>
                  ))}
                </div>
              </section>
            </>
          )}

          {view === 'lesson' && (
            <LessonView
              feedback={feedback}
              isListening={isListening}
              lesson={selectedLesson}
              lessonIndex={selectedLessonIndex}
              onBack={() => goTo('home')}
              onChooseAnswer={chooseAnswer}
              onDemoSpeechPass={passSpeechDemo}
              onNextLesson={() => openLessonByIndex(selectedLessonIndex + 1)}
              onPlayAudio={playAudioPhrase}
              onPreviousLesson={() => openLessonByIndex(selectedLessonIndex - 1)}
              onStartSpeech={startSpeechPractice}
              selectedAnswer={selectedAnswer}
              speechStatus={speechStatus}
              totalLessons={lessons.length}
              transcript={transcript}
            />
          )}

          {view === 'profile' && (
            <ProfileView
              onOpenDialog={setDialog}
              profile={profile}
              stats={stats}
            />
          )}
          {view === 'progress' && (
            <ProgressView
              lessonProgress={lessonProgress}
              lessons={lessons}
              onOpenDialog={setDialog}
              stats={stats}
            />
          )}
          {view === 'translate' && (
            <TranslateView
              onOpenDialog={setDialog}
              onPlayAudio={playAudioPhrase}
              onTranslate={runTranslation}
              onTranslateInputChange={setTranslateInput}
              stats={stats}
              translateInput={translateInput}
              translation={translation}
            />
          )}
          </div>
        </div>

        <BottomNav activeView={view} onNavigate={goTo} />
      </section>

      {(dialog === 'streak' || dialog === 'xp') && (
        <StatInfoDialog dialog={dialog} stats={stats} onClose={() => setDialog(null)} />
      )}
      {dialog === 'settings' && (
        <SettingsDialog
          onClose={() => setDialog(null)}
          onLogout={() => {
            void logoutFromAmigo().finally(() => {
              setIsLoggedIn(false)
              setDialog(null)
            })
          }}
          onOpenAbout={() => setDialog('about')}
          onPhotoChange={handlePhotoChange}
          onProfileChange={updateProfile}
          onSettingsChange={updateSettings}
          profile={profile}
          settings={settings}
        />
      )}
      {dialog === 'about' && <AboutUsDialog onClose={() => setDialog(null)} />}
      {dialog === 'alerts' && <AlertsDialog onClose={() => setDialog(null)} />}
      {dialog === 'leaderboard' && (
        <LeaderboardDialog
          onAddFriend={() => setDialog('addFriend')}
          onClose={() => setDialog(null)}
          profile={profile}
          stats={stats}
        />
      )}
      {dialog === 'friendsList' && (
        <FriendsListDialog
          onClose={() => setDialog(null)}
          profile={profile}
        />
      )}
      {dialog === 'addFriend' && (
        <AddFriendDialog
          friendName={friendName}
          friends={profile.friends}
          onAddFriend={addFriend}
          onClose={() => setDialog(null)}
          onFriendNameChange={setFriendName}
        />
      )}
        </>
      )}
    </main>
  )
}

function SplashScreen() {
  return (
    <section className="splash-screen" aria-label="Opening Amigo">
      <img alt="Amigo tarsier" className="splash-mascot" src={ASSETS.brandMascot} />
      <p className="screen-version">{APP_VERSION}</p>
    </section>
  )
}

function LoginScreen({
  onLogin,
  onSessionChange,
}: {
  onLogin: () => void
  onSessionChange: (loggedIn: boolean) => void
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [authMessage, setAuthMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleAwsAuth() {
    if (!email.trim() || !password) {
      setAuthMessage('Enter your email and password.')
      return
    }

    setIsSubmitting(true)
    setAuthMessage('')

    try {
      if (isSignUp) {
        await registerWithEmail(email, password)
        setAuthMessage('Account created. Check your email, then log in.')
        setIsSignUp(false)
        return
      }

      await loginWithEmail(email, password)
      onSessionChange(true)
    } catch {
      setAuthMessage(isSignUp ? 'Sign up failed. Try a stronger password.' : 'Login failed. Check your email and password.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="auth-screen" aria-label="Amigo login">
      <div className="auth-brand">
        <img alt="Amigo tarsier" className="auth-mascot" src={ASSETS.brandMascot} />
        <img alt="amigo" className="auth-logo" src={ASSETS.brandLogo} />
      </div>

      {isAwsMode() ? (
        <div className="auth-form">
          <label className="dialog-field">
            Email
            <input onChange={(event) => setEmail(event.target.value)} type="email" value={email} />
          </label>
          <label className="dialog-field">
            Password
            <input onChange={(event) => setPassword(event.target.value)} type="password" value={password} />
          </label>
          {authMessage && <p className="notice">{authMessage}</p>}
          <div className="auth-actions">
            <button className="primary-button" disabled={isSubmitting} onClick={() => void handleAwsAuth()} type="button">
              {isSignUp ? 'Create account' : 'Log in'}
            </button>
            <button className="secondary-button" onClick={() => setIsSignUp((current) => !current)} type="button">
              {isSignUp ? 'Back to log in' : 'Sign up'}
            </button>
          </div>
        </div>
      ) : (
        <div className="auth-actions">
          <button className="primary-button" onClick={onLogin} type="button">Log in</button>
          <button className="secondary-button" type="button">Sign up</button>
        </div>
      )}

      <p className="screen-version">{APP_VERSION}</p>
    </section>
  )
}

function Header({
  stats,
  onOpenDialog,
}: {
  stats: Stats
  onOpenDialog: (dialog: Dialog) => void
}) {
  return (
    <header className="top-bar">
      <button className="stat-pill" onClick={() => onOpenDialog('streak')}>
        <img alt="" className="fire-icon-img fire-icon-img--sm" src={ASSETS.fire} />
        {stats.streak}
      </button>
      <img alt="amigo" className="brand-logo" src={ASSETS.brandLogo} />
      <button className="xp-pill" onClick={() => onOpenDialog('xp')}>
        {stats.xp} XP
      </button>
    </header>
  )
}

function SectionTitle({ title, description }: { title: string; description: string }) {
  return (
    <div className="section-title">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  )
}

function PlayButtonIcon({ className = '' }: { className?: string }) {
  return (
    <span className={`play-button-icon ${className}`} aria-hidden="true">
      <span className="play-button-fallback" />
      <img
        alt=""
        onError={(event) => { event.currentTarget.hidden = true }}
        src={ASSETS.playButton}
      />
    </span>
  )
}

function LessonView({
  lesson,
  lessonIndex,
  totalLessons,
  selectedAnswer,
  feedback,
  transcript,
  speechStatus,
  isListening,
  onBack,
  onChooseAnswer,
  onStartSpeech,
  onDemoSpeechPass,
  onPlayAudio,
  onPreviousLesson,
  onNextLesson,
}: {
  lesson: Lesson
  lessonIndex: number
  totalLessons: number
  selectedAnswer: string
  feedback: string
  transcript: string
  speechStatus: string
  isListening: boolean
  onBack: () => void
  onChooseAnswer: (answer: string) => void
  onStartSpeech: () => void
  onDemoSpeechPass: () => void
  onPlayAudio: (phrase: string) => void
  onPreviousLesson: () => void
  onNextLesson: () => void
}) {
  const isCorrectFeedback = feedback.includes('Correct') || feedback.includes('accepted')
  const chapterProgress = Math.round(((lessonIndex + 1) / totalLessons) * 100)
  const hasPrevious = lessonIndex > 0
  const hasNext = lessonIndex < totalLessons - 1

  return (
    <section className="screen lesson-screen">
      <div className="lesson-topbar">
        <button className="back-button" onClick={onBack}>Back</button>
        <span>{lessonIndex + 1} / {totalLessons}</span>
      </div>

      <article className="chapter-card">
        <div className="chapter-card-header">
          <div>
            <p className="eyebrow">Bisaya chapter</p>
            <h2>{lesson.title}</h2>
            <p>{lesson.category} - {lesson.xp} XP</p>
          </div>
          <img alt="Amigo mascot" className="mascot-image tiny" src={ASSETS.brandMascot} />
        </div>

        <div className="progress-line">
          <span style={{ width: `${chapterProgress}%` }} />
        </div>

        <p className="lesson-prompt">{lesson.prompt}</p>

        <button className="audio-card" onClick={() => onPlayAudio(lesson.phrase)} type="button">
          <span className="sound-icon">
            <PlayButtonIcon className="play-button-icon--large" />
          </span>
          <strong>{lesson.phrase}</strong>
          <small>{lesson.meaning}</small>
          <em>Tap to hear</em>
        </button>

        {lesson.type === 'choice' && (
          <div className="answer-list">
            {lesson.choices.map((answer) => (
              <button
                className={`answer-card ${selectedAnswer === answer ? 'selected' : ''}`}
                key={answer}
                onClick={() => onChooseAnswer(answer)}
              >
                {answer}
              </button>
            ))}
          </div>
        )}

        {lesson.type === 'speech' && (
          <section className="speech-panel">
            <button className="primary-button" onClick={onStartSpeech}>
              {isListening ? 'Listening...' : 'Start Speaking'}
            </button>
            <button className="secondary-button" onClick={onDemoSpeechPass}>Mark Correct</button>
            <p>{speechStatus}</p>
            {transcript && <strong>Heard: "{transcript}"</strong>}
          </section>
        )}

        {feedback && (
          <div className={`feedback-card ${isCorrectFeedback ? 'correct' : 'wrong'}`}>
            <strong>{isCorrectFeedback ? 'Great work' : 'Review'}</strong>
            <p>{feedback}</p>
          </div>
        )}

        <div className="lesson-controls">
          <button className="secondary-button" disabled={!hasPrevious} onClick={onPreviousLesson}>
            Previous
          </button>
          <button className="primary-button" disabled={!hasNext} onClick={onNextLesson}>
            {hasNext ? 'Next Lesson' : 'Done'}
          </button>
        </div>
      </article>
    </section>
  )
}

function ProfileView({
  stats,
  profile,
  onOpenDialog,
}: {
  stats: Stats
  profile: Profile
  onOpenDialog: (dialog: Dialog) => void
}) {
  const xpProgress = getXpProgress(stats.xp)
  const leaderboardRank = getUserLeaderboardRank(profile, stats)

  return (
    <section className="screen profile-screen">
      <div className="profile-header">
        <div className="profile-actions">
          <ProfileIconButton
            alt="Alerts"
            dialog="alerts"
            fallbackClassName="fallback-alert"
            onOpenDialog={onOpenDialog}
            src={ASSETS.alertIcon}
          />
          <ProfileIconButton
            alt="Settings"
            dialog="settings"
            fallbackClassName="fallback-settings"
            onOpenDialog={onOpenDialog}
            src={ASSETS.settingsIcon}
          />
        </div>

        <div className="profile-avatar">
          {profile.photo ? <img alt={`${profile.name} profile`} src={profile.photo} /> : <span>{getInitials(profile.name)}</span>}
        </div>
      </div>

      <div className="profile-body">
        <div className="profile-hero">
          <div className="profile-copy">
            <h2>{profile.name}</h2>
            <p>{profile.username}</p>
            <p className="profile-bio">{profile.bio}</p>
            <p>{profile.followers} Followers</p>
            <p>{profile.following} Following</p>
          </div>
        </div>

        <h3 className="profile-section-label">Statistics</h3>
        <section className="stats-grid">
          <article className="streak-stat">
            <img alt="" className="fire-icon-img fire-icon-img--md" src={ASSETS.fire} />
            <div className="streak-stat-copy">
              <strong>{stats.streak} Days</strong>
              <span>Streak Days</span>
            </div>
          </article>
          <article className="league-stat">
            <img
              alt=""
              className="league-logo"
              onError={(event) => { event.currentTarget.hidden = true }}
              src={ASSETS.leagueTimawa}
            />
            <div>
              <strong>Timawa</strong>
              <span>Current League</span>
            </div>
          </article>
        </section>

        <article className="xp-progress-card profile-card">
          <span>Total XP</span>
          <div className="level-track">
            <span style={{ width: `${xpProgress}%` }} />
            <b>{stats.xp} XP</b>
          </div>
        </article>

        <h3 className="profile-section-label">Badges</h3>
        <section className="badge-row profile-card" aria-label="Badges">
          <img alt="Fire badge" className="fire-icon-img fire-icon-img--lg" src={ASSETS.fire} />
          <img alt="Wave badge" src={ASSETS.waveBadge} />
          <img alt="Mountain badge" src={ASSETS.mountainBadge} />
          <img alt="Leaf badge" src={ASSETS.leafBadge} />
        </section>

        <h3 className="profile-section-label">Leaderboards</h3>
        <button className="leader-card profile-card tap-card" onClick={() => onOpenDialog('leaderboard')} type="button">
          <img
            alt=""
            className="leader-card-icon"
            onError={(event) => { event.currentTarget.hidden = true }}
            src={ASSETS.leaderboardIcon}
          />
          <span className="leader-card-fallback" aria-hidden="true" />
          <div className="leader-card-copy">
            <strong>My Friends</strong>
            <span>#{leaderboardRank} Position</span>
          </div>
          <span aria-hidden="true" className="section-chevron">›</span>
        </button>

        <button className="profile-section-link" onClick={() => onOpenDialog('friendsList')} type="button">
          <h3 className="profile-section-label inline">Friends Streaks</h3>
          <span aria-hidden="true" className="section-chevron">›</span>
        </button>
        <section className="friend-row profile-card" aria-label="Friends">
          {friendStreaks.map((friend) => (
            <article className={friend.active ? '' : 'inactive-streak'} key={friend.name}>
              <span>{getInitials(friend.name)}</span>
              <strong>
                <img
                  alt=""
                  className={`fire-icon-img fire-icon-img--sm ${friend.active ? '' : 'fire-icon-img--inactive'}`}
                  onError={(event) => {
                    event.currentTarget.onerror = null
                    event.currentTarget.src = ASSETS.fire
                  }}
                  src={friend.active ? ASSETS.fire : ASSETS.fireInactive}
                />
                {friend.streak}
              </strong>
            </article>
          ))}
        </section>
      </div>
    </section>
  )
}

function ProfileIconButton({
  alt,
  dialog,
  fallbackClassName,
  onOpenDialog,
  src,
}: {
  alt: string
  dialog: Dialog
  fallbackClassName: string
  onOpenDialog: (dialog: Dialog) => void
  src: string
}) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageFailed, setImageFailed] = useState(false)

  return (
    <button
      aria-label={alt}
      className="profile-icon-button"
      onClick={() => onOpenDialog(dialog)}
      type="button"
    >
      {!imageLoaded && !imageFailed && <span className={`fallback-action ${fallbackClassName}`} />}
      {!imageFailed && (
        <img
          alt=""
          onError={() => setImageFailed(true)}
          onLoad={() => setImageLoaded(true)}
          src={src}
        />
      )}
    </button>
  )
}

function ProgressView({
  stats,
  lessons: lessonList,
  lessonProgress,
  onOpenDialog,
}: {
  stats: Stats
  lessons: Lesson[]
  lessonProgress: number
  onOpenDialog: (dialog: Dialog) => void
}) {
  const xpProgress = getXpProgress(stats.xp)

  return (
    <section className="screen progress-screen">
      <Header stats={stats} onOpenDialog={onOpenDialog} />
      <div className="progress-hero">
        <img alt="Amigo mascot" className="mascot-image progress" src={ASSETS.brandMascot} />
        <div className="level-track">
          <span style={{ width: `${xpProgress}%` }} />
          <b>{stats.xp} XP</b>
        </div>
      </div>

      <SectionTitle title="Bisaya Progress" description={`${lessonProgress}% of the Bisaya lesson path is complete.`} />
      <section className="progress-list">
        {lessonList.map((lesson) => (
          <article className={stats.completedLessonIds.includes(lesson.id) ? 'complete' : 'active'} key={lesson.id}>
            <strong>{lesson.title}</strong>
            <span>{stats.completedLessonIds.includes(lesson.id) ? 'Completed' : `+${lesson.xp} XP`}</span>
          </article>
        ))}
      </section>
    </section>
  )
}

function TranslateView({
  stats,
  onOpenDialog,
  onPlayAudio,
  translateInput,
  translation,
  onTranslateInputChange,
  onTranslate,
}: {
  stats: Stats
  onOpenDialog: (dialog: Dialog) => void
  onPlayAudio: (phrase: string) => void
  translateInput: string
  translation: TranslationResult
  onTranslateInputChange: (value: string) => void
  onTranslate: () => void
}) {
  return (
    <section className="screen translate-screen">
      <Header stats={stats} onOpenDialog={onOpenDialog} />
      <SectionTitle title="Translate" description="Quick Bisaya translator." />

      <label className="translate-box">
        <span>English</span>
        <textarea
          onChange={(event) => onTranslateInputChange(event.target.value)}
          placeholder="Type a phrase, like: Good morning"
          value={translateInput}
        />
      </label>

      <div className="translate-box output-box">
        <span>Bisaya</span>
        <div className="translate-output-row">
          <strong>{translation.output || 'Type a phrase first'}</strong>
          {translation.output && translation.matched && (
            <button
              aria-label={`Play ${translation.output}`}
              className="speaker-button"
              onClick={() => onPlayAudio(translation.output)}
              type="button"
            >
              <PlayButtonIcon className="play-button-icon--small" />
            </button>
          )}
        </div>
        <p>{translation.note}</p>
      </div>

      <button className="primary-button" onClick={onTranslate}>Translate</button>
    </section>
  )
}

function BottomNav({
  activeView,
  onNavigate,
}: {
  activeView: View
  onNavigate: (view: View) => void
}) {
  const items: { label: string; view: View; icon: string }[] = [
    { label: 'Home', view: 'home', icon: ASSETS.navHome },
    { label: 'Translate', view: 'translate', icon: ASSETS.navTranslate },
    { label: 'Progress', view: 'progress', icon: ASSETS.navProgress },
    { label: 'Profile', view: 'profile', icon: ASSETS.navProfile },
  ]

  return (
    <nav className="bottom-nav" aria-label="Main navigation">
      {items.map((item) => (
        <button
          aria-label={item.label}
          className={activeView === item.view ? 'active' : ''}
          key={item.view}
          onClick={() => onNavigate(item.view)}
        >
          <img alt="" className="nav-icon" src={item.icon} />
        </button>
      ))}
    </nav>
  )
}

function StatInfoDialog({
  dialog,
  stats,
  onClose,
}: {
  dialog: 'streak' | 'xp'
  stats: Stats
  onClose: () => void
}) {
  const isStreak = dialog === 'streak'

  return (
    <section className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="stat-modal">
        <button className="modal-close" onClick={onClose}>Close</button>
        <div className={`modal-icon-box ${isStreak ? 'fire-icon' : 'xp-icon'}`}>
          <img
            alt=""
            className="fire-icon-img fire-icon-img--modal"
            src={isStreak ? ASSETS.fire : ASSETS.xpIcon}
          />
        </div>
        <p className="eyebrow">{isStreak ? 'Streak' : 'Experience points'}</p>
        <h2>{isStreak ? `${stats.streak} days` : `${stats.xp} XP`}</h2>
        <p>
          {isStreak
            ? 'A streak is the number of days in a row that you complete at least one lesson or speaking practice. Keep learning every day to keep it alive.'
            : 'XP means experience points. You earn XP by completing lessons, challenges, and pronunciation practice. Higher XP shows stronger progress.'}
        </p>
      </div>
    </section>
  )
}

function SettingsDialog({
  profile,
  settings,
  onProfileChange,
  onPhotoChange,
  onSettingsChange,
  onLogout,
  onOpenAbout,
  onClose,
}: {
  profile: Profile
  settings: AppSettings
  onProfileChange: (update: Partial<Profile>) => void
  onPhotoChange: (event: ChangeEvent<HTMLInputElement>) => void
  onSettingsChange: (update: Partial<AppSettings>) => void
  onLogout: () => void
  onOpenAbout: () => void
  onClose: () => void
}) {
  return (
    <section className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="stat-modal settings-modal">
        <button className="modal-close" onClick={onClose}>Close</button>
        <p className="eyebrow">Profile settings</p>
        <h2>Settings</h2>
        <label className="settings-photo-upload">
          {profile.photo ? <img alt={`${profile.name} profile`} src={profile.photo} /> : <span>{getInitials(profile.name)}</span>}
          <input accept="image/*" onChange={onPhotoChange} type="file" />
          <strong>Change profile photo</strong>
        </label>
        <label className="dialog-field">
          Name
          <input onChange={(event) => onProfileChange({ name: event.target.value })} value={profile.name} />
        </label>
        <label className="dialog-field">
          Username
          <input onChange={(event) => onProfileChange({ username: event.target.value })} value={profile.username} />
        </label>
        <label className="dialog-field">
          Bio
          <input onChange={(event) => onProfileChange({ bio: event.target.value })} value={profile.bio} />
        </label>
        <SettingSwitch checked={settings.lessonReminders} description="Show reminder style prompts in the prototype." label="Lesson reminders" onChange={(checked) => onSettingsChange({ lessonReminders: checked })} />
        <SettingSwitch checked={settings.soundEffects} description="Keep sound feedback enabled for future audio work." label="Sound effects" onChange={(checked) => onSettingsChange({ soundEffects: checked })} />
        <SettingSwitch checked={settings.pronunciationTips} description="Show helper text during speaking practice." label="Pronunciation tips" onChange={(checked) => onSettingsChange({ pronunciationTips: checked })} />
        <SettingSwitch checked={settings.highContrast} description="Increase contrast for presentation visibility." label="High contrast" onChange={(checked) => onSettingsChange({ highContrast: checked })} />
        <CloudStatusCard />
        <button className="settings-action" onClick={onOpenAbout} type="button">
          About us
        </button>
        <button className="settings-logout" onClick={onLogout} type="button">Log out</button>
        <p className="settings-version">{APP_VERSION}</p>
      </div>
    </section>
  )
}

function CloudStatusCard() {
  const status = getCloudPrototypeStatus()

  return (
    <article className="cloud-status-card">
      <strong>{status.title}</strong>
      <small>{status.description}</small>
    </article>
  )
}

function AboutUsDialog({ onClose }: { onClose: () => void }) {
  return (
    <section className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="stat-modal about-modal">
        <button className="modal-close" onClick={onClose}>Close</button>
        <section className="about-panel" aria-label="About Amigo">
          <h3>Amigo</h3>
          <p className="about-tagline">Learn. Preserve. Connect.</p>
          <p>
            Amigo is a gamified language learning app dedicated to the preservation of indigenous
            Philippine languages and dialects. Inspired by apps like Duolingo, Amigo makes learning
            endangered mother tongue languages fun, interactive, and culturally meaningful especially
            for Filipino children during their critical learning years.
          </p>
          <p>
            According to the Komisyon sa Wikang Filipino (KWF), 39 out of 135 indigenous languages in
            the Philippines are at risk of extinction. Due to modernization and globalization, children
            are increasingly moving away from their mother tongue languages, making preservation more
            urgent than ever.
          </p>
          <p>
            Mindanao, home to over 60% of the country&apos;s indigenous peoples and roughly 31 major
            ethnolinguistic groups, is where the need is greatest. Amigo addresses this through
            AI-assisted, adaptive lessons paired with streaks, points, leaderboards, and friendly
            competition to keep learners coming back.
          </p>
          <div className="about-divider" />
          <p className="about-team-title">Meet the team</p>
          <div className="about-team">
            {aboutTeam.map((member) => (
              <article key={member.name}>
                <strong>{member.name}</strong>
                {member.role && <span>{member.role}</span>}
              </article>
            ))}
          </div>
        </section>
      </div>
    </section>
  )
}

function SettingSwitch({
  checked,
  label,
  description,
  onChange,
}: {
  checked: boolean
  label: string
  description: string
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="setting-row">
      <span>
        <strong>{label}</strong>
        <small>{description}</small>
      </span>
      <input checked={checked} onChange={(event) => onChange(event.target.checked)} type="checkbox" />
    </label>
  )
}

function AddFriendDialog({
  friends,
  friendName,
  onFriendNameChange,
  onAddFriend,
  onClose,
}: {
  friends: string[]
  friendName: string
  onFriendNameChange: (name: string) => void
  onAddFriend: () => void
  onClose: () => void
}) {
  return (
    <section className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="stat-modal">
        <button className="modal-close" onClick={onClose}>Close</button>
        <p className="eyebrow">Friends</p>
        <h2>Add Friend</h2>
        <label className="dialog-field">
          Friend name
          <input onChange={(event) => onFriendNameChange(event.target.value)} placeholder="Example: Keith" value={friendName} />
        </label>
        <button className="primary-button" onClick={onAddFriend}>Add Friend</button>
        <div className="friend-preview">
          {friends.map((friend) => <span key={friend}>{friend}</span>)}
        </div>
      </div>
    </section>
  )
}

function AlertsDialog({ onClose }: { onClose: () => void }) {
  const alerts = [
    'Keith Siao just added you as a friend.',
    'Mika kept a 13-day streak today.',
    'Bisaya pronunciation practice is ready.',
  ]

  return (
    <section className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="stat-modal alerts-modal">
        <button className="modal-close" onClick={onClose}>Close</button>
        <p className="eyebrow">Alerts</p>
        <h2>Notifications</h2>
        <div className="alert-list">
          {alerts.map((alert) => (
            <article className="alert-item" key={alert}>
              <span />
              <p>{alert}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function LeaderboardDialog({
  profile,
  stats,
  onAddFriend,
  onClose,
}: {
  profile: Profile
  stats: Stats
  onAddFriend: () => void
  onClose: () => void
}) {
  const entries = buildLeaderboardEntries(profile, stats)

  return (
    <section className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="stat-modal list-modal">
        <button className="modal-close" onClick={onClose}>Close</button>
        <p className="eyebrow">Leaderboards</p>
        <h2>My Friends</h2>
        <div className="list-modal-rows">
          {entries.map((entry, index) => (
            <article className={`list-modal-row ${entry.isYou ? 'current-user' : ''}`} key={`${entry.name}-${index}`}>
              <span className="list-rank">#{index + 1}</span>
              <span className="list-avatar">{getInitials(entry.name)}</span>
              <div className="list-copy">
                <strong>{entry.isYou ? `${entry.name} (You)` : entry.name}</strong>
                <small>{entry.xp} XP</small>
              </div>
            </article>
          ))}
        </div>
        <button className="primary-button" onClick={onAddFriend} type="button">Add Friend</button>
      </div>
    </section>
  )
}

function FriendsListDialog({
  profile,
  onClose,
}: {
  profile: Profile
  onClose: () => void
}) {
  const allFriends = [...new Set([...friendStreaks.map((friend) => friend.name), ...profile.friends])]

  return (
    <section className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="stat-modal list-modal">
        <button className="modal-close" onClick={onClose}>Close</button>
        <p className="eyebrow">Friends Streaks</p>
        <h2>Your Friends</h2>
        <div className="list-modal-rows">
          {allFriends.map((name) => {
            const friend = friendStreaks.find((item) => item.name === name)
            const streak = friend?.streak ?? statsFallbackStreak(name)
            const isActive = friend?.active ?? true

            return (
              <article className={`list-modal-row ${isActive ? '' : 'inactive-streak'}`} key={name}>
                <span className="list-avatar">{getInitials(name)}</span>
                <div className="list-copy">
                  <strong>{name}</strong>
                  <small>{streak} day streak</small>
                </div>
                <span className="list-streak-pill">
                  <img
                    alt=""
                    className={`fire-icon-img fire-icon-img--sm ${isActive ? '' : 'fire-icon-img--inactive'}`}
                    onError={(event) => {
                      event.currentTarget.onerror = null
                      event.currentTarget.src = ASSETS.fire
                    }}
                    src={isActive ? ASSETS.fire : ASSETS.fireInactive}
                  />
                  {streak}
                </span>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function statsFallbackStreak(name: string) {
  return profileFriendsStreakFallback[name] ?? 12
}

const profileFriendsStreakFallback: Record<string, number> = {
  Andrew: 13,
  Carlos: 5,
  Keith: 9,
  Ethan: 12,
}

function loadStats(): Stats {
  return loadStoredValue(STATS_STORAGE_KEY, initialStats)
}

function normalizeProfile(storedProfile: Profile): Profile {
  const usedOldDefaultName = storedProfile.name === 'Carlos Ysmael Minoza'
  const usedOldDefaultUsername = storedProfile.username === '@carloslearns'
  const usedOldDefaultFriends = ['Mika', 'Jun', 'Ari'].every((friend) => storedProfile.friends.includes(friend))

  return {
    ...storedProfile,
    name: usedOldDefaultName ? initialProfile.name : storedProfile.name,
    username: usedOldDefaultUsername ? initialProfile.username : storedProfile.username,
    friends: usedOldDefaultFriends ? initialProfile.friends : storedProfile.friends,
  }
}

function loadProfile(): Profile {
  return normalizeProfile(loadStoredValue(PROFILE_STORAGE_KEY, initialProfile))
}

function loadSettings(): AppSettings {
  return loadStoredValue(SETTINGS_STORAGE_KEY, initialSettings)
}

function loadStoredValue<T>(key: string, fallback: T): T {
  return amigoCloud.load(key, fallback)
}

function getTodayKey() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')

  return `${now.getFullYear()}-${month}-${day}`
}

function getSpeechRecognition() {
  const speechWindow = window as Window & {
    SpeechRecognition?: BrowserSpeechRecognitionConstructor
    webkitSpeechRecognition?: BrowserSpeechRecognitionConstructor
  }

  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition
}

function getTranscriptFromEvent(event: Event) {
  const resultEvent = event as Event & {
    results: {
      0: {
        0: {
          transcript: string
        }
      }
    }
  }

  return resultEvent.results[0][0].transcript
}

function isSpeechCloseEnough(spokenText: string, target: string) {
  const spoken = normalizeSpeech(spokenText)
  const expected = normalizeSpeech(target)

  return spoken.includes(expected) || expected.includes(spoken)
}

function translateToBisaya(value: string): TranslationResult {
  const normalizedInput = normalizeTranslationInput(value)

  if (!normalizedInput) {
    return {
      output: '',
      note: 'Type an English phrase, then tap Translate.',
      matched: false,
    }
  }

  const match = translationDictionary.find((entry) =>
    entry.inputs.some((input) => normalizeTranslationInput(input) === normalizedInput),
  )

  if (match) {
    return {
      output: match.output,
      note: 'Dictionary result. Review with fluent speakers for formal use.',
      matched: true,
    }
  }

  return {
    output: 'Phrase not in the dictionary yet',
    note: 'Try: Good morning, How are you, Where are you from, Thank you, Please, Family, or I am good.',
    matched: false,
  }
}

async function playPhraseAudio(phrase: string) {
  const audioSource = phraseAudioSources[normalizeTranslationInput(phrase)]

  if (!audioSource) {
    speakPhraseFallback(phrase)
    return
  }

  try {
    await new Audio(audioSource).play()
  } catch {
    speakPhraseFallback(phrase)
  }
}

function speakPhraseFallback(phrase: string) {
  if (!('speechSynthesis' in window)) {
    return
  }

  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(phrase)
  utterance.lang = 'fil-PH'
  utterance.rate = 0.86
  window.speechSynthesis.speak(utterance)
}

function getXpProgress(xp: number) {
  const levelXp = xp % 1000
  const visibleLevelXp = xp > 0 && levelXp === 0 ? 1000 : levelXp

  return Math.max(12, Math.min(100, Math.round(visibleLevelXp / 10)))
}

function normalizeTranslationInput(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[?!.,]/g, '')
    .replace(/\s+/g, ' ')
}

function normalizeSpeech(value: string) {
  return value.toLowerCase().replace(/[^a-zñ\s]/g, '').replace(/\s+/g, ' ').trim()
}

function isLessonRewarded(feedback: string) {
  return feedback.includes('Correct') || feedback.includes('accepted')
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

type LeaderboardEntry = {
  name: string
  xp: number
  isYou: boolean
}

function buildLeaderboardEntries(profile: Profile, stats: Stats): LeaderboardEntry[] {
  return [
    ...friendLeaderboard.map((entry) => ({ name: entry.name, xp: entry.xp, isYou: false })),
    { name: profile.name, xp: stats.xp, isYou: true },
  ].sort((left, right) => right.xp - left.xp)
}

function getUserLeaderboardRank(profile: Profile, stats: Stats) {
  const entries = buildLeaderboardEntries(profile, stats)
  const userIndex = entries.findIndex((entry) => entry.isYou)

  return userIndex === -1 ? entries.length : userIndex + 1
}

export default App
