import { useCallback, useEffect, useRef, useState } from "react";

/* American Truck Simulator drive simulation + optional live telemetry link.
 * The simulated drive follows I-5 South from Portland, OR to Los Angeles, CA at the
 * game's default 19x time scale. Live mode polls the ETS2/ATS Telemetry Server
 * (Funbit) at localhost:25555 and maps its JSON onto the same telemetry shape. */

export const TIME_SCALE = 19;
export const TELEMETRY_URL = "http://localhost:25555/api/ets2/telemetry";

export type UsState = "OR" | "CA";
export type StopKind = "city" | "landmark" | "border" | "station";
export type RouteStop = { mile: number; name: string; short: string; state: UsState; kind: StopKind };
export type GameTime = { day: number; minutes: number };
export type TelemetrySource = "sim" | "live";
export type LinkStatus = "sim" | "connecting" | "live" | "error";
export type LinkInfo = { status: LinkStatus; message: string; source: TelemetrySource };
export type SimEventKind = "summit" | "border" | "weigh" | "fuel" | "rest" | "delivered" | "refuel";
export type SimEvent = { id: number; kind: SimEventKind; title: string; body: string; tone: "info" | "warning" | "success"; gameTime: GameTime; speak?: string };

export type Telemetry = {
  live: boolean;
  gameName: string;
  paused: boolean;
  gameTime: GameTime;
  timeScale: number;
  speedMph: number;
  speedLimitMph: number;
  cruiseOn: boolean;
  cruiseMph: number;
  rpm: number;
  gear: number;
  gears: number;
  retarder: boolean;
  grade: string | null;
  fuelGal: number;
  airPsi: number;
  oilPsi: number;
  coolantF: number;
  fuelCapacityGal: number;
  mpg: number;
  odometerMi: number;
  tripMi: number;
  mile: number;
  distanceRemainingMi: number;
  etaMinutes: number;
  truck: { make: string; model: string };
  trailer: { attached: boolean; name: string; massLb: number };
  job: { sourceCity: string; sourceCompany: string; destinationCity: string; destinationCompany: string; cargo: string; income: number; deadline: GameTime; remainingMinutes: number };
  location: { state: string; road: string; near: string; nextStop: string; milesToNext: number };
  hos: { drivingToday: number; onDutyToday: number; driveLeft: number; windowLeft: number; breakDue: number; cycleLeft: number; nextRest: number };
  delivered: boolean;
};

export const ROUTE: RouteStop[] = [
  { mile: 0, name: "Portland, OR", short: "Portland", state: "OR", kind: "city" },
  { mile: 47, name: "Salem, OR", short: "Salem", state: "OR", kind: "city" },
  { mile: 110, name: "Eugene, OR", short: "Eugene", state: "OR", kind: "city" },
  { mile: 273, name: "Medford, OR", short: "Medford", state: "OR", kind: "city" },
  { mile: 297, name: "Siskiyou Summit", short: "Summit", state: "OR", kind: "landmark" },
  { mile: 300, name: "California state line", short: "CA line", state: "CA", kind: "border" },
  { mile: 304, name: "Hornbrook inspection station", short: "Scale", state: "CA", kind: "station" },
  { mile: 420, name: "Redding, CA", short: "Redding", state: "CA", kind: "city" },
  { mile: 580, name: "Sacramento, CA", short: "Sacramento", state: "CA", kind: "city" },
  { mile: 628, name: "Stockton, CA", short: "Stockton", state: "CA", kind: "city" },
  { mile: 862, name: "Bakersfield, CA", short: "Bakersfield", state: "CA", kind: "city" },
  { mile: 969, name: "Los Angeles, CA", short: "Los Angeles", state: "CA", kind: "city" },
];

export const JOB = {
  sourceCompany: "Voltison",
  sourceCity: "Portland, OR",
  destinationCompany: "Wallbert",
  destinationCity: "Los Angeles, CA",
  cargo: "Electronics",
  massLb: 28660,
  trailer: "Dry van",
  income: 9870,
  totalMiles: 969,
  deadline: { day: 3, minutes: 9 * 60 + 30 } as GameTime,
};

export const TRUCK = { make: "Peterbilt", model: "389", fuelCapacityGal: 300, gears: 18, mpg: 6.2 };

const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const START: GameTime = { day: 2, minutes: 11 * 60 + 48 };
const START_MILE = 283;
const START_FUEL = 96;
const START_ODOMETER = 284532;
const SHIFT_START = 2 * 1440 + 6 * 60;
const DEPART = 2 * 1440 + 6 * 60 + 30;
const BREAK_END = 2 * 1440 + 8 * 60 + 45;
const KM_TO_MI = 0.621371;
const L_TO_GAL = 0.264172;
const KG_TO_LB = 2.20462;

export const absMinutes = (t: GameTime) => t.day * 1440 + t.minutes;

export function addMinutes(t: GameTime, minutes: number): GameTime {
  const total = ((absMinutes(t) + Math.round(minutes)) % (7 * 1440) + 7 * 1440) % (7 * 1440);
  return { day: Math.floor(total / 1440), minutes: total % 1440 };
}

export function formatGameTime(t: GameTime, clock24: boolean, withDay = true): string {
  const h = Math.floor(t.minutes / 60);
  const m = t.minutes % 60;
  const mm = m.toString().padStart(2, "0");
  const time = clock24 ? `${h.toString().padStart(2, "0")}:${mm}` : `${h % 12 === 0 ? 12 : h % 12}:${mm} ${h < 12 ? "AM" : "PM"}`;
  return withDay ? `${DAYS[t.day]} ${time}` : time;
}

/** ATS-style ambient lighting window, driven by simulated in-game time. */
export function isGameNight(t: GameTime): boolean {
  return t.minutes >= 20 * 60 || t.minutes < 6 * 60;
}

export function formatDuration(minutes: number): string {
  const total = Math.max(0, Math.round(minutes));
  const h = Math.floor(total / 60);
  const m = total % 60;
  return h ? `${h}h ${m.toString().padStart(2, "0")}m` : `${m}m`;
}

export const stateAt = (mile: number): UsState => (mile >= 300 ? "CA" : "OR");
export const limitFor = (state: string): number => (state === "CA" ? 55 : 60);
export const agencyFor = (state: string): string => (state === "CA" ? "CHP" : state === "OR" ? "OSP" : "STATE PATROL");

function hosFor(now: GameTime): Telemetry["hos"] {
  const abs = absMinutes(now);
  const onDuty = Math.max(0, abs - SHIFT_START);
  const driving = Math.max(0, abs - DEPART - 30);
  const sinceBreak = Math.max(0, abs - BREAK_END);
  const drivingAtStart = Math.max(0, absMinutes(START) - DEPART - 30);
  const driveLeft = Math.max(0, 660 - driving);
  return {
    drivingToday: driving,
    onDutyToday: onDuty,
    driveLeft,
    windowLeft: Math.max(0, 840 - onDuty),
    breakDue: Math.max(0, 480 - sinceBreak),
    cycleLeft: Math.max(0, 720 - (driving - drivingAtStart)),
    nextRest: driveLeft,
  };
}

type Profile = { target: number; rpm: number; gear: number; grade: string | null; cruise: boolean; retarder: boolean };

function profile(mile: number, t: number): Profile {
  const limit = limitFor(stateAt(mile));
  const wobble = Math.sin(t / 6) * 1.2 + Math.sin(t / 2.3) * 0.4;
  if (mile >= 285 && mile < 297) return { target: 44 + wobble, rpm: 1560, gear: 9, grade: "SISKIYOU SUMMIT / 6% CLIMB", cruise: false, retarder: false };
  if (mile >= 297 && mile < 308) return { target: 50 + wobble, rpm: 1720, gear: 10, grade: "SISKIYOU GRADE / 6% DESCENT", cruise: false, retarder: true };
  const target = limit - 1 + wobble;
  return { target, rpm: 1180 + (target - 50) * 14, gear: TRUCK.gears, grade: null, cruise: true, retarder: false };
}

type SimState = { t: number; mile: number; speed: number; fuel: number; delivered: boolean; fired: Set<SimEventKind> };

const gameNow = (s: SimState): GameTime => addMinutes(START, (s.t * TIME_SCALE) / 60);

function locationFor(mile: number): Telemetry["location"] {
  const state = stateAt(mile);
  const passed = ROUTE.filter((stop) => stop.mile <= mile && stop.kind === "city");
  const upcoming = ROUTE.find((stop) => stop.mile > mile && stop.kind === "city") ?? ROUTE[ROUTE.length - 1];
  const last = passed[passed.length - 1] ?? ROUTE[0];
  const near = mile - last.mile < 6 ? last.name : `${Math.round(mile - last.mile)} mi south of ${last.short}`;
  return { state, road: "I-5 S", near, nextStop: upcoming.short, milesToNext: Math.max(0, Math.round(upcoming.mile - mile)) };
}

export function computeTelemetry(s: SimState): Telemetry {
  const now = gameNow(s);
  const p = profile(s.mile, s.t);
  const state = stateAt(s.mile);
  const limit = limitFor(state);
  const remaining = Math.max(0, JOB.totalMiles - s.mile);
  const cruiseMph = limit - 1;
  const speed = s.delivered ? 0 : s.speed;
  return {
    live: false,
    gameName: "ATS",
    paused: false,
    gameTime: now,
    timeScale: TIME_SCALE,
    speedMph: speed,
    speedLimitMph: limit,
    cruiseOn: p.cruise && !s.delivered,
    cruiseMph,
    rpm: s.delivered ? 650 : Math.round(p.rpm + Math.sin(s.t / 1.7) * 18),
    gear: s.delivered ? 0 : p.gear,
    gears: TRUCK.gears,
    retarder: p.retarder && !s.delivered,
    grade: s.delivered ? null : p.grade,
    fuelGal: s.fuel,
    airPsi: Math.round(s.delivered ? 122 : 117 + Math.sin(s.t / 7) * 6),
    oilPsi: Math.round(s.delivered ? 28 : 44 + Math.sin(s.t / 5) * 3 + (p.grade ? 4 : 0)),
    coolantF: Math.round(186 + (p.grade && !s.delivered ? 9 : 0) + Math.sin(s.t / 20) * 3),
    fuelCapacityGal: TRUCK.fuelCapacityGal,
    mpg: TRUCK.mpg,
    odometerMi: START_ODOMETER + (s.mile - START_MILE),
    tripMi: s.mile,
    mile: s.mile,
    distanceRemainingMi: remaining,
    etaMinutes: (remaining / 54) * 60,
    truck: { make: TRUCK.make, model: TRUCK.model },
    trailer: { attached: !s.delivered, name: JOB.trailer, massLb: JOB.massLb },
    job: { ...JOB, remainingMinutes: Math.max(0, absMinutes(JOB.deadline) - absMinutes(now)) },
    location: s.delivered ? { state: "CA", road: "Wallbert yard", near: "Los Angeles, CA", nextStop: "Delivered", milesToNext: 0 } : locationFor(s.mile),
    hos: hosFor(now),
    delivered: s.delivered,
  };
}

function step(s: SimState, dtReal: number): Omit<SimEvent, "id">[] {
  s.t += dtReal;
  const out: Omit<SimEvent, "id">[] = [];
  if (s.delivered) return out;
  const dtHours = (dtReal * TIME_SCALE) / 3600;
  const p = profile(s.mile, s.t);
  s.speed += (p.target - s.speed) * 0.25;
  s.mile += s.speed * dtHours;
  s.fuel = Math.max(0, s.fuel - (s.speed * dtHours) / TRUCK.mpg);
  const now = gameNow(s);
  const fire = (kind: SimEventKind, event: Omit<SimEvent, "id" | "kind" | "gameTime">) => {
    if (s.fired.has(kind)) return;
    s.fired.add(kind);
    out.push({ kind, gameTime: now, ...event });
  };
  if (s.mile >= 297) fire("summit", { tone: "info", title: "Siskiyou Summit / 4,310 ft", body: "Cresting the highest point on I-5. Six percent descent ahead: engine brake engaged, watch your speed into California." });
  if (s.mile >= 300) fire("border", { tone: "warning", title: "Welcome to California", body: "Truck speed limit drops to 55 MPH statewide. Road Sentry limit updated; CHP patrols this grade.", speak: "Entering California. Truck speed limit fifty five." });
  if (s.mile >= 302) fire("weigh", { tone: "success", title: "Weigh station ahead / BYPASS", body: "Hornbrook inspection station: your transponder was cleared. You may bypass the scale.", speak: "Weigh station ahead. You may bypass." });
  if (s.fuel <= TRUCK.fuelCapacityGal * 0.15) fire("fuel", { tone: "warning", title: "Low fuel", body: `${Math.round(s.fuel)} gallons left. Nearest Gallon station: ${locationFor(s.mile).nextStop}, ${locationFor(s.mile).milesToNext} mi ahead.`, speak: "Low fuel warning." });
  if (hosFor(now).driveLeft <= 0) fire("rest", { tone: "warning", title: "Rest required", body: "Your in-game fatigue limit has been reached. Pull into the next rest area, truck stop, or garage to sleep.", speak: "Rest required. Find a rest area." });
  if (s.mile >= JOB.totalMiles) {
    s.mile = JOB.totalMiles;
    s.delivered = true;
    fire("delivered", { tone: "success", title: "Job delivered", body: `Electronics delivered to Wallbert, Los Angeles. $${JOB.income.toLocaleString()} paid to Dowe Freight Lines.`, speak: "Delivery complete. Nice driving." });
  }
  return out;
}

const num = (value: unknown, fallback: number) => (typeof value === "number" && Number.isFinite(value) ? value : fallback);
const str = (value: unknown, fallback: string) => (typeof value === "string" && value.trim() ? value : fallback);
const EPOCH = Date.parse("0001-01-01T00:00:00Z");

function isoMinutes(iso: unknown): number | null {
  if (typeof iso !== "string") return null;
  const ms = Date.parse(iso);
  return Number.isNaN(ms) ? null : Math.round((ms - EPOCH) / 60000);
}

function isoGameTime(iso: unknown, fallback: GameTime): GameTime {
  const total = isoMinutes(iso);
  if (total === null) return fallback;
  const wrapped = ((total % (7 * 1440)) + 7 * 1440) % (7 * 1440);
  return { day: Math.floor(wrapped / 1440), minutes: wrapped % 1440 };
}

type LiveJson = { game?: Record<string, unknown>; truck?: Record<string, unknown>; trailer?: Record<string, unknown>; job?: Record<string, unknown>; navigation?: Record<string, unknown> };

export function mapLive(json: LiveJson, base: Telemetry): Telemetry {
  const g = json.game ?? {};
  const t = json.truck ?? {};
  const tr = json.trailer ?? {};
  const j = json.job ?? {};
  const nav = json.navigation ?? {};
  const now = isoGameTime(g.time, base.gameTime);
  const limitKmh = num(nav.speedLimit, 0);
  const remainingMi = num(nav.estimatedDistance, 0) / 1609.344;
  const nextRest = isoMinutes(g.nextRestStopTime) ?? base.hos.nextRest;
  const deadline = isoGameTime(j.deadlineTime, base.job.deadline);
  const remainingJob = isoMinutes(j.remainingTime) ?? base.job.remainingMinutes;
  const massLb = num(tr.mass, 0) * KG_TO_LB;
  return {
    ...base,
    live: true,
    gameName: str(g.gameName, "ATS"),
    paused: Boolean(g.paused),
    gameTime: now,
    timeScale: num(g.timeScale, TIME_SCALE),
    speedMph: Math.abs(num(t.speed, 0)) * KM_TO_MI,
    speedLimitMph: limitKmh > 0 ? Math.round(limitKmh * KM_TO_MI) : base.speedLimitMph,
    cruiseOn: Boolean(t.cruiseControlOn),
    cruiseMph: Math.round(num(t.cruiseControlSpeed, 0) * KM_TO_MI),
    rpm: Math.round(num(t.engineRpm, 0)),
    gear: num(t.displayedGear, num(t.gear, 0)),
    gears: num(t.forwardGears, base.gears),
    retarder: num(t.retarderBrake, 0) > 0,
    grade: null,
    fuelGal: num(t.fuel, 0) * L_TO_GAL,
    airPsi: Math.round(num(t.airPressure, base.airPsi)),
    oilPsi: Math.round(num(t.oilPressure, base.oilPsi)),
    coolantF: Math.round(typeof t.waterTemperature === "number" && Number.isFinite(t.waterTemperature) ? t.waterTemperature * 1.8 + 32 : base.coolantF),
    fuelCapacityGal: Math.max(1, num(t.fuelCapacity, 0) * L_TO_GAL),
    mpg: num(t.fuelAverageConsumption, 0) > 0 ? 1 / (num(t.fuelAverageConsumption, 0) * L_TO_GAL / KM_TO_MI) : base.mpg,
    odometerMi: num(t.odometer, 0) * KM_TO_MI,
    distanceRemainingMi: remainingMi,
    etaMinutes: isoMinutes(nav.estimatedTime) ?? base.etaMinutes,
    truck: { make: str(t.make, base.truck.make), model: str(t.model, base.truck.model) },
    trailer: { attached: Boolean(tr.attached), name: str(tr.name, "Trailer"), massLb },
    job: {
      ...base.job,
      sourceCity: str(j.sourceCity, "No job"),
      sourceCompany: str(j.sourceCompany, ""),
      destinationCity: str(j.destinationCity, ""),
      destinationCompany: str(j.destinationCompany, ""),
      cargo: str(tr.name, base.job.cargo),
      income: num(j.income, 0),
      deadline,
      remainingMinutes: remainingJob,
    },
    location: { state: "LIVE", road: "ATS telemetry", near: str(j.sourceCity, "Unknown"), nextStop: str(j.destinationCity, "Unknown"), milesToNext: Math.round(remainingMi) },
    hos: { ...base.hos, nextRest, driveLeft: nextRest },
    delivered: false,
  };
}

export function useAtsSim() {
  const stateRef = useRef<SimState>({ t: 0, mile: START_MILE, speed: 46, fuel: START_FUEL, delivered: false, fired: new Set() });
  const liveRef = useRef<Telemetry | null>(null);
  const eventId = useRef(0);
  const [telemetry, setTelemetry] = useState<Telemetry>(() => computeTelemetry(stateRef.current));
  const [events, setEvents] = useState<SimEvent[]>([]);
  const [source, setSource] = useState<TelemetrySource>("sim");
  const [link, setLink] = useState<LinkInfo>({ status: "sim", message: "Simulated drive / I-5 South / 19x game time", source: "sim" });

  useEffect(() => {
    const id = window.setInterval(() => {
      const fresh = step(stateRef.current, 1);
      if (!liveRef.current) setTelemetry(computeTelemetry(stateRef.current));
      if (fresh.length) setEvents((list) => [...list, ...fresh.map((event) => ({ ...event, id: ++eventId.current }))]);
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (source !== "live") {
      liveRef.current = null;
      setLink({ status: "sim", message: "Simulated drive / I-5 South / 19x game time", source: "sim" });
      setTelemetry(computeTelemetry(stateRef.current));
      return;
    }
    let cancelled = false;
    setLink({ status: "connecting", message: `Looking for the ATS telemetry server at ${TELEMETRY_URL}`, source: "live" });
    const poll = async () => {
      try {
        const response = await fetch(TELEMETRY_URL, { cache: "no-store", signal: AbortSignal.timeout(1500) });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const json = (await response.json()) as LiveJson;
        if (cancelled) return;
        const mapped = mapLive(json, computeTelemetry(stateRef.current));
        liveRef.current = mapped;
        setTelemetry(mapped);
        const connected = Boolean(json.game?.connected);
        setLink({
          status: "live",
          message: connected ? `Live / ${str(json.game?.gameName, "ATS")} ${str(json.game?.version, "")} / plugin v${str(String(json.game?.telemetryPluginVersion ?? ""), "?")}`.replace(/\s+/g, " ").trim() : "Telemetry server found / waiting for American Truck Simulator to start",
          source: "live",
        });
      } catch {
        if (cancelled) return;
        liveRef.current = null;
        setLink({ status: "error", message: "No telemetry server answered on localhost:25555. Showing the simulated drive until one is found.", source: "live" });
      }
    };
    void poll();
    const id = window.setInterval(() => void poll(), 2000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
      liveRef.current = null;
    };
  }, [source]);

  const refuel = useCallback(() => {
    const s = stateRef.current;
    const added = TRUCK.fuelCapacityGal - s.fuel;
    if (added < 0.5) return 0;
    s.fuel = TRUCK.fuelCapacityGal;
    s.fired.delete("fuel");
    setTelemetry(liveRef.current ?? computeTelemetry(s));
    setEvents((list) => [...list, { id: ++eventId.current, kind: "refuel", tone: "info", gameTime: gameNow(s), title: "Fuel stop logged", body: `${added.toFixed(1)} gal at Gallon, ${locationFor(s.mile).nextStop}. Tank full at ${TRUCK.fuelCapacityGal} gal.` }]);
    return added;
  }, []);

  return { telemetry, events, link, source, setSource, refuel };
}
