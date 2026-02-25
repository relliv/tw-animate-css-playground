import "./style.css";

type Direction = "in" | "out";

interface Preset {
  label: string;
  classes: string;
}

const enterEffects: string[] = [
  "fade-in",
  "zoom-in",
  "spin-in",
  "blur-in",
  "slide-in-from-top",
  "slide-in-from-bottom",
  "slide-in-from-left",
  "slide-in-from-right",
];
const exitEffects: string[] = [
  "fade-out",
  "zoom-out",
  "spin-out",
  "blur-out",
  "slide-out-to-top",
  "slide-out-to-bottom",
  "slide-out-to-left",
  "slide-out-to-right",
];
const readyToUse: string[] = [
  "animate-accordion-down",
  "animate-accordion-up",
  "animate-collapsible-down",
  "animate-collapsible-up",
  "animate-caret-blink",
];

const presets: Preset[] = [
  { label: "Fade + Zoom In", classes: "animate-in fade-in zoom-in" },
  {
    label: "Fade + Slide Up",
    classes: "animate-in fade-in slide-in-from-bottom",
  },
  {
    label: "Fade + Spin + Zoom",
    classes: "animate-in fade-in spin-in zoom-in",
  },
  {
    label: "Blur + Slide Left",
    classes: "animate-in blur-in slide-in-from-left",
  },
  { label: "Fade + Zoom Out", classes: "animate-out fade-out zoom-out" },
  {
    label: "Fade + Slide Up Out",
    classes: "animate-out fade-out slide-out-to-top",
  },
  { label: "Spin + Fade Out", classes: "animate-out fade-out spin-out" },
];

const durations: string[] = [
  "duration-150",
  "duration-300",
  "duration-500",
  "duration-700",
  "duration-1000",
];
const easings: string[] = ["ease-linear", "ease-in", "ease-out", "ease-in-out"];

let selectedEffects = new Set<string>();
let currentDirection: Direction = "in";

function createApp(): void {
  const app = document.getElementById("app")!;

  app.innerHTML = `
    <header class="mb-12 text-center">
      <h1 class="text-4xl font-bold tracking-tight text-white mb-2">tw-animate-css Playground</h1>
      <p class="text-zinc-400 text-lg">Interactive playground for <a href="https://github.com/Wombosvideo/tw-animate-css" target="_blank" rel="noopener noreferrer" class="text-amber-400 hover:text-amber-300 underline underline-offset-2 transition-colors">tw-animate-css</a> — Tailwind CSS animation utilities</p>
    </header>

    <!-- Combo Builder -->
    <section class="mb-10 p-6 rounded-xl bg-zinc-900 border border-zinc-800">
      <h2 class="text-lg font-semibold text-zinc-200 mb-4">Animation Builder</h2>

      <!-- Direction toggle -->
      <div class="flex items-center gap-2 mb-5">
        <button id="dir-in" class="dir-btn px-4 py-1.5 rounded-lg text-sm font-medium cursor-pointer transition-colors bg-amber-600 text-white">Enter</button>
        <button id="dir-out" class="dir-btn px-4 py-1.5 rounded-lg text-sm font-medium cursor-pointer transition-colors bg-zinc-800 text-zinc-400 hover:text-zinc-200">Exit</button>
      </div>

      <!-- Effect toggles -->
      <div id="effect-toggles" class="flex flex-wrap gap-2 mb-5"></div>

      <!-- Duration / Easing -->
      <div class="flex flex-wrap items-end gap-4 mb-5">
        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-zinc-400 uppercase tracking-wide">Duration</label>
          <select id="duration-select" class="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500">
            ${durations
              .map(
                (d) =>
                  `<option value="${d}" ${
                    d === "duration-500" ? "selected" : ""
                  }>${d.replace("duration-", "")}ms</option>`
              )
              .join("")}
          </select>
        </div>
        <div class="flex flex-col gap-1">
          <label class="text-xs font-medium text-zinc-400 uppercase tracking-wide">Easing</label>
          <select id="easing-select" class="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500">
            ${easings
              .map(
                (e) =>
                  `<option value="${e}" ${
                    e === "ease-out" ? "selected" : ""
                  }>${e.replace("ease-", "")}</option>`
              )
              .join("")}
          </select>
        </div>
        <button id="replay-builder" class="bg-amber-600 hover:bg-amber-500 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors cursor-pointer">
          Replay
        </button>
        <button id="clear-builder" class="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg px-4 py-2 text-sm font-medium transition-colors cursor-pointer">
          Clear
        </button>
      </div>

      <!-- Preview + output -->
      <div class="flex flex-col sm:flex-row items-center gap-6">
        <div class="flex items-center justify-center w-32 h-32 rounded-xl bg-zinc-950 border border-zinc-800">
          <div id="builder-preview" class="w-16 h-16 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/20"></div>
        </div>
        <div class="flex-1 min-w-0">
          <label class="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1 block">Generated classes</label>
          <div id="builder-output" class="bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 font-mono text-sm text-amber-400 break-all select-all min-h-[2.5rem]">
            <span class="text-zinc-600">select effects above</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Presets -->
    <section class="mb-10">
      <h2 class="text-xl font-semibold text-zinc-200 mb-4 border-b border-zinc-800 pb-2">Combo Presets</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" id="presets-grid"></div>
    </section>

    <!-- Individual animations -->
    <section class="mb-10">
      <div class="flex items-center justify-between mb-4 border-b border-zinc-800 pb-2">
        <h2 class="text-xl font-semibold text-zinc-200">All Animations</h2>
        <button id="replay-all" class="bg-amber-600 hover:bg-amber-500 text-white rounded-lg px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer">
          Replay All
        </button>
      </div>
      <div id="all-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"></div>
    </section>
  `;

  renderEffectToggles();
  renderPresets();
  renderAllAnimations();

  document
    .getElementById("dir-in")!
    .addEventListener("click", () => setDirection("in"));
  document
    .getElementById("dir-out")!
    .addEventListener("click", () => setDirection("out"));
  document
    .getElementById("replay-builder")!
    .addEventListener("click", replayBuilder);
  document
    .getElementById("clear-builder")!
    .addEventListener("click", clearBuilder);
  document.getElementById("replay-all")!.addEventListener("click", replayAll);
  document.getElementById("duration-select")!.addEventListener("change", () => {
    replayBuilder();
    replayAll();
  });
  document.getElementById("easing-select")!.addEventListener("change", () => {
    replayBuilder();
    replayAll();
  });
}

function setDirection(dir: Direction): void {
  currentDirection = dir;
  selectedEffects.clear();

  document.getElementById("dir-in")!.className =
    `dir-btn px-4 py-1.5 rounded-lg text-sm font-medium cursor-pointer transition-colors ${
      dir === "in"
        ? "bg-amber-600 text-white"
        : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
    }`;
  document.getElementById("dir-out")!.className =
    `dir-btn px-4 py-1.5 rounded-lg text-sm font-medium cursor-pointer transition-colors ${
      dir === "out"
        ? "bg-amber-600 text-white"
        : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
    }`;

  renderEffectToggles();
  updateBuilderOutput();
}

function renderEffectToggles(): void {
  const container = document.getElementById("effect-toggles")!;
  const effects = currentDirection === "in" ? enterEffects : exitEffects;

  container.innerHTML = effects
    .map((effect) => {
      const active = selectedEffects.has(effect);
      const label = effect
        .replace("slide-in-from-", "slide ")
        .replace("slide-out-to-", "slide ")
        .replace("-in", "")
        .replace("-out", "");
      return `<button data-effect="${effect}" class="effect-toggle px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
        active
          ? "bg-amber-600 text-white"
          : "bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-700"
      }">${label}</button>`;
    })
    .join("");

  container.querySelectorAll<HTMLButtonElement>(".effect-toggle").forEach((btn) => {
    btn.addEventListener("click", () => toggleEffect(btn.dataset.effect!));
  });
}

function toggleEffect(effect: string): void {
  if (selectedEffects.has(effect)) {
    selectedEffects.delete(effect);
  } else {
    selectedEffects.add(effect);
  }
  renderEffectToggles();
  updateBuilderOutput();
  replayBuilder();
}

function getBuilderClasses(): string {
  if (selectedEffects.size === 0) return "";
  const base = currentDirection === "in" ? "animate-in" : "animate-out";
  const duration =
    (document.getElementById("duration-select") as HTMLSelectElement | null)?.value || "duration-500";
  const easing =
    (document.getElementById("easing-select") as HTMLSelectElement | null)?.value || "ease-out";
  return [base, ...selectedEffects, duration, easing].join(" ");
}

function updateBuilderOutput(): void {
  const output = document.getElementById("builder-output")!;
  const classes = getBuilderClasses();
  if (classes) {
    output.innerHTML = `<span class="text-amber-400">${classes}</span>`;
  } else {
    output.innerHTML = `<span class="text-zinc-600">select effects above</span>`;
  }
}

function replayBuilder(): void {
  const el = document.getElementById("builder-preview")!;
  const classes = getBuilderClasses();
  if (!classes) return;

  const allClasses = `${classes} ${getModifiers()}`;
  el.className =
    "w-16 h-16 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/20";
  void el.offsetWidth;
  allClasses.split(" ").forEach((c) => el.classList.add(c));
}

function clearBuilder(): void {
  selectedEffects.clear();
  renderEffectToggles();
  updateBuilderOutput();
  const el = document.getElementById("builder-preview")!;
  el.className =
    "w-16 h-16 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/20";
}

function renderPresets(): void {
  const grid = document.getElementById("presets-grid")!;
  for (const preset of presets) {
    const card = createCard(preset.classes, preset.label);
    grid.appendChild(card);
  }
}

function renderAllAnimations(): void {
  const grid = document.getElementById("all-grid")!;

  const allSingle: string[] = [
    ...enterEffects.map((e) => `animate-in ${e}`),
    ...exitEffects.map((e) => `animate-out ${e}`),
    ...readyToUse,
  ];

  for (const animClasses of allSingle) {
    const card = createCard(animClasses);
    grid.appendChild(card);
  }
}

function createCard(animClasses: string, label?: string): HTMLDivElement {
  const card = document.createElement("div");
  card.className =
    "group relative bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-colors";

  const displayLabel = label || animClasses;

  card.innerHTML = `
    <div class="flex items-center justify-between mb-3">
      <code class="text-xs text-amber-400 bg-amber-500/10 px-2 py-1 rounded font-mono truncate">${displayLabel}</code>
      <button class="replay-btn opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400 hover:text-white text-sm cursor-pointer" title="Replay">
        &#x21bb;
      </button>
    </div>
    <div class="flex items-center justify-center h-20">
      <div class="animation-target w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/20 ${animClasses} ${getModifiers()}" data-anim="${animClasses}"></div>
    </div>
  `;

  card.querySelector<HTMLButtonElement>(".replay-btn")!.addEventListener("click", () => {
    replay(card.querySelector<HTMLElement>(".animation-target")!);
  });

  return card;
}

function getModifiers(): string {
  const duration =
    (document.getElementById("duration-select") as HTMLSelectElement | null)?.value || "duration-500";
  const easing =
    (document.getElementById("easing-select") as HTMLSelectElement | null)?.value || "ease-out";
  return `${duration} ${easing}`;
}

function replay(el: HTMLElement): void {
  const animClasses = el.dataset.anim!;
  const allClasses = `${animClasses} ${getModifiers()}`;

  allClasses.split(" ").forEach((c) => el.classList.remove(c));
  void el.offsetWidth;
  allClasses.split(" ").forEach((c) => el.classList.add(c));
}

function replayAll(): void {
  document
    .querySelectorAll<HTMLElement>(
      "#all-grid .animation-target, #presets-grid .animation-target"
    )
    .forEach((el) => {
      replay(el);
    });
}

createApp();
