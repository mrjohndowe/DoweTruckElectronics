import { useCallback, useEffect, useImperativeHandle, useRef, useState, type CSSProperties, type FormEvent, type ReactNode, type Ref } from "react";
import { setSoundOn, sfx, speak, stopAlerts, stopSpeech, unlockAudio, useSoundOn, type AlertBand } from "./audio";
import { JOB, ROUTE, TELEMETRY_URL, TIME_SCALE, agencyFor, formatDuration, formatGameTime, isGameNight, useAtsSim, type LinkInfo, type SimEvent, type Telemetry, type TelemetrySource } from "./sim";
import EldInspection from "./components/EldInspection";
import { allQuestions, countAnswered, countDefects, totalQuestions, type Answer, type Answers, type InspectionState, type Readings } from "./inspection";
import FGIcon from '../assets/FG_Icon.png';


type Layout = "split" | "radar" | "eld";
type LightingOverride = "auto" | "day" | "night";
type View = { page: "index" } | { page: "console"; layout: Layout };
type RadarMode = "HWY" | "AUTO" | "CITY";
type Direction = "left" | "front" | "right";
type RadarEvent = { id: number; time: Date; band: AlertBand; strength: number; direction: Direction; status: string; near: string };
type RadarStatus = { powered: boolean; mode: RadarMode; muted: boolean; band: AlertBand; direction: Direction; strength: number; alerting: boolean };
type RadarHandle = { triggerAlert: () => void };
type EldTab = "home" | "hos" | "duty" | "logs" | "inspect" | "violations" | "fuel" | "link" | "settings";
type Driver = { id: string; pin: string; name: string; initials: string; role: string; truck: string; garage: string; level: number };
type DeviceSettings = { voice: boolean; autoLog: boolean; clock24: boolean; metric: boolean; night: boolean; sync: boolean };
type NoticeAction = { label: string; onClick: () => void };
type Notice = { title: string; body: string; tone?: "warning" | "info"; action?: NoticeAction };
type FuelRow = { id: number; cells: string[] };

const bandData: Record<AlertBand, { frequency: string; color: string; voice: string; spoken: string }> = {
  X: { frequency: "10.525 GHz", color: "#67e889", voice: "Police Alert", spoken: "Police Reported Ahead" },
  K: { frequency: "24.150 GHz", color: "#ffb23e", voice: "Speed Trap", spoken: "Speed Trap Alert" },
  KA: { frequency: "34.700 GHz", color: "#ff554d", voice: "Work Zone", spoken: "Work Zone Area ... Slow Down" },
  LASER: { frequency: "904 nm", color: "#d766ff", voice: "Weigh Station", spoken: "Weigh Station Zone ... Standby..." },
};

const directionLabel: Record<Direction, string> = { left: "LEFT", front: "AHEAD", right: "RIGHT" };
const layoutLabels: Record<Layout, string> = { split: "Full cab", radar: "Radar focus", eld: "ELD focus" };
const initialRadarStatus: RadarStatus = { powered: true, mode: "AUTO", muted: false, band: "KA", direction: "front", strength: 5, alerting: false };
const freshInspection: InspectionState = { status: "pending", missing: [], validatedAt: null };

const tabs: { id: EldTab; label: string }[] = [
  { id: "duty", label: "Duty" },
  { id: "inspect", label: "Inspect" },
  { id: "home", label: "Info" },
  { id: "hos", label: "HOS" },
  { id: "logs", label: "Trip log" },
  { id: "violations", label: "Fines" },
  { id: "fuel", label: "Fuel" },
  { id: "link", label: "ATS link" },
  { id: "settings", label: "Settings" },
];
const randomPin = () => Math.floor(Math.random() * 1000000000, 10 * Math.random()).toString().padStart(10, "0");
const stbLevel = new Date().getFullYear() - 2000;
const drivers: Driver[] = [
  { id: "1633", pin: "7192483911", name: "MrJohnDowe", initials: "MJD", role: "Owner-operator", truck: "Peterbilt 389", garage: "Pueblo, CO", level: 54 },
  { id: "7632", pin: `${randomPin()}`, name: "Scarlett Trinity Brohansen", initials: "STB", role: "Management", truck: "Peterbilt 579", garage: "Punxsutawney, PA", level: stbLevel }
];

const defaultSettings: DeviceSettings = { voice: true, autoLog: true, clock24: true, metric: false, night: false, sync: true };

const settingDefs: { key: keyof DeviceSettings; label: string; hint: string }[] = [
  { key: "voice", label: "Voice safety alerts", hint: "Spoken route, break, and inspection callouts" },
  { key: "autoLog", label: "Automatic duty logging", hint: "Status follows truck motion from telemetry" },
  { key: "clock24", label: "24-hour clock", hint: "Show 15:47 instead of 3:47 PM" },
  { key: "metric", label: "Metric units", hint: "km/h, kilometers, and liters" },
  { key: "night", label: "Night display mode", hint: "Dim the screen for night driving" },
  { key: "sync", label: "World of Trucks sync", hint: "Upload trip records when a job completes" },
];

const dutyOptions = ["OFF DUTY", "SLEEPER", "ON DUTY", "DRIVING", "PERSONAL", "YARD MOVE", "AFK", "OUT OF CAB", "POLICE INSPECTION"];

const logData = [
  ["08:45 AM", "DRIVING", "Current", "I-5 S / Eugene, OR"],
  ["08:15 AM", "ON DUTY", "30 min", "Fuel / Gallon, Eugene"],
  ["06:30 AM", "DRIVING", "1h 45m", "I-5 S / Portland, OR"],
  ["06:00 AM", "ON DUTY", "30 min", "Pre-trip / Voltison, Portland"],
  ["10:00 PM", "SLEEPER", "8h 00m", "Rest area / Portland, OR"],
];

const pastFines = [
  { title: "Speeding", amount: "$300", when: "TUE 08:52 AM", detail: "68 in a 60 truck zone / I-5 near Salem, OR / Oregon State Police" },
  { title: "Red light", amount: "$500", when: "MON 04:40 PM", detail: "NE Columbia Blvd, Portland, OR / intersection camera" },
  { title: "Hit & Run", amount: "$1000", when: "FRI 12:24 PM", detail: "I-5 SOUTH / Pedestrian Reported"},
];


const initialFuel: FuelRow[] = [
  { id: 1, cells: ["TUE / 08:15 AM", "Gallon", "Eugene, OR", "171.3 gal", "$585.85"] },
  { id: 2, cells: ["MON / 07:02 PM", "Gallon", "Portland, OR", "88.0 gal", "$297.44"] },
  { id: 3, cells: ["SUN / 02:30 PM", "Gallon", "Seattle, WA", "204.5 gal", "$738.25"] },
];

const atsTrucks = ["Peterbilt 389", "Kenworth W900", "Freightliner Cascadia", "Volvo VNL", "International LoneStar", "Western Star 49X", "Mack Anthem"];
const atsStates = ["CA", "NV", "AZ", "NM", "OR", "WA", "UT", "ID", "CO", "WY", "MT", "TX", "OK", "KS", "NE", "AR", "MO"];

function getView(): View {
  const hash = window.location.hash;
  if (hash === "#console") return { page: "console", layout: "split" };
  if (hash === "#radar") return { page: "console", layout: "radar" };
  if (hash === "#eld") return { page: "console", layout: "eld" };
  return { page: "index" };
}

const formatTime = (date: Date, clock24: boolean) => date.toLocaleTimeString([], clock24 ? { hour: "2-digit", minute: "2-digit", hour12: false } : { hour: "numeric", minute: "2-digit" });
const fmtSpeed = (mph: number, metric: boolean) => Math.round(metric ? mph * 1.609 : mph).toString();
const speedUnit = (metric: boolean) => (metric ? "KM/H" : "MPH");
const fmtDist = (mi: number, metric: boolean) => Math.round(metric ? mi * 1.609 : mi).toLocaleString();
const distUnit = (metric: boolean) => (metric ? "KM" : "MI");
const fmtVol = (gal: number, metric: boolean) => Math.round(metric ? gal * 3.785 : gal).toLocaleString();
const volUnit = (metric: boolean) => (metric ? "L" : "GAL");

/* Icons */

function ArrowIcon({ direction = "right" }: { direction?: "left" | "right" | "up" }) {
  const rotation = direction === "left" ? "rotate(180 12 12)" : direction === "up" ? "rotate(-90 12 12)" : undefined;
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h13M14 7l5 5-5 5" transform={rotation} />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function SignalIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 16.5a9.5 9.5 0 0 1 14 0M8 19a5.5 5.5 0 0 1 8 0M2 14a13.5 13.5 0 0 1 20 0" />
      <circle cx="12" cy="21" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function SpeakerIcon({ muted }: { muted: boolean }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 9.5v5h3.5L13 19V5L7.5 9.5H4z" />
      {muted ? <path d="M17 9.5l4.5 5M21.5 9.5l-4.5 5" /> : <path d="M16.5 8.8a4.5 4.5 0 0 1 0 6.4M19 6.3a8 8 0 0 1 0 11.4" />}
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5" y="11" width="14" height="10" rx="1.5" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 16v-5a6 6 0 0 1 12 0v5l1.5 2h-15L6 16zM10 20a2 2 0 0 0 4 0" />
    </svg>
  );
}

function PowerIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3v8M7 6.5a7 7 0 1 0 10 0" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M3 7h10v9H3zM13 10h4l3 3v3h-7z" />
      <circle cx="7" cy="17.5" r="1.6" />
      <circle cx="17" cy="17.5" r="1.6" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.5 15.2A8.7 8.7 0 0 1 8.8 3.5 8.8 8.8 0 1 0 20.5 15.2Z" />
      <path d="m16.8 3 .5 1.7L19 5.2l-1.7.5-.5 1.7-.5-1.7-1.7-.5 1.7-.5z" />
    </svg>
  );
}

/* Shared pieces */

function BrandMark({ light = false }: { light?: boolean }) {
  return (
    <div className={`brand-mark ${light ? "brand-mark-light" : ""}`} aria-label="Dowe Technologies">
      <span className="brand-d">D</span>
      <span className="brand-word">DOWE</span>
      <span className="brand-sub">TECHNOLOGIES ELECTRONICS</span>
    </div>
  );
}

function SoundToggle({ compact = false }: { compact?: boolean }) {
  const on = useSoundOn();
  const toggle = () => {
    unlockAudio();
    const next = !on;
    setSoundOn(next);
    if (next) sfx.toggle(true);
  };
  return (
    <button type="button" className={`sound-toggle ${on ? "on" : "off"} ${compact ? "compact" : ""}`} onClick={toggle} aria-pressed={on} aria-label={on ? "Turn sound off" : "Turn sound on"} title={on ? "Sound on" : "Sound off"}>
      <SpeakerIcon muted={!on} />
      <span>{on ? "Sound on" : "Sound off"}</span>
    </button>
  );
}

function ProductPreview({ product }: { product: "radar" | "eld" }) {
  if (product === "radar") {
    return (
      <div className="index-radar" aria-hidden="true">
        <div className="index-radar-top"><span>DOWE / ROAD SENTRY</span><i /></div>
        <div className="index-radar-screen">
          <strong>KA</strong>
          <div><span>34.700</span><small>GHz / CHP AHEAD</small></div>
          <div className="index-signal">{[1, 2, 3, 4, 5, 6, 7].map((bar) => <i key={bar} />)}</div>
        </div>
        <div className="index-radar-controls">{[1, 2, 3, 4].map((button) => <i key={button} />)}</div>
      </div>
    );
  }

  return (
    <div className="index-tablet" aria-hidden="true">
      <div className="index-tablet-bar"><span>FLEET GUARD</span><i>TUE 11:48</i></div>
      <div className="index-tablet-nav">{[1, 2, 3, 4, 5].map((item) => <i key={item} />)}</div>
      <div className="index-tablet-screen">
        <div className="index-route">
          <small>VOLTISON / WALLBERT / ELECTRONICS</small>
          <strong>Portland</strong>
          <span />
          <strong>Los Angeles</strong>
        </div>
        <div className="index-gauges"><i /><i /><i /></div>
      </div>
    </div>
  );
}

function IndexPage({ open }: { open: (layout: Layout) => void }) {
  const launch = (layout: Layout) => {
    unlockAudio();
    sfx.launch();
    open(layout);
  };

  return (
    <main className="index-page">
      <div className="hero-photo" />
      <nav className="index-nav">
        <BrandMark light />
        <div className="index-nav-right">
          <a className="nav-link" href="#ats">Built for ATS</a>
          <a className="nav-link" href="#systems">Modules</a>
          <SoundToggle />
        </div>
      </nav>

      <header className="index-hero">
        <p className="index-kicker"><span /> In-cab electronics for American Truck Simulator</p>
        <h1><span>DOWE TECHNOLOGIES </span> ELECTRONICS SYSTEM</h1>
        <p className="index-lede">A Road Sentry radar detector and a Fleet Guard ELD that read your truck straight from the SCS telemetry feed. Run them on a second screen while you haul, or try the simulated I-5 run right here.</p>
        <div className="index-cta-row">
          <button className="index-cta" onClick={() => launch("split")}>Start the I-5 run <i><ArrowIcon /></i></button>
          <a className="index-scroll" href="#systems">Or explore each module <span><ArrowIcon direction="up" /></span></a>
        </div>
        <p className="index-hint"><SpeakerIcon muted={false} /> Best experienced with sound on. Alert tones, device sounds, and voice callouts are synthesized in your browser.</p>
      </header>

      <section className="ats-strip" id="ats" aria-label="Built for American Truck Simulator">
        <div className="ats-strip-head">
          <span className="eyebrow">BUILT FOR AMERICAN TRUCK SIMULATOR</span>
          <h2>Plugs into the game, not just the dash.</h2>
          <p>Both modules consume the standard SCS telemetry SDK, so they react to the real speed limit, your cruise setting, fuel, the job clock, and the in-game fatigue timer at the game's 19x time scale.</p>
        </div>
        <ol className="ats-steps">
          <li><b>01</b><strong>Install the telemetry server</strong><span>The free ETS2/ATS Telemetry Server (Funbit) or any scs-sdk-plugin bridge publishes your truck at localhost:25555.</span></li>
          <li><b>02</b><strong>Launch ATS and take a job</strong><span>Speed, limit, cargo, deadline, next rest stop, and navigation ETA stream in as soon as the game is connected.</span></li>
          <li><b>03</b><strong>Open the cab system</strong><span>Switch the ELD to <em>ATS link</em> for live data, or stay on the simulated Portland to Los Angeles run.</span></li>
        </ol>
        <div className="ats-chips">
          <div><span>SUPPORTED TRUCKS</span><div>{atsTrucks.map((truck) => <i key={truck}>{truck}</i>)}</div></div>
          <div><span>MAP COVERAGE</span><div>{atsStates.map((state) => <i key={state}>{state}</i>)}<i className="more">+ new DLC states</i></div></div>
        </div>
      </section>

      <section className="product-selector" id="systems" aria-label="Product modules">
        <div className="selector-intro">
          <span>THE MODULES</span>
          <button onClick={() => launch("split")}>Both run together in the full cab console <i><ArrowIcon /></i></button>
        </div>
        <div className="product-doors">
          <button className="product-door product-door-radar" onClick={() => launch("radar")}>
            <div className="product-copy">
              <span className="product-number">01 / ROAD AWARENESS</span>
              <h2>Road Sentry</h2>
              <p>Directional radar and laser detection tuned for ATS patrols: CHP cruisers, OSP speed traps, weigh stations, and work zones, plus a live speed-versus-limit monitor so the fine never comes.</p>
              <span className="door-cta">Open radar module <i><ArrowIcon /></i></span>
            </div>
            <ProductPreview product="radar" />
          </button>

          <button className="product-door product-door-eld" onClick={() => launch("eld")}>
            <div className="product-copy">
              <span className="product-number">02 / FLEET OPERATIONS</span>
              <h2>Fleet Guard</h2>
              <p>Driver sign-in, the active job card with cargo and deadline, live gauges, in-game rest clocks, a 50-point walkaround inspection with defect reporting and out-of-service flags, fines, Gallon fuel stops, and the ATS telemetry link.</p>
              <span className="door-cta">Open ELD module <i><ArrowIcon /></i></span>
            </div>
            <ProductPreview product="eld" />
          </button>
        </div>
      </section>

      <footer className="index-footer">
        <span>Dowe Truck Electronics</span>
        <small>Fan-made companion concept. American Truck Simulator is a trademark of SCS Software s.r.o. Not affiliated with or endorsed by SCS Software.</small>
        <span>Interactive product lab / 2026</span>
      </footer>
    </main>
  );
}

function DemoHeader({ title, type, back, action }: { title: string; type: string; back: () => void; action?: ReactNode }) {
  return (
    <header className="demo-header">
      <button className="back-button" onClick={back} aria-label="Return to product index">
        <ArrowIcon direction="left" />
        <span>Overview</span>
      </button>
      <div className="demo-title">
        <span>{type}</span>
        <strong>{title}</strong>
      </div>
      <div className="demo-header-action">{action}</div>
    </header>
  );
}

/* Radar detector module */

function DirectionArrow({ direction, active }: { direction: Direction; active: boolean }) {
  const rotate = direction === "left" ? -90 : direction === "right" ? 90 : 0;
  return (
    <span className={`radar-direction ${active ? "active" : ""}`}>
      <svg viewBox="0 0 24 24" style={{ transform: `rotate(${rotate}deg)` }} aria-label={`${direction} signal`}>
        <path d="M12 19V5M7 10l5-5 5 5" />
      </svg>
    </span>
  );
}

function RadarUnit({ ref, telemetry, night, onAlert, onStatus }: { ref: Ref<RadarHandle>; telemetry: Telemetry; night: boolean; onAlert: (event: RadarEvent) => void; onStatus: (status: RadarStatus) => void }) {
  const [mode, setMode] = useState<RadarMode>("AUTO");
  const [muted, setMuted] = useState(false);
  const [voiceOn, setVoiceOn] = useState(true);
  const [powered, setPowered] = useState(true);
  const [brightness, setBrightness] = useState(0);
  const [sensitivity, setSensitivity] = useState(2);
  const [band, setBand] = useState<AlertBand>("KA");
  const [strength, setStrength] = useState(5);
  const [direction, setDirection] = useState<Direction>("front");
  const [count, setCount] = useState(1);
  const [status, setStatus] = useState("CHP CRUISER");
  const [voiceVisible, setVoiceVisible] = useState(false);
  const [alerting, setAlerting] = useState(false);
  const alertNumber = useRef(0);
  const overlayTimer = useRef<number | undefined>(undefined);
  const alertTimer = useRef<number | undefined>(undefined);
  const locationRef = useRef(telemetry.location);
  locationRef.current = telemetry.location;

  const over = powered && telemetry.speedMph > telemetry.speedLimitMph + 2;
  const speed = Math.round(telemetry.speedMph);

  useEffect(
    () => () => {
      window.clearTimeout(overlayTimer.current);
      window.clearTimeout(alertTimer.current);
      stopAlerts();
      stopSpeech();
    },
    [],
  );

  useEffect(() => {
    onStatus({ powered, mode, muted, band, direction, strength, alerting });
  }, [powered, mode, muted, band, direction, strength, alerting, onStatus]);

  useEffect(() => {
    if (over && !muted) sfx.limit();
  }, [over, muted]);

  const simulateAlert = useCallback(() => {
    if (!powered) return;
    const bands: AlertBand[] = ["X", "K", "KA", "LASER"];
    const directions: Direction[] = ["left", "front", "right"];
    const agency = agencyFor(locationRef.current.state);
    const statuses = [`${agency} CRUISER`, "SPEED TRAP", "WORK ZONE", "WEIGH STATION"];
    alertNumber.current += 1;
    const n = alertNumber.current;
    const nextBand = bands[n % bands.length];
    const nextStrength = 3 + ((n * 3) % 5);
    const nextDirection = directions[n % directions.length];
    const nextStatus = statuses[n % statuses.length];
    setBand(nextBand);
    setStrength(nextStrength);
    setDirection(nextDirection);
    setCount(1 + (n % 3));
    setStatus(nextStatus);
    onAlert({ id: n, time: new Date(), band: nextBand, strength: nextStrength, direction: nextDirection, status: nextStatus, near: `${locationRef.current.road} / ${locationRef.current.near}` });
    setAlerting(true);
    window.clearTimeout(alertTimer.current);
    alertTimer.current = window.setTimeout(() => setAlerting(false), 4000);
    window.clearTimeout(overlayTimer.current);
    stopSpeech();
    if (muted) {
      setVoiceVisible(false);
      return;
    }
    const beepSeconds = sfx.radarAlert(nextBand, nextStrength);
    if (voiceOn) speak(bandData[nextBand].spoken, beepSeconds + 0.1);
    setVoiceVisible(true);
    overlayTimer.current = window.setTimeout(() => setVoiceVisible(false), voiceOn ? 2800 : 1800);
  }, [muted, powered, voiceOn, onAlert]);

  useImperativeHandle(ref, () => ({ triggerAlert: simulateAlert }), [simulateAlert]);

  useEffect(() => {
    const interval = window.setInterval(simulateAlert, 11000);
    return () => window.clearInterval(interval);
  }, [simulateAlert]);

  const toggleMute = () => {
    sfx.click();
    const next = !muted;
    if (next) {
      stopAlerts();
      stopSpeech();
      setVoiceVisible(false);
    }
    setMuted(next);
  };

  const toggleVoice = () => {
    sfx.click();
    const next = !voiceOn;
    setVoiceOn(next);
    if (next) speak("Voice alerts on", 0.15);
    else stopSpeech();
  };

  const togglePower = () => {
    const next = !powered;
    if (next) {
      sfx.powerOn();
    } else {
      stopAlerts();
      stopSpeech();
      setVoiceVisible(false);
      setAlerting(false);
      sfx.powerOff();
    }
    setPowered(next);
  };

  const changeMode = (next: RadarMode) => {
    if (next !== mode) sfx.mode();
    setMode(next);
  };

  const sensitivities = ["LOW", "MED", "HIGH"];
  const brightnessLabels = ["FULL", "MID", "LOW"];
  const color = bandData[band].color;
  const manualDim = brightness === 0 ? 1 : brightness === 1 ? 0.58 : 0.25;

  return (
    <div className="radar-shadow">
      <div className={`radar-unit ${powered ? "powered" : "off"} ${night ? "night" : ""}`} style={{ "--band-color": color, "--screen-dim": manualDim * (night ? 0.68 : 1) } as CSSProperties}>
        <div className="radar-ridge" />
        <div className="radar-brand-row">
          <div><strong>DOWE</strong><span>ROAD SENTRY / R7 / {night ? "NIGHT DRIVE" : "ATS"}</span></div>
          <div className="radar-mode-buttons" aria-label="Drive mode">
            {(["HWY", "AUTO", "CITY"] as RadarMode[]).map((item) => (
              <button key={item} className={mode === item ? "active" : ""} onClick={() => changeMode(item)}>{item}</button>
            ))}
          </div>
        </div>

        <div className="radar-glass">
          {powered ? (
            <div className="radar-screen-content">
              <div className="radar-primary">
                <div className="radar-band"><strong>{band}</strong><span>{bandData[band].frequency}</span></div>
                <div className="radar-signal" aria-label={`Signal strength ${strength} of 7`}>
                  {[1, 2, 3, 4, 5, 6, 7].map((bar) => <i className={bar <= strength ? "active" : ""} key={bar} />)}
                </div>
              </div>

              <div className="radar-direction-row">
                <DirectionArrow direction="left" active={direction === "left"} />
                <DirectionArrow direction="front" active={direction === "front"} />
                <DirectionArrow direction="right" active={direction === "right"} />
              </div>

              <div className="radar-readout">
                <span>ALERT {count.toString().padStart(2, "0")}</span>
                <strong>{status}</strong>
                <small>{mode}{muted ? " / MUTED" : ""}</small>
              </div>

              <div className={`radar-speed-row ${over ? "over" : ""}`} aria-live="off">
                <div><small>SPEED</small><strong>{speed}</strong><em>MPH</em></div>
                <div><small>LIMIT</small><strong>{telemetry.speedLimitMph}</strong><em>{telemetry.location.state}</em></div>
                <div className="radar-speed-note">
                  <small>{telemetry.grade ? "GRADE" : telemetry.cruiseOn ? "CRUISE" : "STATUS"}</small>
                  <strong>{over ? `OVER +${speed - telemetry.speedLimitMph}` : telemetry.grade ? telemetry.grade.split(" / ")[1] : telemetry.cruiseOn ? `${telemetry.cruiseMph} SET` : telemetry.delivered ? "PARKED" : "CLEAR"}</strong>
                </div>
              </div>

              <div className="radar-band-strip">
                {(Object.keys(bandData) as AlertBand[]).map((item) => (
                  <span className={band === item ? "active" : ""} key={item} style={band === item ? { color: bandData[item].color } : undefined}>
                    <i />{item}
                  </span>
                ))}
              </div>
              {voiceVisible && <div className="voice-alert"><SignalIcon /><span>{bandData[band].voice}</span></div>}
            </div>
          ) : (
            <div className="radar-off-screen"><span>DOWE</span><small>PRESS PWR TO START</small></div>
          )}
        </div>

        <div className="radar-controls" aria-label="Radar controls">
          <button className={muted ? "active mute" : ""} onClick={toggleMute} aria-pressed={muted}><span>MUTE</span><small>{muted ? "ON" : "OFF"}</small></button>
          <button className={voiceOn ? "voice-on" : ""} onClick={toggleVoice} aria-pressed={voiceOn}><span>VOICE</span><small>{voiceOn ? "ON" : "OFF"}</small></button>
          <button onClick={() => { sfx.click(); setBrightness((value) => (value + 1) % 3); }}><span>DIM</span><small>{brightnessLabels[brightness]}</small></button>
          <button onClick={() => { sfx.click(); setSensitivity((value) => (value + 1) % 3); }}><span>SENS</span><small>{sensitivities[sensitivity]}</small></button>
          <button className={powered ? "power-on" : ""} onClick={togglePower} aria-pressed={powered}><span>PWR</span><small>{powered ? "ON" : "OFF"}</small></button>
        </div>
        <div className="radar-footer-row">
          <span>SENS / {sensitivities[sensitivity]}</span>
          <span>{telemetry.location.road} / {telemetry.location.state}</span>
          <span>AUDIO / {muted ? "MUTED" : voiceOn ? "TONES + VOICE" : "TONES"}</span>
          <span className={night ? "night-indicator" : powered ? "connected" : ""}><i /> {night ? "NIGHT MODE" : powered ? (telemetry.live ? "ATS LIVE" : "ATS SIM") : "LINK OFF"}</span>
        </div>
      </div>
    </div>
  );
}

/* ELD module */

function Metric({ label, value, tone, note }: { label: string; value: string; tone?: "warning" | "good" | "danger"; note?: string }) {
  return (
    <div className={`eld-metric ${tone || ""}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      {note && <small>{note}</small>}
    </div>
  );
}

function RouteTrack({ telemetry }: { telemetry: Telemetry }) {
  const progress = Math.min(100, (telemetry.mile / JOB.totalMiles) * 100);
  return (
    <div className="route-track" aria-label={`Route progress ${Math.round(progress)} percent`}>
      <div className="route-bar">
        <i className="route-done" style={{ width: `${progress}%` }} />
        {ROUTE.filter((stop) => stop.kind !== "landmark").map((stop) => (
          <b key={stop.mile} className={`route-tick ${stop.kind} ${stop.mile <= telemetry.mile ? "passed" : ""}`} style={{ left: `${(stop.mile / JOB.totalMiles) * 100}%` }} title={stop.name} />
        ))}
        <span className="route-truck" style={{ left: `${progress}%` }}><TruckIcon /></span>
      </div>
      <div className="route-labels">
        {ROUTE.filter((stop) => stop.kind === "city").map((stop) => (
          <span key={stop.mile} className={stop.mile <= telemetry.mile ? "passed" : ""} style={{ left: `${(stop.mile / JOB.totalMiles) * 100}%` }}>{stop.short}</span>
        ))}
      </div>
    </div>
  );
}

function EldLogin({ telemetry, link, clock24, onLogin }: { telemetry: Telemetry; link: LinkInfo; clock24: boolean; onLogin: (driver: Driver) => void }) {
  const [driverId, setDriverId] = useState("");
  const [pin, setPin] = useState("");
  const [field, setField] = useState<"id" | "pin">("id");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [shaking, setShaking] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const pinRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const digits = (value: string) => value.replace(/\D/g, "").slice(0, 4);

  const fail = (message: string) => {
    setError(message);
    setShaking(true);
    sfx.error();
  };

  const press = (key: string) => {
    if (busy) return;
    sfx.key();
    setError(null);
    const apply = (value: string) => (key === "back" ? value.slice(0, -1) : key === "clear" ? "" : digits(value + key));
    if (field === "id") {
      const next = apply(driverId);
      setDriverId(next);
      if (next.length === 10 && key !== "back" && key !== "clear") {
        setField("pin");
        pinRef.current?.focus();
      }
    } else {
      setPin(apply(pin));
    }
  };

  const fill = (driver: Driver) => {
    if (busy) return;
    sfx.tap();
    setDriverId(driver.id);
    setPin(driver.pin);
    setError(null);
    setField("pin");
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (busy) return;
    sfx.tap();
    if (driverId.length < 4 || pin.length < 10 ) {
      fail("Enter your 4-digit driver ID and 4 to 10-digit PIN.");
      return;
    }
    setBusy(true);
    timer.current = window.setTimeout(() => {
      setBusy(false);
      const match = drivers.find((driver) => driver.id === driverId && driver.pin === pin);
      if (match) {
        onLogin(match);
      } else {
        fail("Driver ID or PIN not recognized. Try again.");
        setPin("");
        setField("pin");
      }
    }, 900);
  };

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "clear", "0", "back"];

  return (
    <div className="eld-login">
      <aside className="login-brand">
        <div className="eld-top-brand large"><span><img src={FGIcon} alt="Fleet Guard" /></span><div><strong>FLEET GUARD</strong><small>FOR AMERICAN TRUCK SIMULATOR</small></div></div>
        <div className="login-clock">
          <strong>{formatGameTime(telemetry.gameTime, clock24, false)}</strong>
          <span>{formatGameTime(telemetry.gameTime, clock24).split(" ")[0]} / GAME CLOCK / {telemetry.timeScale}x</span>
        </div>
        <dl className="login-facts">
          <div><dt>TRUCK</dt><dd>{telemetry.truck.make} {telemetry.truck.model} / Unit {driverId}</dd></div>
          <div><dt>TELEMETRY</dt><dd className={link.status === "error" ? "warn" : "ok"}><i /> {link.status === "live" ? "ATS live link" : link.status === "connecting" ? "Searching for ATS" : link.status === "error" ? "Server not found / simulated" : "Simulated drive / I-5 S"}</dd></div>
          <div><dt>ROAD SENTRY</dt><dd className="ok"><i /> Radar module paired</dd></div>
          <div><dt>COMPANY</dt><dd>Dowe Freight Lines / HQ Portland, OR</dd></div>
        </dl>
        <p className="login-legal">Fleet Guard v2.4.8 / SCS telemetry SDK compatible</p>
      </aside>

      <form className={`login-form ${shaking ? "shake" : ""}`} onSubmit={submit} onAnimationEnd={() => setShaking(false)} noValidate>
        <span className="login-eyebrow"><LockIcon /> DRIVER PROFILE SIGN-IN</span>
        <h2>Start your shift</h2>
        <p>Enter your driver ID and PIN. Your profile, duty status, logs, and inspections load for this truck.</p>

        <div className="login-fields">
          <label className={`login-field ${field === "id" ? "active" : ""}`}>
            <span>DRIVER ID</span>
            <input value={driverId} inputMode="numeric" autoComplete="off" placeholder="0000" disabled={busy} onFocus={() => setField("id")} onChange={(event) => { setError(null); setDriverId(digits(event.target.value)); }} />
          </label>
          <label className={`login-field ${field === "pin" ? "active" : ""}`}>
            <span>PIN</span>
            <input ref={pinRef} type="password" value={pin} inputMode="numeric" autoComplete="off" placeholder="••••" disabled={busy} onFocus={() => setField("pin")} onChange={(event) => { setError(null); setPin(digits(event.target.value)); }} />
          </label>
        </div>

        <div className="keypad" aria-label="Number pad">
          {keys.map((key) => (
            <button type="button" key={key} className={key.length > 1 ? "keypad-util" : ""} disabled={busy} aria-label={key === "back" ? "Backspace" : key === "clear" ? "Clear" : key} onMouseDown={(event) => event.preventDefault()} onClick={() => press(key)}>
              {key === "back" ? "⌫" : key === "clear" ? "CLR" : key}
            </button>
          ))}
        </div>

        <p className="login-error" role="alert" aria-live="polite">{error}</p>
        <button type="submit" className="login-submit" disabled={busy}>
          {busy ? <><i /> VERIFYING WITH FLEET SERVER</> : "SIGN IN"}
        </button>

        <div className="login-demo">
          <span>DEMO PROFILES / TAP TO FILL</span>
          <div>
            {drivers.map((driver) => (
              <button type="button" key={driver.id} onClick={() => fill(driver)} disabled={busy}>
                <strong>{driver.name} <em>LVL {driver.level}</em></strong>
                <small>{driver.truck} / {driver.garage}</small>
                <small>ID {driver.id} / PIN {driver.pin}</small>
              </button>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}

function EldHome({ driver, duty, settings, answers, inspection, radar, lastEvent, telemetry, goTo }: {
  driver: Driver;
  duty: string;
  settings: DeviceSettings;
  answers: Answers;
  inspection: InspectionState;
  radar: RadarStatus;
  lastEvent?: RadarEvent;
  telemetry: Telemetry;
  goTo: (tab: EldTab) => void;
}) {
  const metric = settings.metric;
  const answeredCount = countAnswered(answers);
  const defectCount = countDefects(answers);
  const inspectionDone = inspection.status === "validated";
  const inspectionOos = inspectionDone && defectCount.major > 0;
  const inspectionText = inspectionOos
    ? `Out of service / ${defectCount.major} major defect${defectCount.major === 1 ? "" : "s"}`
    : inspectionDone && inspection.validatedAt
      ? defectCount.minor > 0
        ? `Validated ${inspection.validatedAt} / ${defectCount.minor} minor defect${defectCount.minor === 1 ? "" : "s"}`
        : `Validated ${inspection.validatedAt} / all clear`
      : inspection.status === "failed"
        ? `${inspection.missing.length} question${inspection.missing.length === 1 ? "" : "s"} unanswered`
        : answeredCount === 0
          ? `Not started / ${totalQuestions} questions`
          : `${answeredCount} / ${totalQuestions} answered${defectCount.total ? ` / ${defectCount.total} defect${defectCount.total === 1 ? "" : "s"}` : ""}`;
  const radarText = !radar.powered
    ? "Powered off"
    : radar.alerting
      ? `${radar.band} ${bandData[radar.band].frequency} / ${directionLabel[radar.direction]}`
      : lastEvent
        ? `Last ${lastEvent.band} / ${lastEvent.status} / ${formatTime(lastEvent.time, settings.clock24)}`
        : `Scanning / ${radar.mode} mode`;
  const over = telemetry.speedMph > telemetry.speedLimitMph + 2;
  const fuelPct = Math.round((telemetry.fuelGal / telemetry.fuelCapacityGal) * 100);
  const range = telemetry.fuelGal * telemetry.mpg;
  const late = telemetry.etaMinutes > telemetry.job.remainingMinutes;
  const eta = formatGameTime(telemetry.gameTime, settings.clock24, false);
  const etaClock = (() => {
    const t = telemetry.gameTime;
    const totalMin = t.minutes + Math.round(telemetry.etaMinutes);
    const day = (t.day + Math.floor(totalMin / 1440)) % 7;
    return formatGameTime({ day, minutes: totalMin % 1440 }, settings.clock24);
  })();

  return (
    <div className="eld-screen-grid">
      <section className="job-card">
        <div className="job-head">
          <span className="eld-eyebrow">{telemetry.live ? "ACTIVE JOB / LIVE FROM ATS" : `ACTIVE JOB / ${telemetry.job.sourceCompany.toUpperCase()} TO ${telemetry.job.destinationCompany.toUpperCase()}`}</span>
          <strong className={telemetry.delivered ? "job-badge good" : late ? "job-badge late" : "job-badge"}>
            {telemetry.delivered ? "DELIVERED" : `DELIVER BY ${formatGameTime(telemetry.job.deadline, settings.clock24)} / ${formatDuration(telemetry.job.remainingMinutes)} LEFT`}
          </strong>
        </div>
        <h2>{telemetry.job.sourceCity} <i><ArrowIcon /></i> {telemetry.job.destinationCity}</h2>
        <div className="job-facts">
          <div><span>CARGO</span><strong>{telemetry.job.cargo}</strong></div>
          <div><span>WEIGHT</span><strong>{telemetry.trailer.attached ? `${Math.round(telemetry.trailer.massLb).toLocaleString()} lb` : "No trailer"}</strong></div>
          <div><span>TRAILER</span><strong>{telemetry.trailer.attached ? telemetry.trailer.name : "Bobtail"}</strong></div>
          <div><span>INCOME</span><strong>${telemetry.job.income.toLocaleString()}</strong></div>
          <div><span>REMAINING</span><strong>{fmtDist(telemetry.distanceRemainingMi, metric)} {distUnit(metric).toLowerCase()}</strong></div>
          <div><span>ETA</span><strong>{telemetry.delivered ? "Arrived" : telemetry.live ? formatDuration(telemetry.etaMinutes) : etaClock}</strong></div>
        </div>
        {!telemetry.live && <RouteTrack telemetry={telemetry} />}
        <div className="eld-route-meta">
          <span>{telemetry.location.road} / {telemetry.location.near}{telemetry.delivered ? "" : ` / next: ${telemetry.location.nextStop} ${fmtDist(telemetry.location.milesToNext, metric)} ${distUnit(metric).toLowerCase()}`}</span>
          <strong className={late ? "late" : ""}>{telemetry.delivered ? `JOB COMPLETE / +$${telemetry.job.income.toLocaleString()}` : late ? `RUNNING LATE / ETA ${formatDuration(telemetry.etaMinutes)}` : `ON TIME / ${formatDuration(telemetry.job.remainingMinutes - telemetry.etaMinutes)} SPARE / NOW ${eta}`}</strong>
        </div>
      </section>
      <section className="eld-driver-section">
        <div className="driver-avatar">{driver.initials}</div>
        <div><span>{driver.role.toUpperCase()} / LVL {driver.level}</span><strong>{driver.name}</strong><small>{telemetry.truck.make} {telemetry.truck.model} / Unit {driver.id} / {driver.garage}</small></div>
        <button onClick={() => goTo("duty")}>{duty} <i /></button>
      </section>
      <section className="gauge-grid">
        <Metric label="SPEED" value={fmtSpeed(telemetry.speedMph, metric)} note={`${speedUnit(metric)} / LIMIT ${fmtSpeed(telemetry.speedLimitMph, metric)}`} tone={over ? "danger" : undefined} />
        <Metric label="ENGINE" value={telemetry.rpm.toLocaleString()} note={`RPM / GEAR ${telemetry.gear || "N"}${telemetry.retarder ? " / JAKE" : ""}`} />
        <Metric label="FUEL" value={fmtVol(telemetry.fuelGal, metric)} note={`${volUnit(metric)} / ${fuelPct}% / ${fmtDist(range, metric)} ${distUnit(metric)}`} tone={fuelPct <= 15 ? "warning" : undefined} />
        <Metric label="CRUISE" value={telemetry.cruiseOn ? fmtSpeed(telemetry.cruiseMph, metric) : "OFF"} note={telemetry.grade ? telemetry.grade.split(" / ")[0] : telemetry.cruiseOn ? `${speedUnit(metric)} SET` : "MANUAL"} tone={telemetry.grade ? "warning" : undefined} />
        <Metric label="ODOMETER" value={fmtDist(telemetry.odometerMi, metric)} note={`${distUnit(metric)} / TRIP ${fmtDist(telemetry.tripMi, metric)}`} />
        <Metric label="GAME CLOCK" value={formatGameTime(telemetry.gameTime, settings.clock24, false)} note={`${formatGameTime(telemetry.gameTime, settings.clock24).split(" ")[0]} / ${telemetry.timeScale}x${telemetry.paused ? " / PAUSED" : ""}`} />
      </section>
      <section className="eld-quick-row">
        <button className={telemetry.hos.driveLeft < 60 ? "warn" : ""} onClick={() => goTo("hos")}><span>Next rest stop</span><strong>{formatDuration(telemetry.hos.nextRest)} of drive time left</strong><i><ArrowIcon /></i></button>
        <button className={inspectionOos ? "oos" : inspectionDone ? "good" : "warn"} onClick={() => goTo("inspect")}>
          <span>Vehicle inspection</span><strong>{inspectionText}</strong><i>{inspectionOos ? <CloseIcon /> : inspectionDone ? <CheckIcon /> : <ArrowIcon />}</i>
        </button>
        <button className={`quick-radar ${!radar.powered ? "off" : radar.alerting ? "alerting" : ""}`} style={{ "--chip": bandData[radar.band].color } as CSSProperties} onClick={() => goTo("violations")}>
          <span>Road Sentry radar</span><strong>{radarText}</strong><i><SignalIcon /></i>
        </button>
      </section>
    </div>
  );
}

function EldHos({ telemetry }: { telemetry: Telemetry }) {
  const { hos } = telemetry;
  const progress = Math.min(100, (hos.drivingToday / 660) * 100);
  const tired = hos.driveLeft <= 0;
  return (
    <div className="eld-section-screen">
      <div className="eld-section-heading">
        <div><span>FMCSA CLOCKS / ATS FATIGUE</span><h2>Hours of service</h2></div>
        <strong className={tired ? "eld-failed" : "eld-compliant"}>{tired ? "REST REQUIRED" : <><i /> COMPLIANT</>}</strong>
      </div>
      <div className="hos-primary">
        <div className={`hos-ring ${tired ? "tired" : ""}`} style={{ "--progress": `${progress}%` } as CSSProperties}><div><strong>{formatDuration(hos.driveLeft).replace(" ", "\u00a0")}</strong><span>DRIVE LEFT</span></div></div>
        <div className="hos-summary">
          <span>DRIVEN THIS SHIFT / GAME TIME</span>
          <strong>{formatDuration(hos.drivingToday)}</strong>
          <small>of 11 hours / next in-game rest stop in {formatDuration(hos.nextRest)}</small>
          <div><i style={{ width: `${progress}%` }} /></div>
        </div>
      </div>
      <div className="hos-grid">
        <Metric label="14-HOUR WINDOW" value={formatDuration(hos.windowLeft)} note="remaining" tone={hos.windowLeft < 120 ? "warning" : undefined} />
        <Metric label="70-HOUR CYCLE" value={formatDuration(hos.cycleLeft)} note="remaining" />
        <Metric label="BREAK DUE IN" value={formatDuration(hos.breakDue)} note="since Gallon stop, Eugene" tone={hos.breakDue < 120 ? "warning" : undefined} />
        <Metric label="ON DUTY TODAY" value={formatDuration(hos.onDutyToday)} note="started 06:00 AM / Portland" />
      </div>
      <p className="eld-inline-note"><span>ATS LINK</span> Drive-time left mirrors the game's <code>game.nextRestStopTime</code> fatigue timer. Sleep at any rest area, truck stop, or your garage to reset it. Clocks run at {telemetry.timeScale}x game time.</p>
    </div>
  );
}

function EldDuty({ duty, onChange }: { duty: string; onChange: (next: string) => void }) {
  return (
    <div className="eld-section-screen">
      <div className="eld-section-heading"><div><span>DRIVER ACTIVITY</span><h2>Duty status</h2></div><strong className="eld-live"><i /> LIVE</strong></div>
      <div className="duty-current"><span>CURRENT STATUS</span><strong>{duty}</strong><small>Since 08:45 AM game time / Automatic from telemetry truck motion</small></div>
      <div className="duty-grid">
        {dutyOptions.map((option) => (
          <button className={duty === option ? "active" : ""} key={option} onClick={() => onChange(option)} aria-pressed={duty === option}><i />{option}</button>
        ))}
      </div>
      <p className="eld-inline-note"><span>MANUAL OVERRIDE</span> Selecting a status plays a confirmation tone and creates a signed event in today's trip log.</p>
    </div>
  );
}

function EldLogs({ certified, onCertify }: { certified: boolean; onCertify: () => void }) {
  return (
    <div className="eld-section-screen">
      <div className="eld-section-heading">
        <div><span>TUESDAY / GAME DAY 2</span><h2>Trip log</h2></div>
        <button className={`eld-outline-button ${certified ? "done" : ""}`} onClick={onCertify} disabled={certified}>{certified ? "CERTIFIED" : "CERTIFY DAY"}</button>
      </div>
      <div className="log-timeline" aria-label="Duty graph">
        <div className="log-labels"><span>OFF</span><span>SB</span><span>D</span><span>ON</span></div>
        <div className="log-chart"><i className="segment a" /><i className="segment b" /><i className="segment c" /><i className="segment d" /><i className="now" /></div>
      </div>
      <div className="eld-table log-table">
        <div className="eld-table-head"><span>GAME TIME</span><span>STATUS</span><span>DURATION</span><span>ORIGIN / LOCATION</span></div>
        {logData.map((row) => (
          <div className="eld-table-row" key={row[0] + row[1]}>
            {row.map((cell, index) => <span className={index === 1 ? "status-cell" : ""} key={cell}><i />{cell}</span>)}
          </div>
        ))}
      </div>
    </div>
  );
}

function EldFines({ radarEvents, simEvents, clock24 }: { radarEvents: RadarEvent[]; simEvents: SimEvent[]; clock24: boolean }) {
  return (
    <div className="eld-section-screen">
      <div className="eld-section-heading"><div><span>SAFETY CENTER / ATS OFFENCES</span><h2>Fines and alerts</h2></div><strong className="eld-compliant"><i /> NO ACTIVE FINES</strong></div>
      <div className="alerts-lead"><i><CheckIcon /></i><div><strong>Clean record on this job</strong><span>No speeding, red light, wrong-way, or weigh-station offences since leaving Voltison, Portland.</span></div></div>
      <div className="fine-summary"><Metric label="FINES THIS WEEK" value="$800" note="2 offences" tone="warning" /><Metric label="FINES THIS MONTH" value="$1,350" note="4 offences" /><Metric label="SAFE MILES" value="1,204" note="since last fine" tone="good" /></div>
      <h3 className="eld-subhead">RECENT OFFENCES</h3>
      {pastFines.map((fine) => (
        <div className="eld-alert-row warning fine-row" key={fine.title + fine.when}>
          <span>{fine.when}</span>
          <div><strong>{fine.title} / {fine.amount}</strong><small>{fine.detail}</small></div>
          <b>PAID</b>
        </div>
      ))}
      <h3 className="eld-subhead">ROUTE ADVISOR EVENTS</h3>
      {simEvents.length === 0 ? (
        <p className="eld-empty">No route events yet. The advisor logs the state line, weigh stations, grades, fuel, rest, and delivery as the drive progresses.</p>
      ) : (
        [...simEvents].reverse().slice(0, 6).map((event) => (
          <div className={`eld-alert-row ${event.tone === "warning" ? "warning" : event.tone === "success" ? "success" : ""}`} key={event.id}>
            <span>{formatGameTime(event.gameTime, clock24)}</span>
            <div><strong>{event.title}</strong><small>{event.body}</small></div>
            <b>{event.kind.toUpperCase()}</b>
          </div>
        ))
      )}
      <h3 className="eld-subhead">ROAD SENTRY RADAR EVENTS</h3>
      {radarEvents.length === 0 ? (
        <p className="eld-empty">No radar alerts logged this shift. Run a test alert on the Road Sentry and it will appear here.</p>
      ) : (
        radarEvents.slice(0, 6).map((event) => (
          <div className="radar-event" key={event.id} style={{ "--chip": bandData[event.band].color } as CSSProperties}>
            <b>{event.band}</b>
            <div><strong>{event.status} / {bandData[event.band].frequency}</strong><small>{directionLabel[event.direction]} / signal {event.strength} of 7 / {event.near}</small></div>
            <span>{formatTime(event.time, clock24)}</span>
          </div>
        ))
      )}
    </div>
  );
}

function EldFuel({ rows, telemetry, metric, onAdd }: { rows: FuelRow[]; telemetry: Telemetry; metric: boolean; onAdd: () => void }) {
  const pct = Math.round((telemetry.fuelGal / telemetry.fuelCapacityGal) * 100);
  const range = telemetry.fuelGal * telemetry.mpg;
  return (
    <div className="eld-section-screen">
      <div className="eld-section-heading"><div><span>GALLON NETWORK / IFTA</span><h2>Fuel</h2></div><button className="eld-outline-button" onClick={onAdd} disabled={pct >= 99}>{pct >= 99 ? "TANK FULL" : "+ FILL UP AT GALLON"}</button></div>
      <div className="fuel-summary">
        <Metric label="TANK" value={`${fmtVol(telemetry.fuelGal, metric)} / ${fmtVol(telemetry.fuelCapacityGal, metric)}`} note={`${volUnit(metric)} / ${pct}%`} tone={pct <= 15 ? "danger" : pct <= 30 ? "warning" : undefined} />
        <Metric label="RANGE" value={fmtDist(range, metric)} note={`${distUnit(metric)} at ${telemetry.mpg.toFixed(1)} mpg`} tone={range < 150 ? "warning" : "good"} />
        <Metric label="NEXT GALLON" value={telemetry.delivered ? "Arrived" : telemetry.location.nextStop} note={telemetry.delivered ? "" : `${fmtDist(telemetry.location.milesToNext, metric)} ${distUnit(metric)} ahead`} />
      </div>
      <div className="eld-table fuel-table">
        <div className="eld-table-head"><span>GAME TIME</span><span>STATION</span><span>LOCATION</span><span>VOLUME</span><span>TOTAL</span></div>
        {rows.map((row) => (
          <div className="eld-table-row" key={row.id}>
            {row.cells.map((cell, index) => <span key={`${row.id}-${index}`}>{cell}</span>)}
          </div>
        ))}
      </div>
    </div>
  );
}

function EldLink({ link, source, telemetry, onSource }: { link: LinkInfo; source: TelemetrySource; telemetry: Telemetry; onSource: (next: TelemetrySource) => void }) {
  const feed: [string, string][] = [
    ["game.gameName", telemetry.gameName],
    ["game.connected", String(telemetry.live || link.status === "sim")],
    ["game.paused", String(telemetry.paused)],
    ["game.time", formatGameTime(telemetry.gameTime, true)],
    ["game.timeScale", telemetry.timeScale.toFixed(1)],
    ["game.nextRestStopTime", formatDuration(telemetry.hos.nextRest)],
    ["truck.make / model", `${telemetry.truck.make} ${telemetry.truck.model}`],
    ["truck.speed", `${(telemetry.speedMph / 0.621371).toFixed(1)} km/h (${telemetry.speedMph.toFixed(1)} mph)`],
    ["truck.cruiseControlOn", String(telemetry.cruiseOn)],
    ["truck.engineRpm", telemetry.rpm.toFixed(0)],
    ["truck.displayedGear", String(telemetry.gear)],
    ["truck.fuel", `${(telemetry.fuelGal / 0.264172).toFixed(0)} L (${telemetry.fuelGal.toFixed(1)} gal)`],
    ["truck.retarderBrake", telemetry.retarder ? "1" : "0"],
    ["trailer.attached", String(telemetry.trailer.attached)],
    ["trailer.mass", `${Math.round(telemetry.trailer.massLb / 2.20462)} kg`],
    ["job.sourceCity", telemetry.job.sourceCity],
    ["job.destinationCity", telemetry.job.destinationCity],
    ["job.income", `$${telemetry.job.income.toLocaleString()}`],
    ["job.remainingTime", formatDuration(telemetry.job.remainingMinutes)],
    ["navigation.speedLimit", `${Math.round(telemetry.speedLimitMph / 0.621371)} km/h (${telemetry.speedLimitMph} mph)`],
    ["navigation.estimatedDistance", `${Math.round(telemetry.distanceRemainingMi * 1609.344)} m`],
    ["navigation.estimatedTime", formatDuration(telemetry.etaMinutes)],
  ];

  return (
    <div className="eld-section-screen">
      <div className="eld-section-heading">
        <div><span>SCS TELEMETRY SDK</span><h2>ATS link</h2></div>
        <strong className={link.status === "live" ? "eld-compliant" : link.status === "error" ? "eld-failed" : link.status === "connecting" ? "eld-pending" : "eld-live"}>
          {link.status === "live" ? <><i /> LIVE</> : link.status === "connecting" ? "SEARCHING" : link.status === "error" ? "NOT FOUND" : <><i /> SIMULATED</>}
        </strong>
      </div>
      <div className="source-cards">
        <button className={source === "sim" ? "active" : ""} onClick={() => onSource("sim")} aria-pressed={source === "sim"}>
          <i /><div><strong>Simulated drive</strong><small>Portland, OR to Los Angeles, CA on I-5 at {TIME_SCALE}x game time. State-line limits, the Siskiyou grade, a weigh-station bypass, fuel, fatigue, and delivery.</small></div>
        </button>
        <button className={source === "live" ? "active" : ""} onClick={() => onSource("live")} aria-pressed={source === "live"}>
          <i /><div><strong>Live from American Truck Simulator</strong><small>Polls the ETS2/ATS Telemetry Server on this PC at <code>{TELEMETRY_URL}</code> every two seconds and maps speed, limit, fuel, job, and rest data onto the dash.</small></div>
        </button>
      </div>
      <div className={`link-status ${link.status}`}><i /><span>{link.message}</span></div>
      {source === "live" && link.status !== "live" && (
        <p className="eld-inline-note"><span>SETUP</span> Install the free telemetry server, start it, launch ATS, and keep this page open on the same machine. If your browser blocks the local request, open this page over http or allow insecure localhost content.</p>
      )}
      <h3 className="eld-subhead">TELEMETRY FEED / {telemetry.live ? "LIVE VALUES" : "SIMULATED VALUES"}</h3>
      <div className="sdk-feed">
        {feed.map(([key, value]) => <div className="sdk-row" key={key}><span>{key}</span><strong>{value}</strong></div>)}
      </div>
    </div>
  );
}

function EldSettingsScreen({ settings, onToggle, soundOn, onToggleSound }: { settings: DeviceSettings; onToggle: (key: keyof DeviceSettings) => void; soundOn: boolean; onToggleSound: () => void }) {
  return (
    <div className="eld-section-screen">
      <div className="eld-section-heading"><div><span>DEVICE / FG-482-01</span><h2>System settings</h2></div><strong className="device-version">v2.4.8</strong></div>
      <div className="settings-list">
        <button onClick={onToggleSound} aria-pressed={soundOn}>
          <span><strong>Device sounds</strong><small>{soundOn ? "Button, alert, and confirmation tones" : "All device audio is muted"}</small></span>
          <i className={soundOn ? "on" : ""}><b /></i>
        </button>
        {settingDefs.map((def) => (
          <button key={def.key} onClick={() => onToggle(def.key)} aria-pressed={settings[def.key]}>
            <span><strong>{def.label}</strong><small>{def.hint}</small></span>
            <i className={settings[def.key] ? "on" : ""}><b /></i>
          </button>
        ))}
      </div>
    </div>
  );
}

function EldApp({ driver, settings, radar, radarEvents, telemetry, simEvents, link, source, nightMode, onSource, onRefuel, onSettingsChange, onLogout }: {
  driver: Driver;
  settings: DeviceSettings;
  radar: RadarStatus;
  radarEvents: RadarEvent[];
  telemetry: Telemetry;
  simEvents: SimEvent[];
  link: LinkInfo;
  source: TelemetrySource;
  nightMode: boolean;
  onSource: (next: TelemetrySource) => void;
  onRefuel: () => number;
  onSettingsChange: (next: DeviceSettings) => void;
  onLogout: () => void;
}) {
  const [activeTab, setActiveTab] = useState<EldTab>("duty");
  const [duty, setDuty] = useState("DRIVING");
  const [answers, setAnswers] = useState<Answers>({});
  const [inspection, setInspection] = useState<InspectionState>(freshInspection);
  const [certified, setCertified] = useState(false);
  const [fuelRows, setFuelRows] = useState<FuelRow[]>(initialFuel);
  const [notice, setNotice] = useState<Notice | null>(null);
  const soundOn = useSoundOn();
  const noticeTimer = useRef<number | undefined>(undefined);
  const voiceRef = useRef(settings.voice);
  const inspectionRef = useRef(inspection.status);
  const seenEvent = useRef(simEvents.length ? simEvents[simEvents.length - 1].id : 0);
  voiceRef.current = settings.voice;
  inspectionRef.current = inspection.status;

  const showNotice = useCallback((next: Notice, ms = 7000) => {
    window.clearTimeout(noticeTimer.current);
    setNotice(next);
    noticeTimer.current = window.setTimeout(() => setNotice(null), ms);
  }, []);

  useEffect(() => {
    const inspectionReminder = window.setTimeout(() => {
      if (inspectionRef.current === "validated") return;
      sfx.warning();
      showNotice({ tone: "warning", title: "Vehicle inspection required", body: "No DVIR has been validated for Unit ${driver.id} today. Complete the checklist and validate it before the next weigh station.", action: { label: "OPEN", onClick: () => setActiveTab("inspect") } }, 10000);
      if (voiceRef.current) speak("Vehicle inspection required. Please complete and validate the checklist.", 0.7);
    }, 2400);
    return () => {
      window.clearTimeout(inspectionReminder);
      window.clearTimeout(noticeTimer.current);
      stopSpeech();
    };
  }, [showNotice]);

  useEffect(() => {
    const fresh = simEvents.filter((event) => event.id > seenEvent.current);
    if (!fresh.length) return;
    seenEvent.current = fresh[fresh.length - 1].id;
    const event = fresh[fresh.length - 1];
    if (event.tone === "success") sfx.success();
    else if (event.tone === "warning") sfx.warning();
    else sfx.chime();
    showNotice({ tone: event.tone === "warning" ? "warning" : "info", title: event.title, body: event.body, action: event.kind === "fuel" ? { label: "FUEL", onClick: () => setActiveTab("fuel") } : undefined }, 9000);
    if (event.speak && voiceRef.current) speak(event.speak, 0.6);
  }, [simEvents, showNotice]);

  const goTo = (tab: EldTab) => {
    if (tab !== activeTab) sfx.tap();
    setActiveTab(tab);
  };

  const changeDuty = (next: string) => {
    if (next === duty) return;
    sfx.confirm();
    setDuty(next);
    showNotice({ tone: "info", title: "Duty status updated", body: `${duty} to ${next} recorded at ${formatGameTime(telemetry.gameTime, settings.clock24)} and added to today's trip log.` }, 6000);
  };

  const changeAnswers = (entries: [string, Answer | null][]) => {
    const next: Answers = { ...answers };
    for (const [id, answer] of entries) {
      if (answer) next[id] = answer;
      else delete next[id];
    }
    setAnswers(next);
    if (inspection.status === "validated") {
      setInspection(freshInspection);
    } else if (inspection.status === "failed") {
      const missing = inspection.missing.filter((id) => !next[id]);
      setInspection(missing.length ? { ...inspection, missing } : freshInspection);
    }
  };

  /** Returns the ids of unanswered questions so the inspection screen can jump to the first one. */
  const validateInspection = (): string[] => {
    const missing = allQuestions.filter((question) => !answers[question.id]).map((question) => question.id);
    if (missing.length) {
      sfx.error();
      setInspection({ status: "failed", missing, validatedAt: null });
      showNotice({ tone: "warning", title: "Inspection incomplete", body: `${missing.length} question${missing.length === 1 ? " is" : "s are"} still unanswered. They are flagged in red so you can finish and validate again.` }, 7000);
      return missing;
    }
    const stamp = formatGameTime(telemetry.gameTime, settings.clock24);
    const defects = countDefects(answers);
    setInspection({ status: "validated", missing: [], validatedAt: stamp });
    if (defects.major > 0) {
      sfx.warning();
      showNotice({ tone: "warning", title: "Vehicle out of service", body: `${defects.major} major defect${defects.major === 1 ? "" : "s"} reported at ${stamp}. Repair before dispatch, then re-check the flagged items.` }, 11000);
      if (settings.voice) speak("Vehicle out of service. Major defects reported.", 0.5);
    } else if (defects.minor > 0) {
      sfx.success();
      showNotice({ tone: "info", title: "Inspection validated with defects", body: `DVIR signed by ${driver.name} at ${stamp}. ${defects.minor} minor defect${defects.minor === 1 ? "" : "s"} queued for the next service visit.` }, 8000);
      if (settings.voice) speak("Vehicle inspection validated with minor defects.", 0.5);
    } else {
      sfx.success();
      showNotice({ tone: "info", title: "Inspection validated", body: `DVIR signed by ${driver.name} at ${stamp}. All ${totalQuestions} items passed with no defects.` }, 6000);
      if (settings.voice) speak("Vehicle inspection validated.", 0.5);
    }
    return [];
  };

  const recheckDefects = () => {
    const next: Answers = {};
    for (const [id, answer] of Object.entries(answers)) {
      if (answer.result !== "defect") next[id] = answer;
    }
    setAnswers(next);
    setInspection(freshInspection);
    showNotice({ tone: "info", title: "Re-check defects", body: "The flagged items were reset. Inspect them again once the repair is complete." }, 5000);
  };

  const resetInspection = () => {
    setAnswers({});
    setInspection(freshInspection);
  };

  const readings: Readings = { air: telemetry.airPsi, oil: telemetry.oilPsi, coolant: telemetry.coolantF, cargo: telemetry.trailer.massLb };

  const certify = () => {
    if (certified) return;
    sfx.confirm();
    setCertified(true);
    showNotice({ tone: "info", title: "Trip log certified", body: `${driver.name} certified today's record of duty status.` }, 5000);
  };

  const addFuel = () => {
    const added = onRefuel();
    if (added <= 0) return;
    sfx.confirm();
    const price = telemetry.location.state === "CA" ? 3.89 : 3.42;
    setFuelRows((rows) => [{ id: Date.now(), cells: [formatGameTime(telemetry.gameTime, settings.clock24).replace(" ", " / "), "Gallon", telemetry.location.nextStop + (telemetry.location.state === "CA" ? ", CA" : ", OR"), `${added.toFixed(1)} gal`, `$${(added * price).toFixed(2)}`] }, ...rows]);
  };

  const updateSetting = (key: keyof DeviceSettings) => {
    const next = !settings[key];
    onSettingsChange({ ...settings, [key]: next });
    sfx.toggle(next);
    if (key === "voice") {
      if (next) speak("Voice alerts enabled.", 0.2);
      else stopSpeech();
    }
  };

  const changeSource = (next: TelemetrySource) => {
    if (next === source) return;
    sfx.tap();
    onSource(next);
  };

  const toggleDeviceSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    if (next) sfx.toggle(true);
  };

  const dismissNotice = () => {
    sfx.tap();
    window.clearTimeout(noticeTimer.current);
    setNotice(null);
  };

  const runNoticeAction = (action: NoticeAction) => {
    sfx.tap();
    window.clearTimeout(noticeTimer.current);
    setNotice(null);
    action.onClick();
  };

  let screen: ReactNode;
  switch (activeTab) {
    case "home":
      screen = <EldHome driver={driver} duty={duty} settings={settings} answers={answers} inspection={inspection} radar={radar} lastEvent={radarEvents[0]} telemetry={telemetry} goTo={goTo} />;
      break;
    case "hos":
      screen = <EldHos telemetry={telemetry} />;
      break;
    case "duty":
      screen = <EldDuty duty={duty} onChange={changeDuty} />;
      break;
    case "logs":
      screen = <EldLogs certified={certified} onCertify={certify} />;
      break;
    case "inspect":
      screen = <EldInspection answers={answers} inspection={inspection} readings={readings} driverName={driver.name} truckLabel={`Unit ${driver.id} / ${telemetry.truck.make} ${telemetry.truck.model}`} onChange={changeAnswers} onValidate={validateInspection} onRecheck={recheckDefects} onReset={resetInspection} />;
      break;
    case "violations":
      screen = <EldFines radarEvents={radarEvents} simEvents={simEvents} clock24={settings.clock24} />;
      break;
    case "fuel":
      screen = <EldFuel rows={fuelRows} telemetry={telemetry} metric={settings.metric} onAdd={addFuel} />;
      break;
    case "link":
      screen = <EldLink link={link} source={source} telemetry={telemetry} onSource={changeSource} />;
      break;
    default:
      screen = <EldSettingsScreen settings={settings} onToggle={updateSetting} soundOn={soundOn} onToggleSound={toggleDeviceSound} />;
  }

  const chipState = !radar.powered ? "off" : radar.alerting ? "alert" : "clear";
  const chipText = !radar.powered ? "RADAR OFF" : radar.alerting ? `RADAR ${radar.band} ${directionLabel[radar.direction]}` : "RADAR CLEAR";
  const linkText = link.status === "live" ? "ATS LIVE" : link.status === "connecting" ? "ATS SEARCH" : link.status === "error" ? "ATS OFFLINE" : "ATS SIM";

  return (
    <>
      <header className="eld-topbar">
        <div className="eld-top-brand"><span><img src={FGIcon} alt="Fleet Guard" /></span><div><strong>FLEET GUARD</strong><small>FOR AMERICAN TRUCK SIMULATOR</small></div></div>
        <div className="eld-top-route"><span>TRUCK</span><strong>UNIT {driver.id} / {telemetry.truck.make.toUpperCase()} {telemetry.truck.model.toUpperCase()}</strong></div>
        <div className="eld-top-status">
          <span className={`eld-radar-chip ${chipState}`} style={{ "--chip": bandData[radar.band].color } as CSSProperties} aria-live="polite"><i />{chipText}</span>
          <button className={`link-chip ${link.status}`} onClick={() => goTo("link")} title="Open ATS link"><TruckIcon /> {linkText}</button>
          <div className="game-clock"><strong>{formatGameTime(telemetry.gameTime, settings.clock24, false)}</strong><small>{formatGameTime(telemetry.gameTime, settings.clock24).split(" ")[0]} / {telemetry.timeScale}x</small></div>
        </div>
      </header>
      <div className="eld-app-body">
        <nav className="eld-nav" aria-label="ELD screens">
          {tabs.map((tab, index) => (
            <button key={tab.id} className={activeTab === tab.id ? "active" : ""} onClick={() => goTo(tab.id)}>
              <span>{(index + 1).toString().padStart(2, "0")}</span>{tab.label}
            </button>
          ))}
          <div className="eld-nav-driver"><i>{driver.initials}</i><span>{driver.name}<small>Driver {driver.id} / {driver.truck}</small></span></div>
          <button className="eld-nav-signout" onClick={onLogout}><PowerIcon /> SIGN OUT</button>
        </nav>
        <div className="eld-content" key={activeTab}>{screen}</div>
      </div>
      <footer className="eld-statusbar">
        <span><i /> ELD CONNECTED</span>
        <span>{telemetry.location.road} / {telemetry.location.state}</span>
        <span>{soundOn ? "SOUND ON" : "SOUND OFF"}</span>
        <span className={inspection.status === "validated" && countDefects(answers).major > 0 ? "status-oos" : ""}>{inspection.status === "validated" ? (countDefects(answers).major > 0 ? "VEHICLE OUT OF SERVICE" : "DVIR SIGNED") : `DVIR ${countAnswered(answers)}/${totalQuestions}`}</span>
        {nightMode && <span className="night-status"><MoonIcon /> NIGHT BACKLIGHT</span>}
        <span>REAL {formatTime(new Date(), settings.clock24)}</span>
        <strong>{telemetry.live ? "LIVE TELEMETRY" : "DOT READY"}</strong>
      </footer>
      {notice && (
        <div className={`eld-toast ${notice.tone || "warning"}`} role="status">
          <i><BellIcon /></i>
          <div><strong>{notice.title}</strong><span>{notice.body}</span></div>
          <div className="toast-buttons">
            {notice.action && <button className="toast-action" onClick={() => runNoticeAction(notice.action as NoticeAction)}>{notice.action.label}</button>}
            <button className="toast-close" onClick={dismissNotice} aria-label="Dismiss notification"><CloseIcon /></button>
          </div>
        </div>
      )}
    </>
  );
}

function EldDevice({ radar, radarEvents, telemetry, simEvents, link, source, night, lightingOverride, onSource, onRefuel }: {
  radar: RadarStatus;
  radarEvents: RadarEvent[];
  telemetry: Telemetry;
  simEvents: SimEvent[];
  link: LinkInfo;
  source: TelemetrySource;
  night: boolean;
  lightingOverride: LightingOverride;
  onSource: (next: TelemetrySource) => void;
  onRefuel: () => number;
}) {
  const [driver, setDriver] = useState<Driver | null>(null);
  const [settings, setSettings] = useState<DeviceSettings>(defaultSettings);
  const nightMode = lightingOverride === "day" ? false : night || settings.night;

  const login = (next: Driver) => {
    sfx.success();
    setDriver(next);
  };

  const logout = () => {
    stopSpeech();
    sfx.logout();
    setDriver(null);
  };

  return (
    <div className="tablet-frame">
      <div className="tablet-camera"><i /></div>
      <div className={`tablet-screen ${nightMode ? "night ats-night" : ""}`}>
        {driver ? (
          <EldApp driver={driver} settings={settings} radar={radar} radarEvents={radarEvents} telemetry={telemetry} simEvents={simEvents} link={link} source={source} nightMode={nightMode} onSource={onSource} onRefuel={onRefuel} onSettingsChange={setSettings} onLogout={logout} />
        ) : (
          <EldLogin telemetry={telemetry} link={link} clock24={settings.clock24} onLogin={login} />
        )}
      </div>
      <div className="tablet-home-line" />
    </div>
  );
}

/* Combined console */

function ConsolePage({ layout, setLayout, back }: { layout: Layout; setLayout: (next: Layout) => void; back: () => void }) {
  const radarRef = useRef<RadarHandle>(null);
  const [radar, setRadar] = useState<RadarStatus>(initialRadarStatus);
  const [events, setEvents] = useState<RadarEvent[]>([]);
  const [lightingOverride, setLightingOverride] = useState<LightingOverride>("auto");
  const { telemetry, events: simEvents, link, source, setSource, refuel } = useAtsSim();

  const handleAlert = useCallback((event: RadarEvent) => {
    setEvents((list) => [event, ...list].slice(0, 12));
  }, []);

  const switchLayout = (next: Layout) => {
    if (next === layout) return;
    sfx.tap();
    setLayout(next);
  };

  const over = telemetry.speedMph > telemetry.speedLimitMph + 2;
  const gameNight = isGameNight(telemetry.gameTime);
  const night = lightingOverride === "night" || (lightingOverride === "auto" && gameNight);

  const setLighting = (next: LightingOverride) => {
    if (next === lightingOverride) return;
    sfx.tap();
    setLightingOverride(next);
  };

  return (
    <main className={`demo-page console-page layout-${layout}`}>
      <DemoHeader
        title="Dowe Technologies Electronics System"
        type="American Truck Simulator console"
        back={back}
        action={
          <div className="demo-actions">
            <button className="test-alert-button" onClick={() => radarRef.current?.triggerAlert()} disabled={!radar.powered}><SignalIcon /> Run test alert</button>
            <SoundToggle compact />
          </div>
        }
      />
      <section className="console-workbench">
        <div className="console-heading">
          <div className="heading-copy">
            <span className="eyebrow">INTEGRATED CAB CONSOLE / ATS</span>
            <h1>Your ATS cab, fully instrumented.</h1>
            <p>A simulated run from Voltison in Portland to Wallbert in Los Angeles is already rolling at the game's {TIME_SCALE}x clock. Cross the state line, bypass the Hornbrook scale, and watch Road Sentry alerts land on the Fleet Guard tablet. Switch the ELD to <strong>ATS link</strong> to read your real truck instead.</p>
          </div>
          <div className="console-tools">
            <div className={`telemetry-chip ${telemetry.live ? "live" : ""} ${over ? "over" : ""}`} aria-live="off">
              <i /><span>{telemetry.live ? "ATS LIVE" : "SIM DRIVE"}</span>
              <b>{telemetry.location.road} / {telemetry.location.state}</b>
              <b>{Math.round(telemetry.speedMph)} / {telemetry.speedLimitMph} MPH</b>
              <b>{formatGameTime(telemetry.gameTime, false)}</b>
            </div>
            <div className="console-tool-row">
              <div className={`lighting-control ${night ? "night" : "day"}`} role="group" aria-label="Simulated cab lighting">
                <span className="lighting-readout"><MoonIcon /><b>{night ? "NIGHT DRIVE" : "DAY DRIVE"}</b></span>
                <div className="lighting-switch">
                  {(["auto", "day", "night"] as LightingOverride[]).map((item) => (
                    <button key={item} aria-pressed={lightingOverride === item} className={lightingOverride === item ? "active" : ""} onClick={() => setLighting(item)}>{item.toUpperCase()}</button>
                  ))}
                </div>
              </div>
              <div className="layout-switch" role="tablist" aria-label="Console layout">
                {(Object.keys(layoutLabels) as Layout[]).map((item) => (
                  <button key={item} role="tab" aria-selected={layout === item} className={layout === item ? "active" : ""} onClick={() => switchLayout(item)}>{layoutLabels[item]}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="console-grid">
          <div className="console-bay radar-bay" hidden={layout === "eld"}>
            <div className="bay-label"><span>MODULE 01</span><strong>Road Sentry R7</strong><small>Windshield mount / speed monitor from telemetry</small></div>
            <RadarUnit ref={radarRef} telemetry={telemetry} night={night} onAlert={handleAlert} onStatus={setRadar} />
          </div>
          <div className="console-bay eld-bay" hidden={layout === "radar"}>
            <div className="bay-label"><span>MODULE 02</span><strong>Fleet Guard FG-482</strong><small>Dash mount / SCS telemetry link</small></div>
            <EldDevice radar={radar} radarEvents={events} telemetry={telemetry} simEvents={simEvents} link={link} source={source} night={night} lightingOverride={lightingOverride} onSource={setSource} onRefuel={refuel} />
          </div>
        </div>

        <div className="demo-note">
          <span>TEST TIP</span>
          <p>
            Sign in to Fleet Guard with driver ID <strong>{drivers.id}</strong> and PIN <strong>{drivers.pin}</strong>, or tap a demo profile. The <strong>ATS lighting</strong> selector follows the simulated game clock automatically (night runs 8 PM to 6 AM); choose <strong>NIGHT</strong> to preview radar dimming and ELD backlit buttons instantly, or <strong>AUTO</strong> to follow the drive. The trip crests Siskiyou Summit, enters California (truck limit drops to 55), and gets a weigh-station bypass; the full run to Los Angeles takes roughly 45 real minutes. The inspection starts empty: open <strong>Inspect</strong> and walk the nine sections. Answer each of the 50 or so questions with Pass, Defect, or N/A, log the gauge and tread readings (or tap <strong>Read from truck</strong>), then press <strong>Validate inspection</strong>. Running ATS with the telemetry server? Open <strong>ATS link</strong> and switch to live.
          </p>
        </div>
      </section>
    </main>
  );
}

export default function App() {
  const [view, setView] = useState<View>(getView);

  useEffect(() => {
    const onHashChange = () => setView(getView());
    const unlock = () => unlockAudio();
    window.addEventListener("hashchange", onHashChange);
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("hashchange", onHashChange);
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  const navigate = useCallback((next: View, scroll = true) => {
    unlockAudio();
    if (next.page === "index") {
      history.pushState(null, "", window.location.pathname + window.location.search);
    } else {
      const hash = next.layout === "split" ? "#console" : `#${next.layout}`;
      if (window.location.hash !== hash) window.location.hash = hash;
    }
    setView(next);
    if (scroll) window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  if (view.page === "console") {
    return <ConsolePage layout={view.layout} setLayout={(layout) => navigate({ page: "console", layout }, false)} back={() => navigate({ page: "index" })} />;
  }
  return <IndexPage open={(layout) => navigate({ page: "console", layout })} />;
}
