import { useEffect, useRef, useState, useCallback } from "react";
import "../styles.css";

/* ── constants ── */
const PHOTOS = {
  cover: new URL("../assets/photos/cover.webp", import.meta.url).href,
  groom: new URL("../assets/photos/groom.webp", import.meta.url).href,
  bride: new URL("../assets/photos/bride.webp", import.meta.url).href,
};
const UI = {
  flourish: new URL("../assets/ui/flourish.png", import.meta.url).href,
  floralSunda: new URL("../assets/ui/floral-sunda.webp", import.meta.url).href,
  music: new URL("../assets/ui/music.png", import.meta.url).href,
};
const AUDIO_SRC = new URL("../assets/audio/wedding-music.mp4", import.meta.url).href;
const GALLERY_PHOTOS = [
  { src: new URL("../assets/photos/gallery-01.webp", import.meta.url).href, cls: "tall" },
  { src: new URL("../assets/photos/gallery-02.webp", import.meta.url).href, cls: "" },
  { src: new URL("../assets/photos/gallery-03.webp", import.meta.url).href, cls: "" },
  { src: new URL("../assets/photos/gallery-04.webp", import.meta.url).href, cls: "wide" },
  { src: new URL("../assets/photos/gallery-05.webp", import.meta.url).href, cls: "" },
  { src: new URL("../assets/photos/gallery-06.webp", import.meta.url).href, cls: "" },
];
const EVENT_DATE   = new Date("2027-05-15T11:00:00+07:00");
const EVENT_DAY    = "Saturday";
const EVENT_LABEL  = "15 May 2027";
const EVENT_FULL_DATE = `${EVENT_DAY}, ${EVENT_LABEL}`;
const MAPS_URL     = "https://www.google.com/maps?vet=10CAAQoqAOahcKEwjYgr7yyJeWAxUAAAAAHQAAAAAQCQ..i&rlz=1C5GCCM_en&fvr=1&pvq=Cg0vZy8xMXczY19maF95IhgKEmt1bmluZ2FuIHBhbG1hIG9uZRACGAM&lqi=ChJrdW5pbmdhbiBwYWxtYSBvbmVI_f_av427gIAIWiAQABABEAIYABgBGAIiEmt1bmluZ2FuIHBhbG1hIG9uZZIBDXdlZGRpbmdfdmVudWU&cs=0&um=1&ie=UTF-8&fb=1&gl=ph&sa=X&ftid=0x2e69f300410d728f:0xd24295b67bf788d4";
const CALENDAR_URL = "https://calendar.google.com/calendar/render?action=TEMPLATE&text=The%20Wedding%20of%20Raden%20Adhitya%20%26%20Riri%20Afrani&dates=20270515T040000Z%2F20270515T060000Z&location=Palma%20One%2C%20Kuningan%2C%20Jakarta&details=We%20warmly%20invite%20you%20to%20celebrate%20the%20beginning%20of%20our%20forever.";
const WISH_KEY     = "ririAdhitWeddingWishes";
const SAMPLE_WISHES = [
  { name: "Jonathan Adimara",        message: "May your marriage be filled with love, humor, and joy that lasts forever. Congratulations!", date: "25 Apr 2026, 19:00" },
  { name: "Nelanda Arensyah", message: "Wishing Riri and Adhit a beautiful life together. May every step ahead be full of grace.",    date: "09 May 2026, 19:12" },
  { name: "Kristian Steward",      message: "Congratulations! May your home always be warm, peaceful, and full of laughter.",             date: "09 May 2026, 18:23" },
];

function pad(v) { return String(v).padStart(2, "0"); }
function esc(v) {
  return String(v)
    .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}
function getWishes() {
  try { return JSON.parse(localStorage.getItem(WISH_KEY) || "[]"); } catch { return []; }
}

/* ── Countdown hook ── */
function useCountdown() {
  const [cd, setCd] = useState({ days: "00", hours: "00", minutes: "00", seconds: "00", done: false });
  useEffect(() => {
    function tick() {
      const rem = EVENT_DATE.getTime() - Date.now();
      if (rem <= 0) { setCd({ days: "00", hours: "00", minutes: "00", seconds: "00", done: true }); return; }
      setCd({
        days:    pad(Math.floor(rem / 86400000)),
        hours:   pad(Math.floor((rem / 3600000) % 24)),
        minutes: pad(Math.floor((rem / 60000)   % 60)),
        seconds: pad(Math.floor((rem / 1000)    % 60)),
        done: false,
      });
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return cd;
}

/* ── App ── */
export default function App() {
  const [open,        setOpen]       = useState(false);
  const [playing,     setPlaying]    = useState(false);
  const [wishLimit,   setWishLimit]  = useState(2);
  const [storedWishes, setStoredWishes] = useState(getWishes);
  const [lightboxSrc, setLightboxSrc] = useState(null);
  const [rsvpStatus,  setRsvpStatus] = useState(null);
  const [giftStatus,  setGiftStatus] = useState("");
  const [giftStep,    setGiftStep]   = useState(1);
  const [uploadLabel, setUploadLabel] = useState("Choose file");
  const [activeSection, setActiveSection] = useState("home");

  const audioRef = useRef(null);
  const resumeAfterVisibilityRef = useRef(false);
  const countdown = useCountdown();

  /* guest name from ?to= */
  const guestName = new URLSearchParams(window.location.search).get("to") || "Special Guest";

  /* music */
  const playMusic = useCallback(async () => {
    try { await audioRef.current?.play(); setPlaying(true); } catch { setPlaying(false); }
  }, []);
  const toggleMusic = useCallback(async () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) { await playMusic(); }
    else { audioRef.current.pause(); setPlaying(false); }
  }, [playMusic]);

  /* pause music in background tabs and resume when returning */
  useEffect(() => {
    async function handleVisibilityChange() {
      const audio = audioRef.current;
      if (!audio) return;

      if (document.hidden) {
        resumeAfterVisibilityRef.current = !audio.paused;
        if (resumeAfterVisibilityRef.current) {
          audio.pause();
          setPlaying(false);
        }
        return;
      }

      if (resumeAfterVisibilityRef.current) {
        resumeAfterVisibilityRef.current = false;
        await playMusic();
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [playMusic]);

  /* open invitation */
  const handleOpen = useCallback(async () => {
    setOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
    await playMusic();
  }, [playMusic]);

  /* scroll reveal */
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches || !("IntersectionObserver" in window)) return;
    document.body.classList.add("motion-ready");
    const els = document.querySelectorAll(".section-panel, .gallery-item, .footer-panel");
    const obs = new IntersectionObserver((entries, o) => {
      entries.forEach((e) => { if (!e.isIntersecting) return; e.target.classList.add("is-visible"); o.unobserve(e.target); });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [open]);

  /* bottom nav active */
  useEffect(() => {
    if (!open) return;
    const ids = ["home", "couple", "gallery", "save-date", "details", "rsvp"];
    const sections = ids.map((id) => document.getElementById(id)).filter(Boolean);
    const obs = new IntersectionObserver((entries) => {
      const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (vis) setActiveSection(vis.target.id === "details" ? "save-date" : vis.target.id);
    }, { rootMargin: "-40% 0px -45% 0px", threshold: [0, 0.25, 0.5, 0.75] });
    sections.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, [open]);

  /* RSVP */
  function handleRsvp(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setRsvpStatus({
      attendance: fd.get("attendance"),
      guests: fd.get("guests") || "1",
    });
  }

  /* Gift */
  function handleCopyAccount() {
    navigator.clipboard.writeText("123456789").then(() => setGiftStatus("Copied!")).catch(() => setGiftStatus("123456789"));
  }
  function handleGiftSubmit(e) {
    e.preventDefault();
    setGiftStatus("Gift confirmation saved. Thank you!");
    setGiftStep(1); setUploadLabel("Choose file"); e.currentTarget.reset();
  }

  /* Wishes */
  function handleWishSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const now = new Date();
    const date = now.toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).replace(",", "");
    const next = { name: fd.get("name"), message: fd.get("message"), date };
    const updated = [next, ...storedWishes];
    localStorage.setItem(WISH_KEY, JSON.stringify(updated));
    setStoredWishes(updated);
    setWishLimit((l) => Math.max(l, 4));
    e.currentTarget.reset();
  }
  const allWishes   = [...storedWishes, ...SAMPLE_WISHES];
  const visibleWishes = allWishes.slice(0, wishLimit);

  const NAV = [
    { id: "home",      label: "Cover",   icon: "♡" },
    { id: "couple",    label: "Couple",  icon: "②" },
    { id: "gallery",   label: "Gallery", icon: "③" },
    { id: "save-date", label: "Event",   icon: "④" },
    { id: "rsvp",      label: "RSVP",    icon: "⑤" },
  ];

  return (
    <>
      {/* desktop backdrop */}
      <div className="desktop-backdrop" aria-hidden="true" />

      {/* opening cover */}
      <div className={`opening-cover${open ? " is-hidden" : ""}`} role="dialog" aria-modal="true" aria-label="Wedding invitation cover">
        <div className="opening-photo" aria-hidden="true" />
        <div className="opening-shade" aria-hidden="true" />
        <div className="opening-details">
          <p className="kicker">The Wedding of</p>
          <h1>Riri &amp; Adhit</h1>
          <p className="guest-copy">Dear</p>
          <p className="guest-copy"><strong>{guestName}</strong></p>
          <p className="guest-copy">Please be a part of our happiest moment</p>
          <button className="light-button" onClick={handleOpen} type="button">
            Open Invitation
          </button>
        </div>
      </div>

      {/* invite shell */}
      <div className="invite-shell" id="top">

        {/* ① Cover */}
        <section className="section-panel invite-cover" id="home">
          <img className="cover-flourish" src={UI.flourish} alt="" aria-hidden="true" />
          <div className="oval-frame">
            <img src={PHOTOS.cover} alt="Riri and Adhit" />
          </div>
          <div className="cover-copy">
            <p className="kicker">The Wedding of</p>
            <h1 className="cover-names">
              <span>Raden Adhitya</span>
              <span className="cover-amp">&amp;</span>
              <span>Riri Afrani</span>
            </h1>
            <p className="date">{EVENT_FULL_DATE}</p>
          </div>
          <div className="cover-wayang cover-floral-sunda" aria-hidden="true">
            <img className="wayang wayang-left-large" src={UI.floralSunda} alt="" />
            <img className="wayang wayang-right-large" src={UI.floralSunda} alt="" />
          </div>
        </section>
        {/* ② Couple */}
        <section className="section-panel couple-panel" id="couple">
          <div className="section-heading couple-heading">
            <h2>We warmly invite you to celebrate the beginning of our forever</h2>
          </div>
          <div className="person">
            <div className="round-frame">
              <img src={PHOTOS.groom} alt="Adhit — the groom" />
            </div>
            <h3>Raden Adhitya Ardiansyah Ramadhan S.T., M.Sc.</h3>
            <p>Son of Raden Asep Komarudin and Mimin Aminah</p>
          </div>
          <div className="ampersand" aria-hidden="true">&amp;</div>
          <div className="person">
            <div className="round-frame">
              <img src={PHOTOS.bride} alt="Riri — the bride" />
            </div>
            <h3>Dr Riri Afrani</h3>
            <p>Daughter of Mr Hari Sukriyadi and Mrs Rina Rosdiana</p>
          </div>
        </section>
        {/* ③ Gallery */}
        <section id="gallery" aria-label="Wedding gallery">
          <div className="gallery-panel">
            {GALLERY_PHOTOS.map(({ src, cls }, i) => (
              <button
                key={src}
                className={`gallery-item${cls ? ` ${cls}` : ""}`}
                type="button"
                aria-label={`Open photo ${i + 1}`}
                onClick={() => setLightboxSrc(src)}
              >
                <img src={src} alt={`Wedding photo ${i + 1}`} loading="lazy" />
              </button>
            ))}
          </div>
        </section>

        {/* ④ Save the Date */}
        <section className="section-panel save-date continuous-section" id="save-date">
          <div className="save-date-inner">
            <div className="section-heading save-date-heading">
              <h2>Save The Date</h2>
              <p>{EVENT_LABEL}</p>
            </div>
            <div className="countdown-stage">
              <div className="save-wayang save-floral-sunda" aria-hidden="true">
                <img src={UI.floralSunda} alt="" />
                <img src={UI.floralSunda} alt="" />
                <img src={UI.floralSunda} alt="" />
              </div>
              <div className="countdown" role="timer" aria-label="Countdown to the wedding">
                <div><strong>{countdown.days}</strong><span>Days</span></div>
                <i aria-hidden="true">:</i>
                <div><strong>{countdown.hours}</strong><span>Hours</span></div>
                <i aria-hidden="true">:</i>
                <div><strong>{countdown.minutes}</strong><span>Minutes</span></div>
                <i aria-hidden="true">:</i>
                <div><strong>{countdown.seconds}</strong><span>Seconds</span></div>
              </div>
              <img className="countdown-flourish" src={UI.flourish} alt="" aria-hidden="true" />
            </div>
            <p className="countdown-note">
              {countdown.done ? "The celebration day has arrived!" : "Counting the days until we celebrate together."}
            </p>
            <a className="dark-button calendar-button" href={CALENDAR_URL} target="_blank" rel="noreferrer noopener">
              Add to Calendar
            </a>
          </div>
        </section>

        {/* ⑤ Event Details */}
        <section className="section-panel details-panel continuous-section" id="details">
          <img className="details-flourish" src={UI.flourish} alt="" aria-hidden="true" />
          <div className="section-heading details-heading">
            <h2>Event Details</h2>
          </div>
          <div className="event-date">
            <p>{EVENT_DAY},</p>
            <h3>{EVENT_LABEL}</h3>
          </div>
          <div className="rings-mark" aria-hidden="true">
            <span />
            <span />
          </div>
          <div className="event-card event-card-compact">
            <h3>Akad</h3>
            <p className="event-time">07:00 - 09:00 WIB</p>
          </div>
          <div className="event-divider" aria-hidden="true" />
          <div className="event-card">
            <h3>Reception</h3>
            <p className="event-time">11:00 - 13:00 WIB</p>
            <p className="venue-name">Palma One</p>
            <p>Jl. H. R. Rasuna Said, Kuningan<br />South Jakarta, Indonesia</p>
            <a className="ghost-button small-button" href={MAPS_URL} target="_blank" rel="noreferrer noopener">
              View Maps
            </a>
          </div>
          <div className="section-rule" aria-hidden="true" />
        </section>

        {/* ⑥ RSVP */}
        <section className="section-panel rsvp-panel continuous-section" id="rsvp">
          <div className="section-heading">
            <h2>RSVP</h2>
          </div>
          {rsvpStatus ? (
            <div className="rsvp-confirmed" aria-live="polite">
              <h3>{rsvpStatus.attendance === "attending" ? "Yes, I will attend" : "Unable to attend"}</h3>
              <p>
                {rsvpStatus.attendance === "attending"
                  ? `Thank you for your confirmation for ${rsvpStatus.guests} guest(s). We look forward to celebrating with you.`
                  : "Thank you for letting us know. Your love and prayers mean so much to us."}
              </p>
              <button className="dark-button" onClick={() => setRsvpStatus(null)} type="button">Change</button>
            </div>
          ) : (
            <form className="stack-form rsvp-form" onSubmit={handleRsvp}>
              <label><span>Your name</span><input type="text" name="name" placeholder="Full name" required autoComplete="name" /></label>
              <label><span>Number of guests</span><input type="number" name="guests" min="1" max="5" defaultValue="1" required /></label>
              <label>
                <span>Attendance</span>
                <select name="attendance" required defaultValue="">
                  <option value="" disabled>Select attendance</option>
                  <option value="attending">Yes, I will attend</option>
                  <option value="unable">Unable to attend</option>
                </select>
              </label>
              <button className="dark-button" type="submit">Confirm Attendance</button>
            </form>
          )}
        </section>

        {/* ⑦ Gift */}
        <section className="section-panel gift-panel continuous-section" id="gift">
          <div className="section-heading">
            <h2>Wedding Gift</h2>
            <p>Your blessing and presence at our wedding are enough for us. If you wish to share a token of love, we have prepared a digital envelope.</p>
          </div>
          <div className={`gift-step${giftStep === 1 ? " is-active" : ""}`} data-step="1">
            <div className="bank-card">
              <p className="bank-label">Destination bank</p>
              <h3>Bank Mandiri (008)</h3>
              <p>Account Number</p>
              <p className="account-number" id="accountNumber">123456789</p>
              <p>Riri Afrani</p>
              <button className="ghost-button" onClick={handleCopyAccount} type="button">Copy Number</button>
            </div>
            <p className="form-status" aria-live="polite">{giftStatus}</p>
            <button className="dark-button" onClick={() => setGiftStep(2)} type="button">Confirm Transfer</button>
          </div>
          <div className={`gift-step${giftStep === 2 ? " is-active" : ""}`} data-step="2">
            <h3>Upload transfer proof</h3>
            <p>Attach a screenshot so we know your gift arrived safely.</p>
            <form className="stack-form" onSubmit={handleGiftSubmit}>
              <label className="upload-box">
                <span>{uploadLabel}</span>
                <input type="file" name="proof" accept="image/*" onChange={(e) => setUploadLabel(e.target.files[0]?.name || "Choose file")} />
              </label>
              <button className="dark-button" type="submit">Submit Proof</button>
            </form>
            <button className="ghost-button" onClick={() => setGiftStep(1)} type="button">Back</button>
          </div>
        </section>

        {/* ⑧ Wishes */}
        <section className="section-panel wish-panel continuous-section" id="wishes">
          <div className="section-heading">
            <h2>Wedding Wish</h2>
          </div>
          <form className="stack-form wish-form" onSubmit={handleWishSubmit}>
            <label><span>Your name</span><input type="text" name="name" placeholder="Full name" required autoComplete="name" /></label>
            <label><span>Your message</span><textarea name="message" rows={4} placeholder="Give your wish..." required /></label>
            <button className="dark-button" type="submit">Send</button>
          </form>
          <div className="wishes" aria-label="Messages from guests">
            {visibleWishes.map((w, i) => (
              <article key={i} className="wish-card">
                <h3 dangerouslySetInnerHTML={{ __html: esc(w.name) }} />
                <p dangerouslySetInnerHTML={{ __html: esc(w.message) }} />
                <time>{w.date}</time>
              </article>
            ))}
          </div>
          {wishLimit < allWishes.length && (
            <button className="dark-button center-button" onClick={() => setWishLimit((l) => l + 3)} type="button">
              Show more wishes
            </button>
          )}
        </section>

        {/* ⑨ Thank You */}
        <section className="section-panel thanks-panel continuous-section" id="thanks">
          <h2>Raden Adhitya &amp; Riri Afrani</h2>
          <p className="thanks-date">{EVENT_LABEL}</p>
          <img className="thanks-flourish" src={UI.flourish} alt="" aria-hidden="true" />
          <div className="thanks-wayang thanks-floral-sunda" aria-hidden="true">
            <img src={UI.floralSunda} alt="" />
            <img src={UI.floralSunda} alt="" />
          </div>
        </section>

        <footer className="footer-panel">
          <p>Raden Adhitya &amp; Riri Afrani &middot; {EVENT_LABEL}</p>
        </footer>
      </div>

      {/* bottom nav */}
      <nav className="bottom-nav" aria-label="Page sections">
        {NAV.map(({ id, label, icon }) => (
          <a key={id} href={`#${id}`} data-section={id} aria-label={label} className={activeSection === id ? "is-active" : ""}>
            <span>{icon}</span>{label}
          </a>
        ))}
      </nav>

      {/* music toggle */}
      <button className={`music-toggle${playing ? " is-playing" : ""}`} onClick={toggleMusic} type="button" aria-label={playing ? "Pause wedding music" : "Play wedding music"}>
        <img src={UI.music} alt="" aria-hidden="true" />
      </button>

      {/* audio */}
      <audio ref={audioRef} src={AUDIO_SRC} loop preload="none" />

      {/* lightbox */}
      {lightboxSrc && (
        <div
          className="lightbox is-open"
          role="dialog" aria-modal="true" aria-label="Photo lightbox"
          onClick={(e) => { if (e.target === e.currentTarget) setLightboxSrc(null); }}
        >
          <button className="lightbox-close" onClick={() => setLightboxSrc(null)} type="button" aria-label="Close lightbox">✕ Close</button>
          <img src={lightboxSrc} alt="Enlarged wedding photo" />
        </div>
      )}
    </>
  );
}
