/* Pre-trip inspection (DVIR) content and helpers for Fleet Guard.
 * The walkaround follows a driver's natural route around a combination vehicle:
 * climb in and start up, check the engine bay, walk the lights and tires, test the brakes,
 * then couple up, verify the load, and confirm emergency gear and paperwork. */

export type Severity = "minor" | "major";
export type Result = "pass" | "defect" | "na";
export type Answer = { result: Result; severity?: Severity; tags?: string[]; note?: string; value?: number | string };
export type Answers = Record<string, Answer>;
export type InspectionState = { status: "pending" | "failed" | "validated"; missing: string[]; validatedAt: string | null };

/** Truck readings the ELD can fill in for the driver. */
export type ReadingSource = "air" | "oil" | "coolant" | "cargo";
export type Readings = Record<ReadingSource, number>;

type Base = { id: string; text: string; hint: string; crit?: boolean };
export type CheckQuestion = Base & { kind: "check"; na?: string };
export type MeasureQuestion = Base & { kind: "measure"; unit: string; min: number; max: number; step: number; start: number; fail: Severity; source?: ReadingSource };
export type TextQuestion = Base & { kind: "text"; placeholder: string; label: string; minLength: number };
export type Question = CheckQuestion | MeasureQuestion | TextQuestion;
export type InspectionSection = { id: string; title: string; note: string; chips: string[]; questions: Question[] };

export const inspectionSections: InspectionSection[] = [
  {
    id: "cab",
    title: "Cab and gauges",
    note: "Climb in and start the engine",
    chips: ["Warning lamp stays on", "Inoperative", "Loose", "Worn"],
    questions: [
      { id: "cab-1", kind: "check", text: "Engine starts and idles smoothly", hint: "No hard cranking, knocking, or heavy smoke at start-up." },
      { id: "cab-2", kind: "check", crit: true, text: "Dash warning lamps clear after start-up", hint: "Check-engine, ABS, and oil-pressure lamps should go out within a few seconds." },
      { id: "cab-3", kind: "measure", crit: true, text: "Air pressure builds and holds", hint: "Read the primary air gauge. The governor should cut out near 120 to 125 PSI.", unit: "PSI", min: 100, max: 130, step: 1, start: 110, fail: "major", source: "air" },
      { id: "cab-4", kind: "check", crit: true, text: "Steering wheel play is within limits", hint: "No more than about 10 degrees of free play, roughly 2 inches on a 20-inch wheel." },
      { id: "cab-5", kind: "check", text: "Horn, wipers, and washers work", hint: "Sound the horn and run the wipers on low and high with washer fluid." },
     //{ id: "cab-6", kind: "check", text: "Seat belt latches and the seat locks in place", hint: "Belt retracts cleanly, buckle clicks, seat does not slide under braking." },
    ],
  },
  {
    id: "engine",
    title: "Engine and fluids",
    note: "Pop the hood and look underneath",
    chips: ["Low level", "Leaking", "Cracked", "Frayed"],
    questions: [
      { id: "engine-1", kind: "measure", crit: true, text: "Oil pressure at idle", hint: "Read the oil-pressure gauge once the engine has settled.", unit: "PSI", min: 25, max: 80, step: 1, start: 40, fail: "major", source: "oil" },
      { id: "engine-2", kind: "measure", text: "Coolant temperature is normal", hint: "Needle should sit near the middle of the gauge after warm-up.", unit: "°F", min: 160, max: 210, step: 1, start: 190, fail: "major", source: "coolant" },
      { id: "engine-3", kind: "measure", text: "Battery voltage with the engine running", hint: "Measure at the dash gauge or battery box. Expect around 13.5 to 14.5 V.", unit: "V", min: 12.4, max: 14.8, step: 0.1, start: 13.5, fail: "minor" },
      { id: "engine-4", kind: "check", text: "Low idle is within normal range", hint: "Rev the engine to 5 or 6 RPMs and then see if it goes back to idling normally" },
      //{ id: "engine-1", kind: "check", text: "Engine oil level is in range", hint: "Dipstick reads between ADD and FULL with the engine off and level." },
      //{ id: "engine-2", kind: "measure", crit: true, text: "Oil pressure at idle", hint: "Read the oil-pressure gauge once the engine has settled.", unit: "PSI", min: 25, max: 80, step: 1, start: 40, fail: "major", source: "oil" },
      //{ id: "engine-3", kind: "measure", text: "Coolant temperature is normal", hint: "Needle should sit near the middle of the gauge after warm-up.", unit: "°F", min: 160, max: 210, step: 1, start: 190, fail: "major", source: "coolant" },
      //{ id: "engine-4", kind: "check", text: "Coolant level is correct with no leaks", hint: "Overflow tank between MIN and MAX. Look for drips at hoses and the radiator." },
      //{ id: "engine-5", kind: "measure", text: "Battery voltage with the engine running", hint: "Measure at the dash gauge or battery box. Expect around 13.5 to 14.5 V.", unit: "V", min: 12.4, max: 14.8, step: 0.1, start: 13.5, fail: "minor" },
      //{ id: "engine-6", kind: "check", text: "Belts and hoses are in good shape", hint: "No fraying, glazing, cracking, or loose tension." },
      //{ id: "engine-7", kind: "check", text: "No fluid leaks under the truck", hint: "Check the ground beneath the engine, transmission, and axles." },
    ],
  },
  {
    id: "lights",
    title: "Exterior lights",
    note: "Walk the truck and trailer",
    chips: ["Burned out", "Cracked lens", "Flickering", "Missing"],
    questions: [
      { id: "lights-1", kind: "check", crit: true, text: "Headlights work on low and high beam", hint: "Cycle through both beams and flash to pass." },
      { id: "lights-2", kind: "check", text: "Turn signals and hazards work front and rear", hint: "Run left, right, and four-way flashers and walk the length of the rig." },
      { id: "lights-3", kind: "check", crit: true, text: "Brake lights and tail lights work", hint: "Ask a partner to watch, or back up to a reflective wall." },
      { id: "lights-4", kind: "check", text: "Marker and clearance lights are lit", hint: "Amber on the front and sides, red at the rear, with lenses intact." },
      { id: "lights-5", kind: "check", text: "Reflective tape and reflectors are intact", hint: "Red and white conspicuity tape along the trailer sides and rear." },
      //{ id: "lights-6", kind: "check", text: "Trailer ABS lamp and lights respond", hint: "The trailer ABS indicator should light briefly at ignition and go out." },
    ],
  },
  {
    id: "tires",
    title: "Tires and wheels",
    note: "Measure tread and check every wheel",
    chips: ["Cut or bulge", "Low tread", "Under-inflated", "Missing lug nut"],
    questions: [
      { id: "tires-1", kind: "measure", crit: true, text: "Steer tire tread depth", hint: "Use a tread gauge in a major groove. Steer tires need at least 4/32 inch.", unit: "/32 in", min: 4, max: 32, step: 1, start: 8, fail: "major"},
      { id: "tires-2", kind: "measure", text: "Drive tire tread depth", hint: "Drive and trailer tires need at least 2/32 inch in a major groove.", unit: "/32 in", min: 2, max: 32, step: 1, start: 8, fail: "major"},
      //{ id: "tires-3", kind: "check", text: "Inflation looks correct on every tire", hint: "Thump or gauge the tires. Look for any that sit visibly low." },
      //{ id: "tires-4", kind: "check", crit: true, text: "No cuts, bulges, or sidewall damage", hint: "Inspect the sidewalls and tread face, including the inside duals." },
      //{ id: "tires-5", kind: "check", crit: true, text: "Lug nuts are tight with no rust trails", hint: "Missing nuts or streaks pointing away from a stud mean a loose wheel." },
      //{ id: "tires-6", kind: "check", text: "Valve stems and caps are present", hint: "Caps on, stems straight, no leaks at the base." },
    ],
  },
  {
    id: "brakes",
    title: "Service brakes",
    note: "Air brake system tests",
    chips: ["Air leak", "Out of adjustment", "Chafed hose", "Cracked drum"],
    questions: [
      { id: "brakes-1", kind: "measure", crit: true, text: "Air leak-down test", hint: "Engine off, service brake released, 1 minute. A combination vehicle may lose at most 4 PSI.", unit: "PSI drop", min: 0, max: 4, step: 1, start: 2, fail: "major" },
      { id: "brakes-2", kind: "check", crit: true, text: "Low-air warning triggers before 60 PSI", hint: "Pump the pedal down. The buzzer and light must come on above 55 PSI." },
      { id: "brakes-3", kind: "check", crit: true, text: "Parking brake holds on a tug test", hint: "Set the brake, put the truck in gear, and gently try to pull away." },
      { id: "brakes-4", kind: "check", text: "Brake chambers and pushrod travel look right", hint: "Pushrod stroke inside the adjustment limit and no hissing at the chambers." },
      { id: "brakes-5", kind: "check", text: "Air lines and hoses are secure", hint: "No chafing, cuts, bulges, or leaks along the frame." },
      { id: "brakes-6", kind: "check", text: "Brake drums and linings look sound", hint: "No cracks, oil contamination, or worn-through lining." },
    ],
  },
  {
    id: "mirrors",
    title: "Mirrors and glass",
    note: "Visibility check from the seat",
    chips: ["Cracked", "Loose mount", "Dirty or fogged", "Missing"],
    questions: [
      { id: "mirrors-1", kind: "check", text: "Mirrors are clean, aligned, and secure", hint: "Adjust both mains and spot mirrors so you can see along the trailer." },
      { id: "mirrors-2", kind: "check", crit: true, text: "Windshield has no cracks in the driver's view", hint: "Cracks or damage in the swept area in front of the driver are not allowed." },
      { id: "mirrors-3", kind: "check", text: "Side and rear windows are clear", hint: "No obstructive stickers, film, or damage." },
      { id: "mirrors-4", kind: "check", text: "Convex and spot mirrors cover the blind spots", hint: "Check right-front and along the passenger side." },
      { id: "mirrors-5", kind: "check", na: "No camera system installed", text: "Backup camera display works", hint: "Power up the display and confirm a clear picture." },
    ],
  },
  {
    id: "trailer",
    title: "Trailer connection",
    note: "Coupling and landing gear",
    chips: ["Not locked", "Air leak", "Frayed cord", "Bent or damaged"],
    questions: [
      { id: "trailer-1", kind: "check", crit: true, text: "Fifth wheel is locked, confirmed by a tug test", hint: "Release the trailer brake, pull ahead gently, and confirm it holds." },
      { id: "trailer-2", kind: "check", crit: true, text: "Kingpin and locking jaws are seated", hint: "No gap between the trailer apron and the fifth wheel plate." },
      { id: "trailer-3", kind: "check", crit: true, text: "Gladhands are sealed and air lines are routed", hint: "Seals in place, lines not twisted, resting clear of the tires and drive shaft." },
      { id: "trailer-4", kind: "check", text: "Seven-way electrical cord is secure", hint: "Plug seated, spring intact, cable not chafing." },
      { id: "trailer-5", kind: "check", text: "Landing gear is fully raised and the crank is stowed", hint: "Legs all the way up with the handle secured." },
      { id: "trailer-6", kind: "check", na: "Fixed-axle trailer", text: "Sliding tandems are pinned and locked", hint: "All locking pins fully extended and the release arm latched." },
    ],
  },
  {
    id: "cargo",
    title: "Cargo securement",
    note: "Paperwork and load",
    chips: ["Shifted load", "Damaged cargo", "Door will not latch", "Overweight"],
    questions: [
      { id: "cargo-1", kind: "check", text: "Trailer doors are closed and latched", hint: "Both cam bars fully engaged with the handles locked." },
      { id: "cargo-2", kind: "text", crit: true, text: "Seal is intact and matches the bill of lading", hint: "Compare the seal on the door with the paperwork from Voltison, Portland.", label: "Seal number on the door", placeholder: "e.g. VT-448201", minLength: 6 },
      { id: "cargo-3", kind: "measure", crit: true, text: "Cargo weight is within the legal limit", hint: "Keep the payload under 45,000 lb so the gross weight stays below 80,000 lb.", unit: "lb", min: 0, max: 45000, step: 100, start: 28000, fail: "major", source: "cargo" },
      { id: "cargo-4", kind: "check", na: "Floor-loaded or single item", text: "Load is blocked and braced against shifting", hint: "Pallets are snug against the bulkhead with no gaps that allow movement." },
      { id: "cargo-5", kind: "check", na: "Not used on a dry van", text: "Straps, chains, and tarps are secure", hint: "Count the tie-downs and check ratchets, edge protectors, and tarp anchors." },
    ],
  },
  {
    id: "safety",
    title: "Safety equipment and papers",
    note: "Emergency gear and documents",
    chips: ["Missing", "Expired", "Discharged", "Damaged"],
    questions: [
      //{ id: "safety-1", kind: "check", crit: true, text: "Fire extinguisher is charged and mounted", hint: "Gauge in the green zone, pin intact, rated 10 lb B:C or better." },
      //{ id: "safety-2", kind: "check", crit: true, text: "Three warning triangles are on board", hint: "Reflective triangles in good shape and stowed within reach." },
      //{ id: "safety-3", kind: "check", text: "Spare fuses and a first-aid kit are present", hint: "Fuse kit sized for the truck, and a kit with in-date supplies." },
      //{ id: "safety-4", kind: "check", text: "Wheel chocks are on board", hint: "At least one set in the cab or toolbox." },
      { id: "safety-1", kind: "check", text: "Registration, insurance, and permits are on board", hint: "Current papers for the tractor and the trailer." },
      { id: "safety-2", kind: "check", text: "ELD instruction sheet and malfunction forms are in the cab", hint: "Required alongside at least 8 days of blank log pages." },
    ],
  },
];

export const allQuestions: Question[] = inspectionSections.flatMap((section) => section.questions);
export const totalQuestions = allQuestions.length;

export const sectionOf = (questionId: string): InspectionSection | undefined => inspectionSections.find((section) => section.questions.some((question) => question.id === questionId));

export function questionIndex(section: InspectionSection, question: Question): string {
  return `${inspectionSections.indexOf(section) + 1}.${section.questions.indexOf(question) + 1}`;
}

export const defaultSeverity = (question: Question): Severity => (question.kind === "measure" ? question.fail : question.crit ? "major" : "minor");

export const countAnswered = (answers: Answers): number => allQuestions.filter((question) => answers[question.id]).length;

export function countDefects(answers: Answers): { minor: number; major: number; total: number } {
  let minor = 0;
  let major = 0;
  for (const question of allQuestions) {
    const answer = answers[question.id];
    if (answer?.result !== "defect") continue;
    if ((answer.severity ?? defaultSeverity(question)) === "major") major += 1;
    else minor += 1;
  }
  return { minor, major, total: minor + major };
}

export type DefectEntry = { question: Question; section: InspectionSection; answer: Answer; severity: Severity };

export function defectList(answers: Answers): DefectEntry[] {
  const out: DefectEntry[] = [];
  for (const section of inspectionSections) {
    for (const question of section.questions) {
      const answer = answers[question.id];
      if (answer?.result === "defect") out.push({ question, section, answer, severity: answer.severity ?? defaultSeverity(question) });
    }
  }
  return out;
}

export type SectionStats = { total: number; answered: number; defects: number; major: number };

export function sectionStats(section: InspectionSection, answers: Answers): SectionStats {
  let answered = 0;
  let defects = 0;
  let major = 0;
  for (const question of section.questions) {
    const answer = answers[question.id];
    if (!answer) continue;
    answered += 1;
    if (answer.result === "defect") {
      defects += 1;
      if ((answer.severity ?? defaultSeverity(question)) === "major") major += 1;
    }
  }
  return { total: section.questions.length, answered, defects, major };
}

export const formatReading = (question: MeasureQuestion, value: number): string => {
  const text = question.step < 1 ? value.toFixed(1) : Math.round(value).toLocaleString();
  return `${text} ${question.unit}`;
};

export const passRange = (question: MeasureQuestion): string => `${question.min.toLocaleString()} to ${question.max.toLocaleString()} ${question.unit}`;
