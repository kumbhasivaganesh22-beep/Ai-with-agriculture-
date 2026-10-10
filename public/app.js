const irrigationNotes = {
  drip: {
    surface: "Surface drip places tubing on the soil. Check crop spacing, evaporation exposure, filtration, pressure, and whether the lines can be protected and maintained.",
    subsurface: "Subsurface drip places tubing below the soil. Before choosing it, get local advice about soil texture, installation depth, root intrusion, flushing, and leak detection.",
    inline: "Inline dripline has built-in emitters along the tubing. Compare emitter spacing and flow with crop rows, water pressure, filtration needs, and repair access."
  },
  sprinkler: "Could a sprinkler system suit my crop and local wind conditions? Ask about pressure, evaporation, spacing, runoff, and the energy needed to run it.",
  manual: "Manual watering can suit small plots but takes time and may distribute water unevenly. Check safe access to the water source, avoid overwatering, and consider whether a low-pressure system could save labor.",
  lateral: "Linear-move systems travel across a field and need suitable field layout, access, and water supply. Ask about field leveling, obstacles, energy use, operating labor, and safe shutdown procedures.",
  pivot: "Center pivots rotate around a fixed point and need room to operate. Check field shape, slope, water and energy supply, crop compatibility, and local equipment and water-use requirements.",
  subirrigation: "Sub-irrigation manages the water table below the root zone, often using drainage infrastructure. It needs suitable soils and careful water-table control; ask local specialists about salinity, drainage, and environmental impacts.",
  furrow: "Would furrows work with my soil, slope, and crop rows? Ask how to reduce runoff, improve field leveling, and avoid waterlogging."
};

const cropPhRanges = [
  { name: "Potato", min: 4.8, max: 6.0 },
  { name: "Rice", min: 5.0, max: 6.5 },
  { name: "Millet", min: 5.0, max: 7.5 },
  { name: "Maize", min: 5.5, max: 7.5 },
  { name: "Groundnut", min: 5.5, max: 7.0 },
  { name: "Sorghum", min: 5.5, max: 8.0 },
  { name: "Tomato", min: 5.5, max: 7.0 },
  { name: "Wheat", min: 6.0, max: 7.5 },
  { name: "Chickpea", min: 6.0, max: 8.0 },
  { name: "Barley", min: 6.0, max: 8.5 }
];

const harvestDays = {
  rice: [100, 150],
  maize: [75, 120],
  tomato: [60, 100],
  beans: [50, 90],
  wheat: [100, 150],
  potato: [70, 120]
};

const symptomNotes = {
  spots: "Look at both sides of affected leaves and compare several plants. Spots can have disease, pest, or environmental causes; keep a note of when they appeared and ask a local expert to identify the cause.",
  yellowing: "Note whether older or newer leaves are affected and check soil moisture and drainage. Yellowing can have nutrient, water, root, pest, or disease causes; avoid adding fertilizer until the cause is checked.",
  wilting: "Check soil moisture before watering: dry soil and waterlogged soil can both cause wilting. Inspect the stem base and roots if practical, and ask an expert if several plants are affected.",
  insects: "Photograph the insect and leaf damage, and inspect a few plants. Ask an expert to identify the pest before applying any pesticide or other treatment.",
  other: "Note when the change began, how it has spread, and which plant parts are affected. Photograph the whole plant and a close-up, then ask a local expert to help identify possible causes."
};

const fertilizerProducts = {
  urea: { name: "Urea", nutrients: { N: 0.46 }, extra: "Supplies nitrogen only in this calculation." },
  ammoniumsulfate: { name: "ammonium sulfate", nutrients: { N: 0.21 }, extra: "A common grade also supplies about 24% sulfur; verify the guaranteed analysis on your bag." },
  can: { name: "CAN", nutrients: { N: 0.26 }, extra: "CAN grades vary; this estimate uses a typical 26% N grade. Verify the guaranteed analysis on your bag." },
  dap: { name: "DAP", nutrients: { P2O5: 0.46 }, extra: "Verify the guaranteed analysis on your bag." },
  ssp: { name: "SSP", nutrients: { P2O5: 0.16 }, extra: "At a common grade, it also supplies sulfur and calcium. Verify the guaranteed analysis on your bag." },
  mop: { name: "MOP", nutrients: { K2O: 0.60 }, extra: "Potassium is declared as K2O equivalent. Verify the guaranteed analysis on your bag." },
  sop: { name: "SOP", nutrients: { K2O: 0.50 }, extra: "A common grade also supplies about 17–18% sulfur; verify the guaranteed analysis on your bag." },
  npk191919: { name: "NPK 19:19:19", nutrients: { N: 0.19, P2O5: 0.19, K2O: 0.19 }, extra: "Count all nutrients supplied by this grade in the crop plan to avoid over-application." }
};

const nutrientLabels = { N: "N", P2O5: "P₂O₅", K2O: "K₂O" };

const expertDialog = document.querySelector("#expert-dialog");

document.querySelectorAll("[data-open-expert]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelector("#expert-status").textContent = "";
    expertDialog.showModal();
  });
});

document.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    document.querySelectorAll(".nav-link").forEach((item) => item.classList.remove("active"));
    link.classList.add("active");
  });
});

document.querySelector("#expert-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const area = String(data.get("area")).trim();
  const topic = String(data.get("topic"));
  document.querySelector("#expert-status").textContent =
    `Enquiry prepared for ${area}: “${topic}”. No information was sent; connect a verified local helpline to enable follow-up.`;
  event.currentTarget.reset();
});

document.querySelector("#crop-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const area = String(data.get("location")).trim();
  const ph = Number(data.get("ph"));
  const soil = String(data.get("soil"));
  if (!Number.isFinite(ph) || ph < 0 || ph > 14) return;
  const soilNames = {
    loamy: "loamy",
    sandy: "sandy",
    clayey: "clayey",
    unknown: "unspecified"
  };
  const waterNames = {
    limited: "limited or rainfall-dependent water",
    moderate: "some regular irrigation",
    reliable: "reliable water access"
  };
  const water = String(data.get("water"));
  const candidates = cropPhRanges.filter((crop) => ph >= crop.min && ph <= crop.max);
  const result = document.querySelector("#crop-results");
  const phClass = ph < 5.5
    ? "acidic"
    : ph < 6.5
      ? "slightly acidic"
      : ph <= 7.5
        ? "near neutral"
        : ph <= 8.5
          ? "alkaline"
          : "strongly alkaline";
  const cropList = candidates.length
    ? `<ul class="crop-match-list">${candidates.map((crop) => `<li><strong>${escapeHtml(crop.name)}</strong><span>Approx. preferred soil pH: ${crop.min.toFixed(1)}–${crop.max.toFixed(1)}</span></li>`).join("")}</ul>`
    : "<p>No crops in this general example list have a preferred pH range that includes this value.</p>";
  const highOrLowPhNote = ph < 5.5 || ph > 8.0
    ? " This pH is at an extreme for many crops; ask a local soil specialist to review the full report before selecting a crop or attempting soil amendments."
    : "";
  result.innerHTML = `<strong>Initial pH screen for ${escapeHtml(area)}:</strong> pH ${ph.toFixed(1)} (${phClass}); ${soilNames[soil]} soil; ${waterNames[water]}. <span class="crop-match-heading">Crop examples with broad preferred pH ranges that include this result:</span>${cropList}<p>These are candidates to discuss, not a guarantee they will grow well on this land. Check the report’s nutrient levels and salinity, climate, planting season, water needs, crop variety, and local crop guidance before deciding.${highOrLowPhNote}</p>`;
  result.classList.add("visible");
});

document.querySelector("#action-plan-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const location = String(data.get("location")).trim();
  const crop = String(data.get("crop"));
  const phValue = String(data.get("ph")).trim();
  const ph = phValue === "" ? null : Number(phValue);
  const soil = String(data.get("soil"));
  const water = String(data.get("water"));
  const stage = String(data.get("stage"));
  const symptom = String(data.get("symptom"));
  const plantingDateValue = String(data.get("plantingDate"));
  const result = document.querySelector("#action-plan-result");

  if (ph !== null && (!Number.isFinite(ph) || ph < 0 || ph > 14)) return;

  const soilLabels = { loamy: "loamy", sandy: "sandy", clayey: "clayey", unknown: "not yet confirmed" };
  const waterActions = {
    limited: "Water is limited: check the local forecast, soil moisture, water-use restrictions, and crop priority. Explore a suitable efficient system before investing; do not assume a fixed watering schedule.",
    moderate: "Some irrigation is available: monitor soil moisture and crop stage, check the system for leaks, and adjust timing to local weather and crop needs.",
    reliable: "Water is available: avoid overwatering and waterlogging. Match irrigation timing to soil moisture, crop stage, drainage, and weather, and follow local water-use rules."
  };
  const stageActions = {
    "Seedling / early growth": "Protect young plants and check establishment, soil moisture, and weeds. Use only the crop-specific nutrient plan for this stage.",
    "Vegetative growth": "Track new growth and check water, weeds, and nutrient needs against the soil-test recommendation. Do not treat leaf color alone as proof of a nutrient deficiency.",
    Flowering: "Avoid unnecessary stress during flowering. Monitor water and pests, and follow only locally recommended nutrient timing.",
    "Fruiting / grain filling": "Monitor crop development, water stress, and pests. Check the crop-specific guidance for nutrient timing and pre-harvest restrictions.",
    "Near harvest": "Check crop-specific maturity signs and the product label for any pre-harvest interval after treatments. Do not apply fertilizer or pesticides without a clear local recommendation.",
    "Not planted yet": "Before planting, confirm local planting dates, seed variety, soil condition, water access, rotation, and market needs with an agriculture advisor."
  };
  const cropNameForRange = { Rice: "Rice", Maize: "Maize", Tomato: "Tomato", Wheat: "Wheat", Potato: "Potato" };
  const cropRange = cropPhRanges.find((item) => item.name === cropNameForRange[crop]);
  let soilSection;
  if (ph === null) {
    soilSection = "No pH entered. Get a representative soil test if possible; use the full report (pH, nutrients, and salinity) before choosing crops or fertilizer.";
  } else if (!cropRange) {
    soilSection = `Soil pH is ${ph.toFixed(1)}. This prototype does not have a crop pH range for ${escapeHtml(crop)}, so ask a local agriculture advisor to interpret the full soil report for your crop.`;
  } else if (ph >= cropRange.min && ph <= cropRange.max) {
    soilSection = `Soil pH ${ph.toFixed(1)} falls within the broad example range for ${escapeHtml(crop)} (${cropRange.min.toFixed(1)}–${cropRange.max.toFixed(1)}). This is only a pH screen; confirm nutrients, salinity, soil texture, climate, season, and variety before planting.`;
  } else {
    soilSection = `Soil pH ${ph.toFixed(1)} is outside the broad example range shown for ${escapeHtml(crop)} (${cropRange.min.toFixed(1)}–${cropRange.max.toFixed(1)}). This does not rule out the crop, but get local advice on the full soil report before investing or changing soil pH.`;
  }

  const symptomSection = symptom
    ? symptomNotes[symptom]
    : "No visible symptom selected. Walk the field regularly and note changes in several plants; if a problem appears, photograph the whole plant and a close-up.";
  const photoSection = photoInput.files?.length
    ? "A plant photo is attached in the plant-health tool. This prototype does not analyze photos; have a local expert confirm the cause before treatment."
    : "If plants look unhealthy, take a clear photo of the whole plant and affected area in the plant-health section. A photo alone cannot confirm the cause.";
  let harvestSection = "No planting date supplied; use crop-specific maturity signs and local variety guidance to plan harvest.";
  if (plantingDateValue && harvestDays[crop.toLowerCase()]) {
    const plantingDate = new Date(`${plantingDateValue}T12:00:00`);
    if (!Number.isNaN(plantingDate.getTime())) {
      const [earliestDays, latestDays] = harvestDays[crop.toLowerCase()];
      const earliest = new Date(plantingDate);
      const latest = new Date(plantingDate);
      earliest.setDate(earliest.getDate() + earliestDays);
      latest.setDate(latest.getDate() + latestDays);
      const dateFormatter = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" });
      harvestSection = `Broad calendar estimate: ${dateFormatter.format(earliest)}–${dateFormatter.format(latest)}. Check maturity in the field; this is not a harvest guarantee.`;
    }
  }

  result.innerHTML = `
    <div class="action-plan-header"><span class="action-plan-badge">YOUR STARTING CHECKLIST</span><h3>Next steps for ${escapeHtml(location)}</h3><p>${escapeHtml(crop)} · ${escapeHtml(stage)} · ${escapeHtml(soilLabels[soil])} soil</p></div>
    <div class="action-plan-steps">
      <article class="action-step"><span class="action-step-number">01</span><div><h4>Check crop and soil fit</h4><p>${soilSection}</p><a href="#crop-planner">Review the crop planner →</a></div></article>
      <article class="action-step"><span class="action-step-number">02</span><div><h4>Manage water for this field</h4><p>${waterActions[water]}</p><a href="#water-plan">Compare irrigation options →</a></div></article>
      <article class="action-step"><span class="action-step-number">03</span><div><h4>Respond to plant symptoms safely</h4><p>${escapeHtml(symptomSection)} ${escapeHtml(photoSection)}</p><a href="#plant-health">Open plant-health check →</a></div></article>
      <article class="action-step"><span class="action-step-number">04</span><div><h4>Use inputs based on evidence</h4><p>${escapeHtml(stageActions[stage])} A symptom or photo alone cannot determine a fertilizer product or dose. Use the rate from the soil report or local advisor in the per-acre converter, and follow the exact product label.</p><a href="#fertilizers">Review fertilizer guide and calculator →</a></div></article>
      <article class="action-step"><span class="action-step-number">05</span><div><h4>Plan and verify harvest</h4><p>${escapeHtml(harvestSection)}</p><a href="#harvest">Open harvest calendar →</a></div></article>
      <article class="action-step"><span class="action-step-number">06</span><div><h4>Build practical farm skills</h4><p>Learn about soil testing, weather alerts, water-saving practices, record keeping, and shared equipment before investing in new technology.</p><a href="#technology">Explore the farm technology guide →</a></div></article>
    </div>
    <div class="action-plan-footer"><strong>Local confirmation matters.</strong> Confirm crop choice, nutrient rates, irrigation permissions, and any treatment with the agriculture office or Kisan Call Center before spending money or applying inputs. <a href="tel:18001801551">Call 1800-180-1551</a> or <a href="tel:1551">1551</a> (India; 6:00 AM–10:00 PM daily, as listed in this app).</div>`;
  result.classList.add("visible");
});

const photoInput = document.querySelector("#plant-photo");
const photoPreview = document.querySelector("#photo-preview");
let photoUrl;

photoInput.addEventListener("change", () => {
  const file = photoInput.files?.[0];
  document.querySelector("#photo-status").textContent = "";
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    photoInput.value = "";
    photoPreview.classList.remove("visible");
    document.querySelector("#photo-status").textContent = "Please choose an image file.";
    return;
  }
  if (photoUrl) URL.revokeObjectURL(photoUrl);
  photoUrl = URL.createObjectURL(file);
  photoPreview.innerHTML = `<img src="${photoUrl}" alt="Preview of selected plant photo"><span>${escapeHtml(file.name)}</span>`;
  photoPreview.classList.add("visible");
});

document.querySelector("#prepare-enquiry").addEventListener("click", () => {
  const photo = photoInput.files?.[0];
  const crop = document.querySelector("#health-crop").value;
  const stage = document.querySelector("#health-stage").value;
  const symptom = document.querySelector("#symptom").value;
  const status = document.querySelector("#photo-status");
  if (!photo) {
    status.textContent = "Take or choose a clear plant photo first, then select the closest symptom.";
    photoInput.focus();
    return;
  }
  if (!symptom) {
    status.textContent = "Choose the closest symptom you can see so we can show relevant checking steps.";
    document.querySelector("#symptom").focus();
    return;
  }
  if (!crop) {
    status.textContent = "Choose the affected crop so the information is useful when checking the plant.";
    document.querySelector("#health-crop").focus();
    return;
  }
  if (!stage) {
    status.textContent = "Choose the plant’s current growth stage.";
    document.querySelector("#health-stage").focus();
    return;
  }
  status.innerHTML = `<strong>Photo added for ${escapeHtml(crop)} at ${escapeHtml(stage.toLowerCase())}.</strong> <strong>First checks for this symptom:</strong> ${escapeHtml(symptomNotes[symptom])} The photo is not analyzed by this prototype, so this is not a diagnosis. A photo alone cannot determine fertilizer type or dose. Use a soil test and crop-specific local recommendation before applying fertilizer; if symptoms spread, contact a qualified local agriculture expert.`;
});

document.querySelector("#fertilizer-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const crop = String(data.get("crop"));
  const productKey = String(data.get("product"));
  const nutrient = String(data.get("nutrient"));
  const rate = Number(data.get("rate"));
  const product = fertilizerProducts[productKey];
  const result = document.querySelector("#fertilizer-result");
  if (!product || !(nutrient in product.nutrients)) {
    result.innerHTML = "<strong>This product does not supply the selected nutrient in its listed grade.</strong> Choose a matching product and nutrient, and check the product label.";
    result.classList.add("visible");
    return;
  }
  if (!Number.isFinite(rate) || rate <= 0 || rate > 500) return;
  const productRate = rate / product.nutrients[nutrient];
  const extraNutrient = productKey === "npk191919"
    ? ` It also supplies approximately ${ (productRate * 0.19).toFixed(1) } kg/acre each of N, P₂O₅, and K₂O; account for all three in the recommendation.`
    : productKey === "dap" && nutrient === "P2O5"
      ? ` At the common 18-46-0 grade, it also supplies approximately ${(productRate * 0.18).toFixed(1)} kg N/acre.`
      : "";
  result.innerHTML = `<strong>Arithmetic estimate for ${escapeHtml(crop)}:</strong> ${rate.toFixed(1)} kg ${nutrientLabels[nutrient]}/acre ÷ ${(product.nutrients[nutrient] * 100).toFixed(0)}% = about ${productRate.toFixed(1)} kg of ${escapeHtml(product.name)} product per acre.${extraNutrient} ${escapeHtml(product.extra)} This does not confirm the recommended rate is appropriate for this crop or field.`;
  result.classList.add("visible");
});

document.querySelectorAll(".water-option").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".water-option").forEach((item) => item.classList.remove("selected"));
    button.classList.add("selected");
    const method = button.dataset.method;
    const dripOptions = document.querySelector("#drip-types");
    const isDrip = method === "drip";
    dripOptions.hidden = !isDrip;
    if (isDrip) {
      const selectedType = document.querySelector(".drip-type.selected")?.dataset.dripType ?? "surface";
      document.querySelector("#water-detail-copy").textContent = irrigationNotes.drip[selectedType];
    } else {
      document.querySelector("#water-detail-copy").textContent = irrigationNotes[method];
    }
  });
});

document.querySelectorAll(".drip-type").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".drip-type").forEach((item) => item.classList.remove("selected"));
    button.classList.add("selected");
    document.querySelector("#water-detail-copy").textContent = irrigationNotes.drip[button.dataset.dripType];
  });
});

document.querySelector("#harvest-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const crop = String(data.get("crop"));
  const plantingDate = new Date(`${data.get("plantingDate")}T12:00:00`);
  if (Number.isNaN(plantingDate.getTime())) return;
  const [earliestDays, latestDays] = harvestDays[crop];
  const earliest = new Date(plantingDate);
  const latest = new Date(plantingDate);
  earliest.setDate(earliest.getDate() + earliestDays);
  latest.setDate(latest.getDate() + latestDays);
  const formatter = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" });
  const result = document.querySelector("#harvest-result");
  result.innerHTML = `<strong>Broad example window for ${escapeHtml(crop)}:</strong> ${formatter.format(earliest)} – ${formatter.format(latest)}. Check crop-specific maturity signs in your field; this estimate is not a harvest guarantee.`;
  result.classList.add("visible");
});

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}
