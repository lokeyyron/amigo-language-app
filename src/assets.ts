export function asset(path: string) {
  const normalizedPath = path.replace(/^\/+/, '')
  return `${import.meta.env.BASE_URL}${normalizedPath}`
}

export const ASSETS = {
  brandLogo: asset('assets/brand/amigo-logo.png'),
  brandMascot: asset('assets/brand/amigo-mascot.png'),
  fire: asset('assets/icons/fire.png'),
  fireInactive: asset('assets/icons/fire-inactive.png'),
  xpIcon: asset('assets/icons/xp.png'),
  leagueTimawa: asset('assets/icons/league-timawa.png'),
  waveBadge: asset('assets/badges/wave.png'),
  mountainBadge: asset('assets/badges/mountain.png'),
  leafBadge: asset('assets/badges/leaf.png'),
  playButton: asset('assets/ui/play-button.png'),
  alertIcon: asset('assets/icons/alert.png'),
  settingsIcon: asset('assets/icons/settings.png'),
  leaderboardIcon: asset('assets/icons/leaderboard.png'),
  navHome: asset('assets/icons/nav-home.png'),
  navTranslate: asset('assets/icons/nav-translate.png'),
  navProgress: asset('assets/icons/nav-progress.png'),
  navProfile: asset('assets/icons/nav-profile.png'),
  languageIcons: {
    bisaya: asset('assets/language-icons/bisaya.png'),
    maguindanaon: asset('assets/language-icons/maguindanaon.png'),
    maranao: asset('assets/language-icons/maranao.png'),
    tausug: asset('assets/language-icons/tausug.png'),
    dabawenyo: asset('assets/language-icons/dabawenyo.png'),
    chavacano: asset('assets/language-icons/chavacano.png'),
  },
} as const
