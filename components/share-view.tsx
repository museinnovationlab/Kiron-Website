"use client";

/* What was shared, and how to get it into Kiron: the old site's open.html as a component.

   The server has usually read the share already (app/w/[id], app/g/[id]) and passes it in, so the page arrives with
   the workout on it. If the server couldn't reach Firestore in time ("failed"), the browser reads it here, the way
   open.html always did. Every word of a share goes in as text: React escapes it. */

import { useEffect, useState } from "react";
import { APP_STORE_URL, PLAY_STORE_URL } from "./store";
import { EQUIPMENT, FIRESTORE, exerciseLine, fetchShare, type Kind, type Lookup } from "@/lib/share";

type Props = { letter: "w" | "g"; kind: Kind; id: string; initial: Lookup; miles: boolean };
type State = Lookup | { status: "loading" };

export default function ShareView({ letter, kind, id, initial, miles }: Props) {
  const [state, setState] = useState<State>(initial.status === "failed" ? { status: "loading" } : initial);

  useEffect(() => {
    if (initial.status !== "failed") return;
    // A local preview can read an emulator instead: http://localhost:3000/w/<id>?emulator=8080 (only from localhost).
    let api = FIRESTORE;
    const local = location.hostname === "localhost" || location.hostname === "127.0.0.1";
    const port = new URLSearchParams(location.search).get("emulator");
    if (local && /^\d{2,5}$/.test(port || "")) api = `http://127.0.0.1:${port}/v1`;
    let live = true;
    fetchShare(id, kind, { api, timeoutMs: 15000 }).then((result) => live && setState(result));
    return () => {
      live = false;
    };
  }, [id, kind, initial.status]);

  useEffect(() => {
    if (state.status === "found") document.title = `${state.share.name} · Shared from Kiron`;
  }, [state]);

  const gym = kind === "gym";
  const gone = state.status === "gone";
  const found = state.status === "found" ? state.share : null;

  let title = gym ? "Someone shared their gym setup with you" : "Someone shared a workout with you";
  let meta: string | null = null;
  let rows: [string, string | null][] = [];
  if (gone) title = "This link has expired";
  if (found?.kind === "workout") {
    const n = found.exercises.length;
    title = found.name;
    meta = `${n} ${n === 1 ? "exercise" : "exercises"}, shared from Kiron`;
    rows = found.exercises.map((e) => [e.name, exerciseLine(e, miles) || null]);
  }
  if (found?.kind === "gym") {
    title = found.name;
    meta = found.equipment.length ? "A gym setup, shared from Kiron" : "A gym with no equipment picked yet";
    rows = found.equipment.map((e) => [EQUIPMENT[e]!, null]);
  }

  let status: string | null = null;
  if (state.status === "loading") status = gym ? "Loading the gym…" : "Loading the workout…";
  if (state.status === "failed")
    status = "Couldn't load it just now. Check your connection and open the link again, or open it in Kiron.";
  if (gone) status = "Shared workouts and gyms last 180 days. Ask whoever sent it for a new link.";

  return (
    <div className="share">
      <p className="eyebrow">{gym ? "Shared gym" : "Shared workout"}</p>
      <h1>{title}</h1>
      {meta && <p className="share-meta">{meta}</p>}
      {rows.length > 0 && (
        <ul className="share-list">
          {rows.map(([name, line], i) => (
            <li key={i}>
              <span className="name">{name}</span>
              {line && <span className="line">{line}</span>}
            </li>
          ))}
        </ul>
      )}
      {status && (
        <p className="share-status" aria-live="polite">
          {status}
        </p>
      )}

      <div className="share-get">
        <h2>{gone ? "Get Kiron" : gym ? "Add it in Kiron" : "Do it in Kiron"}</h2>
        <p>
          {gone
            ? "Build your own workouts from any plan, and track every set."
            : `Open this link on your phone to add the ${gym ? "gym" : "workout"} to yours in Kiron. It needs Kiron 1.2 or later.`}
        </p>
        <div className="storelinks">
          {!gone && (
            <a className="btn" href={`kiron://${letter}/${id}`}>
              Open in Kiron
            </a>
          )}
          {APP_STORE_URL && (
            <a className={`btn${gone ? "" : " btn-ghost"}`} href={APP_STORE_URL}>
              App Store
            </a>
          )}
          {PLAY_STORE_URL && (
            <a className="btn btn-ghost" href={PLAY_STORE_URL}>
              Google Play
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
