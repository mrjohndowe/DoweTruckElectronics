import { useEffect, useRef, useState } from "react";
import { sfx } from "../audio";
import {
  allQuestions,
  countAnswered,
  countDefects,
  defaultSeverity,
  defectList,
  formatReading,
  inspectionSections,
  passRange,
  questionIndex,
  sectionStats,
  totalQuestions,
  type Answer,
  type Answers,
  type CheckQuestion,
  type InspectionSection,
  type InspectionState,
  type MeasureQuestion,
  type Question,
  type Readings,
  type Result,
  type Severity,
  type TextQuestion,
} from "../inspection";

type Entry = [string, Answer | null];
type Filter = "all" | "todo" | "defects";

type Props = {
  answers: Answers;
  inspection: InspectionState;
  readings: Readings;
  driverName: string;
  truckLabel: string;
  onChange: (entries: Entry[]) => void;
  onValidate: () => string[];
  onRecheck: () => void;
  onReset: () => void;
};

const CheckGlyph = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="m5 12 4 4L19 6" />
  </svg>
);
const CloseGlyph = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);
const LockGlyph = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <rect x="5" y="11" width="14" height="10" rx="1.5" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
);
const ArrowGlyph = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 12h13M14 7l5 5-5 5" />
  </svg>
);

const pad = (n: number) => n.toString().padStart(2, "0");

/** Scroll inside the tablet's own scroll area so the outer page never jumps. */
function scrollInBox(id: string, anchor: "top" | "third" = "top") {
  const el = document.getElementById(id);
  const box = el?.closest(".eld-content") as HTMLElement | null;
  if (!el || !box) return;
  const delta = el.getBoundingClientRect().top - box.getBoundingClientRect().top;
  const offset = anchor === "top" ? 12 : box.clientHeight / 3;
  box.scrollTo({ top: box.scrollTop + delta - offset, behavior: "smooth" });
}

function clampStep(question: MeasureQuestion, value: number): number {
  const hi = Math.max(question.max * 1.6, question.max + question.step * 10);
  const bounded = Math.min(hi, Math.max(0, value));
  const decimals = question.step < 1 ? 1 : 0;
  return Number((Math.round(bounded / question.step) * question.step).toFixed(decimals));
}

const showNumber = (question: MeasureQuestion, value: number) => (question.step < 1 ? value.toFixed(1) : Math.round(value).toLocaleString());

export default function EldInspection({ answers, inspection, readings, driverName, truckLabel, onChange, onValidate, onRecheck, onReset }: Props) {
  const [openId, setOpenId] = useState<string | null>(() => inspectionSections.find((section) => sectionStats(section, answers).answered < section.questions.length)?.id ?? inspectionSections[0].id);
  const [filter, setFilter] = useState<Filter>("all");
  const [drafts, setDrafts] = useState<Record<string, number | string>>({});
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((timer) => window.clearTimeout(timer));
  }, []);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  const answered = countAnswered(answers);
  const defects = countDefects(answers);
  const passed = allQuestions.filter((question) => answers[question.id]?.result === "pass").length;
  const remaining = totalQuestions - answered;
  const pct = Math.round((answered / totalQuestions) * 100);
  const validated = inspection.status === "validated";
  const failed = inspection.status === "failed";
  const outOfService = validated && defects.major > 0;
  const withDefects = validated && defects.total > 0;

  /** Apply answer changes, and glide to the next unfinished section once a section is complete. */
  const apply = (entries: Entry[], sectionId?: string) => {
    onChange(entries);
    const section = inspectionSections.find((item) => item.id === sectionId);
    if (!section) return;
    const next: Answers = { ...answers };
    for (const [id, answer] of entries) {
      if (answer) next[id] = answer;
      else delete next[id];
    }
    const wasComplete = sectionStats(section, answers).answered === section.questions.length;
    const nowComplete = sectionStats(section, next).answered === section.questions.length;
    if (wasComplete || !nowComplete) return;
    const at = inspectionSections.indexOf(section);
    const order = [...inspectionSections.slice(at + 1), ...inspectionSections.slice(0, at)];
    const after = order.find((item) => sectionStats(item, next).answered < item.questions.length);
    later(() => {
      sfx.confirm();
      if (!after) return;
      setOpenId((current) => (current === section.id ? after.id : current));
      later(() => scrollInBox(`insp-section-${after.id}`), 90);
    }, 650);
  };

  /* ---------- section controls ---------- */

  const clickHead = (id: string) => {
    sfx.tap();
    if (filter !== "all") {
      setFilter("all");
      setOpenId(id);
      return;
    }
    setOpenId((current) => (current === id ? null : id));
  };

  const jump = (id: string) => {
    sfx.tap();
    setFilter("all");
    setOpenId(id);
    later(() => scrollInBox(`insp-section-${id}`), 90);
  };

  const passRemaining = (section: InspectionSection) => {
    const entries: Entry[] = section.questions.filter((question) => question.kind === "check" && !answers[question.id]).map((question) => [question.id, { result: "pass" }]);
    if (!entries.length) return;
    sfx.check(true);
    apply(entries, section.id);
  };

  const clearSection = (section: InspectionSection) => {
    const entries: Entry[] = section.questions.filter((question) => answers[question.id]).map((question) => [question.id, null]);
    if (!entries.length) return;
    sfx.check(false);
    apply(entries, section.id);
  };

  /* ---------- answering ---------- */

  const setCheck = (section: InspectionSection, question: CheckQuestion, result: Result) => {
    if (answers[question.id]?.result === result) {
      sfx.check(false);
      apply([[question.id, null]], section.id);
      return;
    }
    if (result === "pass") sfx.check(true);
    else if (result === "defect") sfx.warning();
    else sfx.tap();
    const entry: Answer = result === "defect" ? { result, severity: defaultSeverity(question), tags: [], note: "" } : { result };
    apply([[question.id, entry]], section.id);
  };

  const patchDefect = (section: InspectionSection, id: string, patch: Partial<Answer>) => {
    const current = answers[id];
    if (!current || current.result !== "defect") return;
    apply([[id, { ...current, ...patch }]], section.id);
  };

  const setSeverity = (section: InspectionSection, id: string, severity: Severity) => {
    sfx.tap();
    patchDefect(section, id, { severity });
  };

  const toggleChip = (section: InspectionSection, id: string, chip: string) => {
    const tags = answers[id]?.tags ?? [];
    sfx.click();
    patchDefect(section, id, { tags: tags.includes(chip) ? tags.filter((tag) => tag !== chip) : [...tags, chip] });
  };

  const draftOf = (question: MeasureQuestion): number => {
    const draft = drafts[question.id];
    if (typeof draft === "number") return draft;
    const saved = answers[question.id]?.value;
    return typeof saved === "number" ? saved : question.start;
  };

  const logMeasure = (section: InspectionSection, question: MeasureQuestion, value: number, quiet = false) => {
    const previous = answers[question.id];
    const ok = value >= question.min && value <= question.max;
    const carry = previous?.result === "defect" ? previous : undefined;
    const entry: Answer = ok ? { result: "pass", value } : { result: "defect", value, severity: carry?.severity ?? question.fail, tags: carry?.tags ?? [], note: carry?.note ?? "" };
    if (!quiet) {
      if (ok) sfx.check(true);
      else sfx.warning();
    }
    apply([[question.id, entry]], section.id);
  };

  const nudge = (section: InspectionSection, question: MeasureQuestion, multiple: number) => {
    const value = clampStep(question, draftOf(question) + multiple * question.step);
    setDrafts((current) => ({ ...current, [question.id]: value }));
    sfx.click();
    if (answers[question.id]) logMeasure(section, question, value, true);
  };

  const readFromTruck = (section: InspectionSection, question: MeasureQuestion) => {
    if (!question.source) return;
    const value = clampStep(question, readings[question.source]);
    setDrafts((current) => ({ ...current, [question.id]: value }));
    logMeasure(section, question, value);
  };

  const clearAnswer = (section: InspectionSection, id: string) => {
    sfx.check(false);
    apply([[id, null]], section.id);
  };

  const sealOf = (question: TextQuestion): string => String(drafts[question.id] ?? answers[question.id]?.value ?? "");

  const logSeal = (section: InspectionSection, question: TextQuestion, matches: boolean) => {
    const value = sealOf(question).trim();
    if (value.length < question.minLength) return;
    if (matches) {
      sfx.check(true);
      apply([[question.id, { result: "pass", value }]], section.id);
    } else {
      sfx.warning();
      apply([[question.id, { result: "defect", value, severity: "major", tags: ["Seal mismatch"], note: "" }]], section.id);
    }
  };

  /* ---------- validation ---------- */

  const validate = () => {
    const missing = onValidate();
    if (missing.length) {
      const first = inspectionSections.find((section) => section.questions.some((question) => missing.includes(question.id)));
      setFilter("all");
      if (first) setOpenId(first.id);
      later(() => scrollInBox(`insp-q-${missing[0]}`, "third"), 140);
    } else {
      later(() => scrollInBox("insp-top"), 120);
    }
  };

  const recheck = () => {
    const first = defectList(answers)[0];
    sfx.tap();
    onRecheck();
    setFilter("all");
    if (first) {
      setOpenId(first.section.id);
      later(() => scrollInBox(`insp-q-${first.question.id}`, "third"), 140);
    }
  };

  const startOver = () => {
    sfx.tap();
    onReset();
    setDrafts({});
    setFilter("all");
    setOpenId(inspectionSections[0].id);
    later(() => scrollInBox("insp-top"), 100);
  };

  /* ---------- rendering ---------- */

  const visible = (question: Question) => filter === "all" || (filter === "todo" ? !answers[question.id] : answers[question.id]?.result === "defect");

  const renderMeasure = (section: InspectionSection, question: MeasureQuestion) => {
    const answer = answers[question.id];
    const value = draftOf(question);
    const big = question.max / question.step > 300;
    return (
      <div className="insp-measure">
        <div className="insp-stepper">
          {big && <button type="button" onClick={() => nudge(section, question, -10)} aria-label={`Decrease ${question.text} by ${10 * question.step}`}>«</button>}
          <button type="button" onClick={() => nudge(section, question, -1)} aria-label={`Decrease ${question.text}`}>−</button>
          <output aria-label={question.text}><strong>{showNumber(question, value)}</strong><small>{question.unit}</small></output>
          <button type="button" onClick={() => nudge(section, question, 1)} aria-label={`Increase ${question.text}`}>+</button>
          {big && <button type="button" onClick={() => nudge(section, question, 10)} aria-label={`Increase ${question.text} by ${10 * question.step}`}>»</button>}
        </div>
        <span className="insp-range">PASS {passRange(question)}</span>
        {question.source && <button type="button" className="insp-tool" onClick={() => readFromTruck(section, question)}>READ FROM TRUCK</button>}
        {answer ? (
          <>
            <span className={`insp-status ${answer.result}`}>{answer.result === "pass" ? "IN RANGE" : "OUT OF RANGE"}</span>
            <button type="button" className="insp-clear" onClick={() => clearAnswer(section, question.id)}>CLEAR</button>
          </>
        ) : (
          <button type="button" className="insp-log" onClick={() => logMeasure(section, question, value)}>LOG READING</button>
        )}
      </div>
    );
  };

  const renderText = (section: InspectionSection, question: TextQuestion) => {
    const answer = answers[question.id];
    const value = sealOf(question);
    const ready = value.trim().length >= question.minLength;
    return (
      <div className="insp-measure insp-text">
        <label className="insp-text-field">
          <span>{question.label.toUpperCase()}</span>
          <input
            value={value}
            placeholder={question.placeholder}
            maxLength={14}
            autoComplete="off"
            spellCheck={false}
            onChange={(event) => setDrafts((current) => ({ ...current, [question.id]: event.target.value.toUpperCase() }))}
          />
        </label>
        {answer ? (
          <>
            <span className={`insp-status ${answer.result}`}>{answer.result === "pass" ? "MATCHES BOL" : "MISMATCH"}</span>
            <button type="button" className="insp-clear" onClick={() => clearAnswer(section, question.id)}>CLEAR</button>
          </>
        ) : (
          <div className="insp-answer">
            <button type="button" className="pass" disabled={!ready} onClick={() => logSeal(section, question, true)}>MATCHES BOL</button>
            <button type="button" className="defect" disabled={!ready} onClick={() => logSeal(section, question, false)}>MISMATCH</button>
          </div>
        )}
        {!answer && !ready && <span className="insp-range">Enter at least {question.minLength} characters</span>}
      </div>
    );
  };

  const renderDefect = (section: InspectionSection, question: Question, answer: Answer) => {
    const severity = answer.severity ?? defaultSeverity(question);
    const tags = answer.tags ?? [];
    const reading =
      question.kind === "measure" && typeof answer.value === "number" ? ` / READING ${formatReading(question, answer.value).toUpperCase()}` : question.kind === "text" && answer.value ? ` / SEAL ${String(answer.value)}` : "";
    return (
      <div className="insp-defect">
        <div className="insp-defect-top">
          <span>DEFECT REPORT{reading}</span>
          <div className="insp-sev" role="group" aria-label="Defect severity">
            <button type="button" className={severity === "minor" ? "on minor" : ""} aria-pressed={severity === "minor"} onClick={() => setSeverity(section, question.id, "minor")}>MINOR</button>
            <button type="button" className={severity === "major" ? "on major" : ""} aria-pressed={severity === "major"} onClick={() => setSeverity(section, question.id, "major")}>MAJOR / OUT OF SERVICE</button>
          </div>
        </div>
        <div className="insp-chips">
          {section.chips.map((chip) => (
            <button type="button" key={chip} className={tags.includes(chip) ? "on" : ""} aria-pressed={tags.includes(chip)} onClick={() => toggleChip(section, question.id, chip)}>{chip}</button>
          ))}
        </div>
        <input className="insp-note" value={answer.note ?? ""} maxLength={140} placeholder="Describe the defect for the mechanic (optional)" onChange={(event) => patchDefect(section, question.id, { note: event.target.value })} />
      </div>
    );
  };

  const renderQuestion = (section: InspectionSection, question: Question) => {
    const answer = answers[question.id];
    const result = answer?.result;
    const missing = !answer && failed && inspection.missing.includes(question.id);
    const severity = answer?.result === "defect" ? (answer.severity ?? defaultSeverity(question)) : undefined;
    return (
      <div key={question.id} id={`insp-q-${question.id}`} className={`insp-q ${result ?? ""} ${severity ?? ""} ${missing ? "missing" : ""}`}>
        <div className="insp-q-row">
          <span className="insp-q-idx">{questionIndex(section, question)}</span>
          <div className="insp-q-text">
            <strong>
              {question.text}
              {question.crit && <em>SAFETY CRITICAL</em>}
              {missing && <em className="req">REQUIRED</em>}
            </strong>
            <small>{question.hint}</small>
          </div>
          {question.kind === "check" && (
            <div className="insp-answer" role="group" aria-label={question.text}>
              <button type="button" className={`pass ${result === "pass" ? "on" : ""}`} aria-pressed={result === "pass"} onClick={() => setCheck(section, question, "pass")}>PASS</button>
              <button type="button" className={`defect ${result === "defect" ? "on" : ""}`} aria-pressed={result === "defect"} onClick={() => setCheck(section, question, "defect")}>DEFECT</button>
              {question.na && <button type="button" className={`na ${result === "na" ? "on" : ""}`} aria-pressed={result === "na"} title={question.na} onClick={() => setCheck(section, question, "na")}>N/A</button>}
            </div>
          )}
        </div>
        {question.kind === "measure" && renderMeasure(section, question)}
        {question.kind === "text" && renderText(section, question)}
        {answer?.result === "defect" && renderDefect(section, question, answer)}
        {result === "na" && question.kind === "check" && question.na && <p className="insp-na-note">Marked not applicable: {question.na}.</p>}
      </div>
    );
  };

  const reportItems = defectList(answers);
  const activeSection = filter === "all" ? inspectionSections.find((section) => section.id === openId) : undefined;
  const shownSections = inspectionSections.filter((section) => section.questions.some(visible));

  return (
    <div className="eld-section-screen insp" id="insp-top">
      <div className="eld-section-heading">
        <div><span>DVIR / {truckLabel.toUpperCase()}</span><h2>Vehicle inspection</h2></div>
        {validated ? (
          outOfService ? (
            <strong className="eld-failed">OUT OF SERVICE</strong>
          ) : withDefects ? (
            <strong className="eld-pending">VALIDATED / {defects.minor} MINOR</strong>
          ) : (
            <strong className="eld-compliant"><i /> VALIDATED {inspection.validatedAt}</strong>
          )
        ) : failed ? (
          <strong className="eld-failed">{inspection.missing.length} UNANSWERED</strong>
        ) : (
          <strong className="eld-pending">{answered} / {totalQuestions} ANSWERED</strong>
        )}
      </div>

      {validated && (
        <div className={`insp-report ${outOfService ? "oos" : withDefects ? "minor" : "ok"}`}>
          <div className="insp-report-head">
            <i>{outOfService ? <CloseGlyph /> : <CheckGlyph />}</i>
            <div>
              <strong>{outOfService ? `Vehicle out of service: ${defects.major} major defect${defects.major === 1 ? "" : "s"}` : withDefects ? `Inspection validated with ${defects.minor} minor defect${defects.minor === 1 ? "" : "s"}` : "Inspection validated, no defects reported"}</strong>
              <span>Signed by {driverName} at {inspection.validatedAt} game time / {truckLabel} / {passed} of {totalQuestions} items passed</span>
            </div>
            <b>{outOfService ? "DO NOT DISPATCH" : withDefects ? "REPORT FILED" : "ALL CLEAR"}</b>
          </div>
          {reportItems.length > 0 && (
            <ul className="insp-report-list">
              {reportItems.map((item) => (
                <li key={item.question.id}>
                  <b className={item.severity}>{item.severity === "major" ? "MAJOR" : "MINOR"}</b>
                  <span>
                    <strong>{item.question.text}</strong>
                    <small>
                      {item.section.title}
                      {item.answer.tags?.length ? ` / ${item.answer.tags.join(", ")}` : ""}
                      {item.answer.note ? ` / ${item.answer.note}` : ""}
                    </small>
                  </span>
                </li>
              ))}
            </ul>
          )}
          {outOfService && <p className="insp-report-note">Major defects must be repaired before this truck can be dispatched. After Dowe Service signs off the repair, choose Re-check defects to inspect those items again.</p>}
        </div>
      )}

      <div className={`inspection-progress ${validated && !outOfService ? "done" : ""} ${outOfService ? "bad" : ""}`}><i style={{ width: `${pct}%` }} /></div>

      <div className="insp-summary">
        <div className="insp-stats">
          <div><b>{answered}<small>/{totalQuestions}</small></b><span>ANSWERED</span></div>
          <div className="p"><b>{passed}</b><span>PASS</span></div>
          <div className="m"><b>{defects.minor}</b><span>MINOR</span></div>
          <div className="j"><b>{defects.major}</b><span>MAJOR</span></div>
        </div>
        <div className="insp-filters" role="group" aria-label="Filter questions">
          {([["all", "ALL"], ["todo", `TO DO ${remaining}`], ["defects", `DEFECTS ${defects.total}`]] as [Filter, string][]).map(([key, label]) => (
            <button type="button" key={key} className={filter === key ? "active" : ""} aria-pressed={filter === key} onClick={() => { if (filter !== key) sfx.tap(); setFilter(key); }}>{label}</button>
          ))}
        </div>
      </div>

      <div className="insp-steps" role="group" aria-label="Walkaround route">
        {inspectionSections.map((section, index) => {
          const stats = sectionStats(section, answers);
          const state = stats.defects ? (stats.major ? "major" : "minor") : stats.answered === stats.total ? "done" : stats.answered > 0 ? "partial" : "";
          return (
            <button type="button" key={section.id} className={`${state} ${activeSection?.id === section.id ? "active" : ""}`} title={`${section.title}: ${stats.answered} of ${stats.total}`} aria-label={`${section.title}, ${stats.answered} of ${stats.total} answered`} onClick={() => jump(section.id)}>
              {index + 1}
            </button>
          );
        })}
        <span className="insp-steps-label">{activeSection ? `${activeSection.title} / ${activeSection.note}` : filter === "all" ? "Choose a section" : "Filtered view"}</span>
      </div>

      <div className="insp-sections">
        {shownSections.length === 0 && (
          <p className="eld-empty">{filter === "todo" ? "Every question has an answer. Validate the inspection to sign the DVIR." : "No defects recorded so far. Anything marked as a defect will be listed here."}</p>
        )}
        {shownSections.map((section) => {
          const index = inspectionSections.indexOf(section);
          const stats = sectionStats(section, answers);
          const open = filter !== "all" || openId === section.id;
          const state = stats.defects ? (stats.major ? "has-defects has-major" : "has-defects") : stats.answered === stats.total ? "complete" : "";
          const next = inspectionSections[index + 1];
          const checksLeft = section.questions.filter((question) => question.kind === "check" && !answers[question.id]).length;
          return (
            <section key={section.id} id={`insp-section-${section.id}`} className={`insp-section ${open ? "open" : ""} ${state}`}>
              <button type="button" className="insp-section-head" aria-expanded={open} onClick={() => clickHead(section.id)}>
                <span className="insp-num">{pad(index + 1)}</span>
                <span className="insp-title"><strong>{section.title}</strong><small>{section.note}</small></span>
                <span className="insp-badges">
                  {stats.major > 0 && <em className="major">{stats.major} MAJOR</em>}
                  {stats.defects - stats.major > 0 && <em className="minor">{stats.defects - stats.major} MINOR</em>}
                  <em className={stats.answered === stats.total ? "done" : ""}>{stats.answered}/{stats.total}</em>
                </span>
                <i className="insp-chev" aria-hidden="true" />
                <span className="insp-bar"><i style={{ width: `${(stats.answered / stats.total) * 100}%` }} /></span>
              </button>
              {open && (
                <div className="insp-body">
                  <div className="insp-tools">
                    <button type="button" className="insp-tool" disabled={checksLeft === 0} onClick={() => passRemaining(section)}>PASS {checksLeft} REMAINING CHECK{checksLeft === 1 ? "" : "S"}</button>
                    <button type="button" className="insp-tool" disabled={stats.answered === 0} onClick={() => clearSection(section)}>CLEAR SECTION</button>
                  </div>
                  {section.questions.filter(visible).map((question) => renderQuestion(section, question))}
                  {next && filter === "all" && (
                    <div className="insp-next">
                      <button type="button" onClick={() => jump(next.id)}>NEXT: {next.title.toUpperCase()} <ArrowGlyph /></button>
                    </div>
                  )}
                </div>
              )}
            </section>
          );
        })}
      </div>

      <div className="insp-footer">
        {validated ? (
          <>
            <div className={`inspection-result ${outOfService ? "fail" : withDefects ? "minor" : "ok"}`}>
              <i>{outOfService ? <CloseGlyph /> : <CheckGlyph />}</i>
              <div>
                <strong>{outOfService ? "Out of service until repaired" : withDefects ? "Validated with minor defects" : "DVIR signed"}</strong>
                <span>{outOfService ? `${defects.major} major and ${defects.minor} minor defect${defects.total === 1 ? "" : "s"} reported to Dowe Service.` : withDefects ? "The truck may operate. Minor defects are queued for the next service visit." : `Signed at ${inspection.validatedAt}. No defects reported for ${truckLabel}.`}</span>
              </div>
            </div>
            <div className="insp-footer-actions">
              {defects.total > 0 && <button type="button" className="eld-outline-button" onClick={recheck}>RE-CHECK DEFECTS</button>}
              <button type="button" className="eld-outline-button" onClick={startOver}>NEW INSPECTION</button>
            </div>
          </>
        ) : (
          <>
            <div className={`inspection-result ${failed ? "fail" : ""}`}>
              <i>{failed ? <CloseGlyph /> : <LockGlyph />}</i>
              <div>
                <strong>{failed ? "Validation failed" : "Validation required"}</strong>
                <span>
                  {failed
                    ? `${inspection.missing.length} question${inspection.missing.length === 1 ? " is" : "s are"} still unanswered. They are flagged in red.`
                    : remaining === 0
                      ? "Every question is answered. Validate to sign the DVIR."
                      : `${remaining} of ${totalQuestions} questions left. Answer them all, then validate to sign the DVIR.`}
                </span>
              </div>
            </div>
            <div className="insp-footer-actions">
              <button type="button" className="validate-button" onClick={validate}><CheckGlyph /> VALIDATE INSPECTION</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
