// Server-written text (descriptions, notes) can mix Arabic with paths, URLs and code.
// A Latin run that starts or ends with a neutral character (/, ., :) gets reordered
// inside RTL text («/api/mobile/v1» shows as «api/mobile/v1/»). Wrapping each Latin
// run in Unicode isolates (LRI … PDI) keeps it intact, like the design's dir="ltr" spans.
const LATIN_RUN = /[A-Za-z0-9/@#_~.:?=&%+-]*[A-Za-z0-9][A-Za-z0-9/@#_~.:?=&%+-]*/g;

export function isolateLatin(text: string): string {
  return text.replace(LATIN_RUN, (run) => {
    // Plain words and numbers need no help; only isolate runs with neutral punctuation.
    if (!/[/.:@#?=&%_~+-]/.test(run)) return run;
    // A trailing sentence period belongs to the Arabic sentence, not the path.
    const m = /^(.*?)([.:]*)$/.exec(run);
    const core = m?.[1] ?? run;
    const tail = m?.[2] ?? '';
    return core ? `\u2066${core}\u2069${tail}` : run;
  });
}
