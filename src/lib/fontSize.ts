/** Text-size steps for the reader font control (root font-size, in %). */
export const FONT_STEPS = [87.5, 100, 112.5, 125, 140, 160] as const;
export const FONT_DEFAULT_INDEX = 1;
export const FONT_STORAGE_KEY = "evx-font-step";

/** Runs in <head> before first paint so the saved size applies without a jump. */
export const FONT_INIT_SCRIPT = `try{var s=parseInt(localStorage.getItem("${FONT_STORAGE_KEY}"),10),v=${JSON.stringify(
  FONT_STEPS
)};if(s>=0&&s<v.length&&s!==${FONT_DEFAULT_INDEX})document.documentElement.style.fontSize=v[s]+"%"}catch(e){}`;
