"use client";

import { useEffect, useState } from "react";

// Chrome/Android fires this event when the site can be installed; iPhone Safari never does.
type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

const KEY = "kne-install-dismissed";

function dismissedRecently() {
  try {
    const at = Number(localStorage.getItem(KEY));
    return at > 0 && Date.now() - at < 30 * 86_400_000; // ask again after 30 days
  } catch {
    return false;
  }
}

export function InstallPrompt() {
  const [event, setEvent] = useState<InstallEvent | null>(null);
  const [ios, setIos] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches || (navigator as { standalone?: boolean }).standalone === true;
    if (standalone || dismissedRecently()) return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvent(e as InstallEvent);
      setOpen(true);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    const ua = navigator.userAgent;
    const isIos = /iPhone|iPad|iPod/.test(ua) || (ua.includes("Macintosh") && navigator.maxTouchPoints > 1);
    if (isIos) {
      setIos(true);
      setOpen(true);
    }
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  function close() {
    setOpen(false);
    try {
      localStorage.setItem(KEY, String(Date.now()));
    } catch {}
  }

  async function install() {
    if (!event) return;
    await event.prompt();
    await event.userChoice;
    setEvent(null);
    close();
  }

  if (!open) return null;

  return (
    <div role="dialog" aria-label="התקנת האפליקציה" className="fixed inset-x-0 bottom-20 z-50 p-3 sm:hidden">
      <div className="mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-line bg-card p-3 shadow-lg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icons/icon-192.png" alt="" className="h-12 w-12 shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1">
          <p className="font-bold">ניר אליהו כאפליקציה</p>
          {ios && !event ? (
            <p className="text-sm text-muted">
              לחצו על כפתור השיתוף{" "}
              <svg aria-label="שיתוף" viewBox="0 0 24 24" className="inline h-4 w-4 fill-none stroke-current align-[-2px]" strokeWidth={2}>
                <path d="M12 3v12M8 7l4-4 4 4M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>{" "}
              ואז &quot;הוספה למסך הבית&quot;.
            </p>
          ) : (
            <p className="text-sm text-muted">התקינו על הטלפון לגישה מהירה.</p>
          )}
        </div>
        {event && (
          <button onClick={install} className="shrink-0 rounded-xl bg-rain px-4 py-2.5 font-semibold text-white">
            התקנה
          </button>
        )}
        <button onClick={close} aria-label="סגירה" className="shrink-0 rounded-full p-2 text-muted hover:bg-sky">
          <svg aria-hidden viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current" strokeWidth={2} strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
