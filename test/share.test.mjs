/* lib/share.ts: reading a shared workout or gym the way the old site's open.html and edge function did. The cases are
   the edge function's (history-share notes: workout, gym, expired, wrong kind, not a share link, Firestore down and
   slow), plus the page's own lines. */
import { strict as assert } from "node:assert";
import test from "node:test";
import { exerciseLine, fetchShare, listed, previewFor, readShare, usesMiles } from "../lib/share.ts";

const s = (v) => ({ stringValue: v });
const i = (v) => ({ integerValue: String(v) });
const exercise = (name, type, more = {}) => ({
  mapValue: { fields: { name: s(name), type: s(type), ...more } },
});
const workoutDoc = (names) => ({
  fields: {
    v: i(1),
    kind: s("workout"),
    name: s("Upper A"),
    exercises: { arrayValue: { values: names.map((n) => exercise(n, "strength", { sets: i(4), reps: i(5) })) } },
  },
});
const gymDoc = (equipment) => ({
  fields: { v: i(1), kind: s("gym"), name: s("Home gym"), equipment: { arrayValue: { values: equipment.map(s) } } },
});

test("a workout reads as the app reads it, and its preview names it", () => {
  const share = readShare(
    workoutDoc([
      "Barbell Bench Press",
      "Barbell Bent Over Row",
      "Barbell Seated Overhead Press",
      "Pull-Up",
      "Dip",
      "Plank",
    ]),
  );
  assert.equal(share.kind, "workout");
  assert.equal(share.exercises.length, 6);
  assert.deepEqual(previewFor(share), {
    title: "Upper A",
    description:
      "6 exercises: Barbell Bench Press, Barbell Bent Over Row, Barbell Seated Overhead Press and 3 more. Shared from Kiron.",
  });
});

test("a gym lists its equipment, and one with none says so", () => {
  assert.deepEqual(previewFor(readShare(gymDoc(["barbell", "dumbbells", "not_a_thing"]))), {
    title: "Home gym",
    description: "Gym setup: Barbell and Dumbbells. Shared from Kiron.",
  });
  assert.equal(previewFor(readShare(gymDoc([]))).description, "A gym setup, shared from Kiron.");
});

test("anything the app wouldn't accept is not a share", () => {
  assert.equal(readShare(null), null);
  assert.equal(readShare({}), null);
  assert.equal(readShare({ fields: { ...workoutDoc(["Squat"]).fields, v: i(2) } }), null); // another version
  assert.equal(readShare({ fields: { ...workoutDoc(["Squat"]).fields, name: s("   ") } }), null); // no name
  assert.equal(readShare(workoutDoc([])), null); // a workout with nothing in it
  const odd = workoutDoc(["Squat"]);
  odd.fields.exercises.arrayValue.values[0].mapValue.fields.type = s("yoga");
  assert.equal(readShare(odd), null);
});

test("names are cut to 80 characters and kept as text", () => {
  const long = "<b>" + "x".repeat(100);
  const share = readShare({ fields: { ...gymDoc([]).fields, name: s(long) } });
  assert.equal(share.name.length, 80);
  assert.ok(share.name.startsWith("<b>")); // React escapes it when drawn; it's never parsed as HTML
});

test("exercise lines read like the app's preview", () => {
  const e = (type, f) => ({ name: "x", type, sets: null, reps: null, seconds: null, miles: null, ...f });
  assert.equal(exerciseLine(e("strength", { sets: 4, reps: 5 }), true), "4 × 5");
  assert.equal(exerciseLine(e("strength", { sets: 3 }), true), "3 sets");
  assert.equal(exerciseLine(e("cardio", { seconds: 1200, miles: 2 }), true), "20 min, 2 mi");
  assert.equal(exerciseLine(e("cardio", { seconds: 1200, miles: 2 }), false), "20 min, 3.2 km");
  assert.equal(exerciseLine(e("cardio", { seconds: 5400 }), true), "1 h 30 min");
  assert.equal(exerciseLine(e("timed", { sets: 3, seconds: 45 }), true), "3 × 45 s");
});

test("miles for the US and the UK, kilometres elsewhere, from a tag or a whole header", () => {
  assert.equal(usesMiles("en-US"), true);
  assert.equal(usesMiles("en-GB,en;q=0.9"), true);
  assert.equal(usesMiles("de-DE,de;q=0.9,en-US;q=0.8"), false);
  assert.equal(usesMiles("fr"), false);
  assert.equal(usesMiles(null), true); // no header: the old page's default, en-US
});

test("lists read as a sentence", () => {
  assert.equal(listed(["A"]), "A");
  assert.equal(listed(["A", "B"]), "A and B");
  assert.equal(listed(["A", "B", "C"]), "A, B and C");
  assert.equal(listed(["A", "B", "C", "D", "E"]), "A, B, C and 2 more");
});

/** fetch, faked for one test: returns what `reply` gives for the request. */
async function withFetch(reply, run) {
  const real = globalThis.fetch;
  globalThis.fetch = async (url, init) => reply(url, init);
  try {
    return await run();
  } finally {
    globalThis.fetch = real;
  }
}
const ID = "a1B2c3D4e5F6g7H8i9J0";
const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });

test("found, gone and failed are told apart", async () => {
  await withFetch(() => json(200, workoutDoc(["Squat"])), async () => {
    assert.equal((await fetchShare(ID, "workout")).status, "found");
    assert.equal((await fetchShare(ID, "gym")).status, "gone"); // a workout's id under /g/
  });
  await withFetch(() => json(403, { error: { status: "PERMISSION_DENIED" } }), async () => {
    assert.equal((await fetchShare(ID, "workout")).status, "gone"); // expired, or never existed
  });
  await withFetch(() => json(404, {}), async () => assert.equal((await fetchShare(ID, "workout")).status, "gone"));
  await withFetch(() => json(503, {}), async () => assert.equal((await fetchShare(ID, "workout")).status, "failed"));
  await withFetch(() => Promise.reject(new TypeError("fetch failed")), async () =>
    assert.equal((await fetchShare(ID, "workout")).status, "failed"),
  );
});

test("a slow Firestore gives up, and a link that isn't a share id never asks", async () => {
  let asked = 0;
  const slow = (url, init) =>
    new Promise((resolve, reject) => {
      asked++;
      init.signal.addEventListener("abort", () => reject(init.signal.reason));
    });
  await withFetch(slow, async () => {
    const started = Date.now();
    assert.equal((await fetchShare(ID, "workout", { timeoutMs: 50 })).status, "failed");
    assert.ok(Date.now() - started < 1000);
    assert.equal((await fetchShare("abc", "workout")).status, "gone");
    assert.equal((await fetchShare("a1B2c3D4e5F6g7H8i9J0-extra", "workout")).status, "gone");
  });
  assert.equal(asked, 1);
});

test("the request goes to the shares collection of Kiron's project", async () => {
  let seen = "";
  await withFetch((url) => ((seen = url), json(403, {})), () => fetchShare(ID, "workout"));
  assert.equal(seen, `https://firestore.googleapis.com/v1/projects/kiron-5422e/databases/(default)/documents/shares/${ID}`);
});
