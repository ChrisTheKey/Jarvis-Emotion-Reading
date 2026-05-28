# Jarvis Coach — Persönlicher KI-Coach

Eine mobile App (Android-first) für direktes, ehrliches KI-Coaching auf Basis von Anthropic Claude.

## Funktionen

- Chat-Interface mit dem Jarvis-Coach (Coaching-Struktur: Spiegelung → Muster → Realität → Frage → Handlung)
- Spracheingabe via Mikrofon (inkl. Voice-Metadaten als Coaching-Kontext)
- Lokale Gesprächshistorie
- Einstellungen für API-Key, Modell, Voice, Verlauf
- Dark-UI optimiert für Android und iOS

## Schnellstart (Entwicklung)

### Voraussetzungen

- Node.js 18+
- npm oder yarn
- Expo CLI: `npm install -g expo-cli`
- Anthropic API-Key (https://console.anthropic.com)

### Installation

```bash
git clone <repo-url>
cd Jarvis-Emotion-Reading
npm install
```

### App starten

```bash
npm start
# oder
npx expo start
```

Dann mit der **Expo Go**-App (Android/iOS) den QR-Code scannen.

### Erstmalige Konfiguration

1. App öffnen → Tab **Einstellungen**
2. Anthropic API-Key eintragen und speichern
3. Modell wählen (Empfehlung: Claude Sonnet 4)
4. Zurück zu **Coach** → Gespräch starten

---

## Android APK erstellen

### Option A: EAS Build (empfohlen, kein lokales Android SDK nötig)

```bash
# EAS CLI installieren
npm install -g eas-cli

# In Expo-Konto einloggen (kostenlos)
eas login

# APK bauen (preview-Profil = APK-Format)
npm run build:apk
# oder direkt:
eas build --platform android --profile preview
```

Nach dem Build erhältst du einen Download-Link für die `.apk`-Datei.
Diese kannst du auf deinem Android-Gerät installieren (Einstellungen → Unbekannte Quellen erlauben).

### Option B: Lokaler Build (Android SDK erforderlich)

```bash
# Android SDK installieren (z.B. via Android Studio)
# ANDROID_HOME setzen
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools

# Expo Prebuild + lokaler Build
npx expo prebuild --platform android
cd android && ./gradlew assembleRelease
# APK: android/app/build/outputs/apk/release/app-release.apk
```

### Option C: Dev-Build auf verbundenem Android-Gerät

```bash
# USB-Debugging aktivieren, Gerät verbinden
npm run android
# oder:
npx expo run:android
```

---

## iOS (vorbereitet, kein Signing)

```bash
npx expo run:ios
```

> **Hinweis:** iOS-Distribution erfordert Apple Developer Account und Code Signing.
> Die App ist iOS-kompatibel vorbereitet, kann aber ohne Signing nur im Simulator oder via TestFlight verteilt werden.

---

## Tests ausführen

```bash
npm test
```

Typescript prüfen:
```bash
npm run type-check
```

---

## Limitierungen der Voice-Analyse

**Was die App tut:**
- Nimmt Audio auf (expo-av) und misst Aufnahmedauer
- Leitet einfache Metadaten ab: Dauer, geschätztes Sprechtempo (kurz = schnell, lang = langsam), Pause-Schätzung
- Übergibt diese Metadaten an den System-Prompt als Coaching-Kontext

**Was die App NICHT tut:**
- Keine echte Prosodieanalyse (kein Pitch, keine Energie-Kurve, kein Formanten-Tracking)
- Keine Transkription (Whisper-API oder ähnliches ist vorbereitet, aber nicht konfiguriert)
- Keine Emotionserkennung als Faktum
- Alle stimmlichen Einschätzungen werden vom Coach als Hypothesen formuliert: „könnte", „wirkt", „ich könnte mich irren"

**Warum diese Einschränkung:**
Emotionale Zustände aus Stimme zu diagnostizieren ist komplex und fehleranfällig. Der Coach nutzt Voice-Metadaten nur als zusätzlichen Kontext, niemals als sichere Grundlage für emotionale Urteile.

**Für echte Transkription:**
Implementiere in `src/components/VoiceRecorder.tsx` eine API-Integration (z.B. OpenAI Whisper oder Deepgram). Die `onTranscriptReady`-Callback-Struktur ist bereits vorbereitet.

---

## Projektstruktur

```
src/
├── components/
│   ├── MessageBubble.tsx     — Chat-Nachrichten (mit Coaching-Abschnitt-Parser)
│   └── VoiceRecorder.tsx     — Mikrofon-Aufnahme (Press & Hold)
├── config/
│   └── systemPrompt.ts       — Jarvis System-Prompt + Voice-Kontext-Builder
├── hooks/
│   └── useConversation.ts    — Konversations-State + API-Calls
├── navigation/
│   └── AppNavigator.tsx      — Bottom-Tab-Navigation
├── screens/
│   ├── ChatScreen.tsx        — Haupt-Chat-Interface
│   ├── HistoryScreen.tsx     — Gesprächsverlauf
│   └── SettingsScreen.tsx    — API-Key, Modell, Einstellungen
├── services/
│   ├── anthropicService.ts   — Anthropic API-Client
│   └── storageService.ts     — AsyncStorage + SecureStore
└── types/
    └── index.ts              — Typen, Interfaces, Konstanten
```

---

## Sicherheit

- API-Keys werden ausschließlich via `expo-secure-store` gespeichert (verschlüsselt, OS-Keychain)
- Keine hardcodierten Secrets
- Kein API-Key im Build-Artifact

---

## Coaching-Prinzip

Der Agent ist kein Therapeut und gibt keine Diagnosen. Er coacht: hinterfragt, spiegelt, konfrontiert, strukturiert Entscheidungen und fordert konkrete nächste Schritte.

Emotionale Einschätzungen sind immer Hypothesen — nie sichere Fakten.
