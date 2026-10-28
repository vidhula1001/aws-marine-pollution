// KMPS — Kerala Marine Pollution Surveillance
// app.js

// ── DATASET ───────────────────────────────────────────────────────────────────
const INC = [
  { id:"KL-001", title:"Large Tanker Discharge",           location:"Kochi Harbour",           lat:9.9644,  lng:76.2437, type:"Oil Spill",          sev:"High",   status:"ACTIVE",              date:"2024-01-14", area:42, desc:"Large tanker discharge near Willingdon Island. Heavy crude oil detected on surface.",           dist:"Kochi" },
  { id:"KL-002", title:"Mass Plastic Accumulation",        location:"Alappuzha Beach",          lat:9.4981,  lng:76.3388, type:"Plastic Waste",      sev:"Medium", status:"RESOLVED",            date:"2024-02-03", area:8,  desc:"Mass plastic accumulation post-monsoon flush from inland waterways.",                          dist:"Alappuzha" },
  { id:"KL-003", title:"Bunkering Vessel Spill",           location:"Kollam Port",              lat:8.8932,  lng:76.6141, type:"Oil Spill",          sev:"High",   status:"CONTAINED",           date:"2024-02-19", area:35, desc:"Bunkering vessel spill. Thick oil slick spreading southward along coast.",                     dist:"Kollam" },
  { id:"KL-004", title:"Industrial Effluent Discharge",     location:"Kozhikode Beypore",        lat:11.1764, lng:75.8022, type:"Chemical Pollution", sev:"High",   status:"CONTAINED",           date:"2024-03-08", area:18, desc:"Industrial effluent discharge. Elevated pH and heavy metals detected.",                        dist:"Kozhikode" },
  { id:"KL-005", title:"Noctiluca Bloom & Fish Kill",      location:"Varkala Cliff Coast",      lat:8.7379,  lng:76.7163, type:"Algal Bloom",        sev:"Medium", status:"RESOLVED",            date:"2024-03-22", area:12, desc:"Noctiluca scintillans bloom causing hypoxic zones. Fish kill reported.",                       dist:"Kollam" },
  { id:"KL-006", title:"Fishing Trawler Malfunction",      location:"Kannur Mappila Bay",       lat:11.8745, lng:75.3704, type:"Oil Spill",          sev:"Medium", status:"RESOLVED",            date:"2024-04-05", area:22, desc:"Fishing trawler engine malfunction. Diesel and bilge water contamination.",                    dist:"Kannur" },
  { id:"KL-007", title:"Routine Shoreline Micro-Plastics", location:"Thrissur Ponnani Coast",   lat:10.7767, lng:75.9131, type:"Plastic Waste",      sev:"Low",    status:"RESOLVED",            date:"2024-04-17", area:5,  desc:"Routine shoreline accumulation. Micro-plastics found in tidal zone.",                         dist:"Thrissur" },
  { id:"KL-008", title:"Offshore Pipeline Breach",         location:"Kochi Vypeen Island",      lat:10.0869, lng:76.1717, type:"Oil Spill",          sev:"High",   status:"ACTIVE",              date:"2024-05-09", area:55, desc:"Pipeline breach at offshore platform. Satellite confirmed 55 sq km slick.",                   dist:"Kochi" },
  { id:"KL-009", title:"Pesticide Runoff Contamination",   location:"Kasaragod Bekal Coast",    lat:12.3970, lng:75.0298, type:"Chemical Pollution", sev:"Medium", status:"CONTAINED",           date:"2024-05-25", area:9,  desc:"Pesticide runoff from cashew plantations detected in coastal waters.",                        dist:"Kasaragod" },
  { id:"KL-010", title:"Backwaters Green Algal Bloom",     location:"Alappuzha Kumarakom",      lat:9.6158,  lng:76.4311, type:"Algal Bloom",        sev:"Low",    status:"RESOLVED",            date:"2024-06-12", area:7,  desc:"Green algal bloom in backwaters due to high nutrient runoff.",                               dist:"Alappuzha" },
  { id:"KL-011", title:"Stranded Ghost Fishing Nets",      location:"Kollam Thangassery",       lat:8.9028,  lng:76.5850, type:"Plastic Waste",      sev:"High",   status:"RESOLVED",            date:"2024-07-04", area:14, desc:"Ghost fishing nets and large debris stranded on coast after storm.",                          dist:"Kollam" },
  { id:"KL-012", title:"Cargo Vessel Bilge Pumping",       location:"Kozhikode Kappad Beach",   lat:11.3112, lng:75.7264, type:"Oil Spill",          sev:"High",   status:"ACTIVE",              date:"2024-07-28", area:31, desc:"Cargo vessel bilge pumping in restricted zone. Confirmed by coast guard.",                    dist:"Kozhikode" },
  { id:"KL-013", title:"Antifouling Paint Leeching",       location:"Thrissur Munambam Harbour",lat:10.1982, lng:76.1726, type:"Chemical Pollution", sev:"Low",    status:"RESOLVED",            date:"2024-08-14", area:4,  desc:"Low-level antifouling paint leeching from boat hulls in marina.",                            dist:"Thrissur" },
  { id:"KL-014", title:"Tourist Season Intertidal Litter", location:"Kochi Cherai Beach",       lat:10.1417, lng:76.1886, type:"Plastic Waste",      sev:"Medium", status:"RESOLVED",            date:"2024-09-03", area:6,  desc:"Tourist season litter. Single-use plastics in inter-tidal zone.",                            dist:"Kochi" },
  { id:"KL-015", title:"Boat Fuel Monsoon Spill",          location:"Kannur Dharmadom",         lat:11.8611, lng:75.3730, type:"Oil Spill",          sev:"Medium", status:"CONTAINED",           date:"2024-10-16", area:16, desc:"Boat fuel spill during heavy monsoon. Oil-water emulsion over 16 sq km.",                     dist:"Kannur" },
];

// ── AWS BACKEND INTEGRATION ARCHITECTURE ──────────────────────────────────────
// To connect to a live AWS backend:
// 1. Create an Amazon API Gateway REST/HTTP API with Lambda integrations and Amazon DynamoDB.
// 2. Define window.AWS_INCIDENTS_API_ENDPOINT = "https://<api-id>.execute-api.<region>.amazonaws.com/<stage>/incidents"
// When unconfigured (default), the dashboard operates in clearly labeled Local Demo Session mode.
const AWS_CONFIG = {
  get endpoint() {
    return (typeof window !== "undefined" && window.AWS_INCIDENTS_API_ENDPOINT) || "";
  },
  get isConfigured() {
    return Boolean(this.endpoint && this.endpoint.trim().startsWith("https://"));
  }
};

// Convert an AWS incident into the format used by the dashboard.
function fromBackendIncident(item) {
  const backendStatus = String(item.status || "REPORTED").toUpperCase();

  // Keep the dashboard's existing ACTIVE / CONTAINED / RESOLVED labels.
  const displayStatus = {
    REPORTED: "ACTIVE",
    UNDER_INVESTIGATION: "CONTAINED",
    RESOLVED: "RESOLVED"
  }[backendStatus] || "ACTIVE";

  const severity = String(item.severity || "MEDIUM").toUpperCase();

  return {
    id: String(item.incidentId),
    title: item.title || "Marine pollution incident",
    description: item.description || "",
    desc: item.description || "",
    location: item.location || "Unknown location",
    lat: Number(item.latitude),
    lng: Number(item.longitude),
    sev: ({
      LOW: "Low",
      MEDIUM: "Medium",
      HIGH: "High",
      CRITICAL: "Critical"
    })[severity] || "Medium",
    status: displayStatus,
    backendStatus,
    area: Number(item.affectedAreaKm2 || 0),
    date: String(item.createdAt || new Date().toISOString()).slice(0, 10),
    dist: String(item.location || "Kerala Coast").split(/[ ,]/)[0],
    type: item.type || "Oil Spill",
    source: "backend",
    isLocalDemo: false
  };
}

// Convert dashboard status labels into values accepted by AWS.
function toBackendStatus(status) {
  const value = String(status || "").toUpperCase();

  if (value === "ACTIVE" || value === "REPORTED") {
    return "REPORTED";
  }

  if (value === "CONTAINED" || value === "UNDER_INVESTIGATION") {
    return "UNDER_INVESTIGATION";
  }

  if (value === "RESOLVED") {
    return "RESOLVED";
  }

  throw new Error("Unsupported incident status: " + status);
}

// Fetch all incidents from AWS.
async function loadBackendIncidents() {
  const response = await fetch(AWS_CONFIG.endpoint, {
    method: "GET",
    headers: {
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error("Could not load incidents. HTTP " + response.status);
  }

  const data = await response.json();
  const items = Array.isArray(data) ? data : data.items;

  if (!Array.isArray(items)) {
    throw new Error("Unexpected response from GET /incidents");
  }

  // Replace the sample data with the backend's actual records.
  INC.splice(
    0,
    INC.length,
    ...items.map(fromBackendIncident)
  );

  return INC;
}

// Fetch one incident using its AWS incidentId.
async function getAWSIncident(incidentId) {
  const response = await fetch(
    `${AWS_CONFIG.endpoint}/${encodeURIComponent(incidentId)}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json"
      }
    }
  );

  if (!response.ok) {
    throw new Error("Could not fetch incident. HTTP " + response.status);
  }

  const data = await response.json();
  const item = data.item || data;

  return fromBackendIncident(item);
}

// Update an incident's status in AWS.
async function updateIncidentStatus(incidentId, newStatus) {
  if (!AWS_CONFIG.isConfigured) {
    showFeedback("AWS backend is not configured.", "error");
    return;
  }

  try {
    const backendStatus = toBackendStatus(newStatus);

    const response = await fetch(
      `${AWS_CONFIG.endpoint}/${encodeURIComponent(incidentId)}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({
          status: backendStatus
        })
      }
    );

    if (!response.ok) {
      const message = await response.text();
      throw new Error(message || "HTTP " + response.status);
    }

    const data = await response.json();
    const savedItem = data.item;

    if (!savedItem) {
      throw new Error("Unexpected response from PATCH endpoint.");
    }

    const updatedIncident = fromBackendIncident(savedItem);
    const index = INC.findIndex(
      incident => String(incident.id) === String(incidentId)
    );

    if (index !== -1) {
      INC[index] = updatedIncident;
    }

    // Refresh the existing dashboard components.
    buildAlerts();
    buildResp();
    updateDashboardData();

    showFeedback("Incident status updated successfully.", "success");
  } catch (error) {
    console.error("Status update failed:", error);
    showFeedback(
      "Could not update incident status: " + error.message,
      "error"
    );
  }
}

// Show a visible error if loading incidents from AWS fails.
function showLoadError(message) {
  console.error("AWS incident loading error:", message);

  const label = document.getElementById("stat-source-label");

  if (label) {
    label.textContent = "AWS configured — unable to load live records";
  }
}

const SH = {
  all: null,
  fishermen: {
    tag:"FISHERMEN", ttl:"Fishing Safety & Impact",
    txt:"Safety zones, income loss, and days-at-sea restrictions. Red zones indicate active Coast Guard advisories.",
    pills:["4 RESTRICTED ZONES","38 LOST FISHING DAYS","3 FISH KILL EVENTS"],
    metrics:[
      { lbl:"RESTRICTED ZONES", val:"4",  sub:"Active no-fish advisories",   pct:40 },
      { lbl:"DAYS LOST",        val:"38", sub:"Across all affected fleets",  pct:63 },
      { lbl:"FISH KILL EVENTS", val:"3",  sub:"Hypoxia / oil exposure",      pct:30 },
    ],
    col:"Fishing",
    fn: i => {
      if (i.type === "Oil Spill" && i.sev === "High") return "RESTRICTED";
      if (i.type === "Algal Bloom") return "FISH KILL";
      if (i.sev === "Medium") return "CAUTION";
      return "MONITOR";
    },
    cls: i => {
      const v = SH.fishermen.fn(i);
      return v === "RESTRICTED" ? "danger" : (v === "FISH KILL" || v === "CAUTION") ? "caution" : "safe";
    },
  },
  government: {
    tag:"GOVERNMENT", ttl:"Regulatory & Response View",
    txt:"Response status, cleanup costs, violations, and repeat-offender districts for regulatory action.",
    pills:["5 ACTIVE INCIDENTS","3 CONTAINED","7 RESOLVED","RS 24CR EST."],
    metrics:[
      { lbl:"ACTIVE INCIDENTS",   val:"5",     sub:"Requiring immediate response", pct:33 },
      { lbl:"AVG RESPONSE TIME",  val:"4.2d",  sub:"Detection to containment",     pct:42 },
      { lbl:"EST. CLEANUP COST",  val:"₹24Cr", sub:"Across 2024 incidents",        pct:72 },
    ],
    col:"Response",
    fn: i => {
      if (i.sev === "High" && ["KL-001","KL-008","KL-012"].includes(i.id)) return "ACTIVE";
      if (i.sev === "High" || i.sev === "Medium") return "CONTAINED";
      return "RESOLVED";
    },
    cls: i => {
      const v = SH.government.fn(i);
      return v === "ACTIVE" ? "danger" : v === "CONTAINED" ? "caution" : "safe";
    },
  },
  tourism: {
    tag:"TOURISM", ttl:"Beach Safety & Visitor Impact",
    txt:"Safety ratings based on proximity to active incidents. Red triggers visitor advisories.",
    pills:["3 RED-RATED BEACHES","4 AMBER WARNINGS","6 BEACHES CLEAR"],
    metrics:[
      { lbl:"BEACHES AFFECTED", val:"7",    sub:"Within 10km of active incident", pct:54 },
      { lbl:"EST. TOURIST LOSS",val:"₹9Cr", sub:"Monthly revenue impact",         pct:45 },
      { lbl:"CLEAR BEACHES",    val:"6",    sub:"Currently safe for visitors",     pct:46 },
    ],
    col:"Beach",
    fn: i => {
      if (i.type === "Oil Spill" && i.sev === "High") return "DANGER";
      if (i.type === "Chemical Pollution" || i.sev === "High") return "WARNING";
      if (i.sev === "Medium") return "ADVISORY";
      return "CLEAR";
    },
    cls: i => {
      const v = SH.tourism.fn(i);
      return v === "DANGER" ? "danger" : (v === "WARNING" || v === "ADVISORY") ? "caution" : "safe";
    },
  },
  residents: {
    tag:"RESIDENTS", ttl:"Community Health Risk View",
    txt:"Health risk by district. Chemical and algal incidents pose elevated water and respiratory risks.",
    pills:["2 AIR QUALITY ALERTS","3 WATER ADVISORIES","KOCHI: HIGH RISK"],
    metrics:[
      { lbl:"HIGH-RISK DISTRICTS", val:"3",   sub:"Kochi, Kollam, Kozhikode",    pct:43 },
      { lbl:"WATER ADVISORIES",    val:"3",   sub:"Boil-water notices active",   pct:30 },
      { lbl:"AVG HEALTH INDEX",    val:"6.4", sub:"Out of 10 — lower is safer",  pct:64 },
    ],
    col:"Health",
    fn: i => {
      if (i.type === "Chemical Pollution") return "HIGH RISK";
      if (i.type === "Algal Bloom") return "MODERATE";
      if (i.type === "Oil Spill" && i.sev === "High") return "MODERATE";
      return "LOW";
    },
    cls: i => {
      const v = SH.residents.fn(i);
      return v === "HIGH RISK" ? "danger" : v === "MODERATE" ? "caution" : "safe";
    },
  },
};

const BEACH = [
  { n:"Cherai Beach",       d:"Kochi",     nr:"KL-001", s:"danger"  },
  { n:"Kappad Beach",       d:"Kozhikode", nr:"KL-012", s:"danger"  },
  { n:"Varkala Beach",      d:"Kollam",    nr:"KL-005", s:"caution" },
  { n:"Alappuzha Beach",    d:"Alappuzha", nr:"KL-002", s:"caution" },
  { n:"Mappila Bay",        d:"Kannur",    nr:"KL-006", s:"caution" },
  { n:"Bekal Beach",        d:"Kasaragod", nr:"KL-009", s:"caution" },
  { n:"Thangassery Beach",  d:"Kollam",    nr:null,     s:"safe"    },
  { n:"Muzhappilangad",     d:"Kannur",    nr:null,     s:"safe"    },
  { n:"Marari Beach",       d:"Alappuzha", nr:null,     s:"safe"    },
];

const HEALTH = [
  { d:"Kochi",     s:8.2, c:"var(--crit)" },
  { d:"Kollam",    s:7.6, c:"var(--crit)" },
  { d:"Kozhikode", s:7.1, c:"var(--warn)" },
  { d:"Kannur",    s:5.8, c:"var(--warn)" },
  { d:"Alappuzha", s:4.9, c:"var(--warn)" },
  { d:"Thrissur",  s:3.4, c:"var(--safe)" },
  { d:"Kasaragod", s:4.1, c:"var(--safe)" },
];

const RS = {
  "KL-001":"active",   "KL-002":"resolved",  "KL-003":"contained", "KL-004":"contained",
  "KL-005":"resolved", "KL-006":"resolved",  "KL-007":"resolved",  "KL-008":"active",
  "KL-009":"contained","KL-010":"resolved",  "KL-011":"resolved",  "KL-012":"active",
  "KL-013":"resolved", "KL-014":"resolved",  "KL-015":"contained",
};
const RD = {
  "KL-001":3, "KL-002":7,  "KL-003":5,  "KL-004":4,  "KL-005":6,  "KL-006":8,
  "KL-007":12,"KL-008":2,  "KL-009":9,  "KL-010":14, "KL-011":5,  "KL-012":1,
  "KL-013":18,"KL-014":10, "KL-015":4,
};

const TI = {
  "Oil Spill":          "fa-oil-can",
  "Plastic Waste":      "fa-recycle",
  "Chemical Pollution": "fa-flask",
  "Algal Bloom":        "fa-leaf",
};
const SC = {
  High: "var(--crit)",
  Critical: "var(--crit)",
  Medium: "var(--warn)",
  Low: "var(--safe)"
};
const KC  = [10.2, 76.2];
const KZ  = 7;

let view = "all", filt = "all", mkrs = [], map, osmL, satL, sat = false, tblOpen = false;
let isSubmitting = false, isMapPicking = false;

// ── INIT ──────────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", async () => {
  clock();
  initMap();
  initCharts();
  buildBeach();
  buildHealth();
  bind();

  if (AWS_CONFIG.isConfigured) {
    try {
      await loadBackendIncidents();
    } catch (error) {
      console.error("Could not load incidents from AWS:", error);
      const label = document.getElementById("stat-source-label");
      if (label) label.textContent = "AWS configured — unable to load live records";
      showLoadError(error.message);
    }
  }

  buildAlerts();
  buildResp();
  switchView("all");
  updateDashboardData();
  document.getElementById("last-upd").textContent =
    new Date().toLocaleTimeString("en-IN", { hour:"2-digit", minute:"2-digit" });
});

// ── CLOCK ─────────────────────────────────────────────────────────────────────
function clock() {
  const tick = () => {
    const n = new Date();
    document.getElementById("live-time").textContent =
      n.toLocaleTimeString("en-IN", { hour12:false });
    document.getElementById("live-date").textContent =
      n.toLocaleDateString("en-IN", { day:"2-digit", month:"short" }) + " IST";
  };
  tick();
  setInterval(tick, 1000);
}

// ── ANIMATED COUNTERS & SUMMARY CARDS ─────────────────────────────────────────
// Calculates summary metrics dynamically from the loaded dataset
function animCnt(data) {
  const tot  = data.length;
  const hi   = data.filter(i => i.sev === "High").length;
  const inv  = data.filter(i => {
    const s = (i.status || RS[i.id] || "").toUpperCase();
    return s === "UNDER_INVESTIGATION" || s === "REPORTED" || s === "ACTIVE";
  }).length;
  const res  = data.filter(i => {
    const s = (i.status || RS[i.id] || "").toUpperCase();
    return s === "RESOLVED";
  }).length;
  const area = Math.round(data.reduce((s, i) => s + (Number(i.area) || 0), 0) * 10) / 10;
  const oil  = data.filter(i => i.type === "Oil Spill").length;

  const targets = [
    ["s-tot",  tot,  ""],
    ["s-hi",   hi,   ""],
    ["s-inv",  inv,  ""],
    ["s-res",  res,  ""],
    ["s-area", area, " km²"],
    ["s-oil",  oil,  ""],
    ["b-tot",  tot,  ""],
    ["b-hi",   hi,   ""],
    ["b-inv",  inv,  ""],
    ["b-res",  res,  ""],
    ["b-area", area, " km²"]
  ];

  targets.forEach(([id, end, sfx]) => {
    const el = document.getElementById(id);
    if (!el) return;
    let c = 0;
    const steps = Math.ceil(400 / 16);
    const tm = setInterval(() => {
      c++;
      const v = Math.round((1 - Math.pow(1 - c / steps, 3)) * end);
      const valEl = el.querySelector(".u") || el.querySelector(".stat-unit");
      if (valEl) {
        el.childNodes[0].textContent = v;
      } else {
        el.textContent = v + sfx;
      }
      if (c >= steps) {
        clearInterval(tm);
        if (valEl) {
          el.childNodes[0].textContent = end;
        } else {
          el.textContent = end + sfx;
        }
      }
    }, 16);
  });

  // Clearly label data provenance
  const hasLocal = INC.some(i => i.isLocalDemo);
  const isCloud = AWS_CONFIG.isConfigured;
  const sourceTag = document.getElementById("data-source-tag");
  const sourceLabel = document.getElementById("stat-source-label");

  if (sourceTag && sourceLabel) {
    if (isCloud) {
      sourceTag.textContent = "AWS CLOUD";
      sourceTag.style.borderColor = "var(--safe)";
      sourceTag.style.color = "var(--safe)";
      sourceLabel.textContent = "Live Backend (AWS DynamoDB)";
    } else if (hasLocal) {
      sourceTag.textContent = "DEMO + LOCAL";
      sourceTag.style.borderColor = "var(--sh)";
      sourceTag.style.color = "var(--sh)";
      sourceLabel.textContent = "Sample Dataset + Local Additions";
    } else {
      sourceTag.textContent = "SAMPLE DEMO";
      sourceTag.style.borderColor = "var(--txt3)";
      sourceTag.style.color = "var(--txt2)";
      sourceLabel.textContent = "Built-in Sample Dataset";
    }
  }
}

// ── MAP ───────────────────────────────────────────────────────────────────────
function initMap() {
  map = L.map("map", {
    center: KC,
    zoom: KZ,
    zoomControl: true
  });

  // OpenStreetMap base layer
  osmL = L.tileLayer(
    "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19
    }
  ).addTo(map);

  // Satellite layer
  satL = L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    {
      attribution: "Tiles &copy; Esri",
      maxZoom: 19
    }
  );

  // Reset map view
  document.getElementById("btn-fit").onclick = () => {
    map.setView(KC, KZ);
  };

  // Toggle between street map and satellite imagery
  document.getElementById("btn-sat").onclick = () => {
    if (sat) {
      map.removeLayer(satL);
      osmL.addTo(map);
    } else {
      map.removeLayer(osmL);
      satL.addTo(map);
    }
    sat = !sat;
    document.getElementById("btn-sat").style.color = sat ? "var(--sh)" : "";
  };
}

function mkIcon(inc) {
  const s  = inc.sev.toLowerCase();
  const ic = TI[inc.type] || "fa-circle";
  return L.divIcon({
    html: `<div class="mk ${s}"><i class="fas ${ic}"></i></div>`,
    className: "", iconSize:[18,18], iconAnchor:[9,9],
  });
}

function mkPop(inc) {
  const s   = inc.sev.toLowerCase();
  const cfg = view !== "all" ? SH[view] : null;
  let sh = "";
  if (cfg) {
    const v = cfg.fn(inc);
    sh = `<div class="pop-sh">${cfg.col}: <strong>${v}</strong></div>`;
  }

  const stRaw = (inc.status || RS[inc.id] || "REPORTED").toUpperCase();
  const stClass = stRaw.toLowerCase();
  const stDisplay = stRaw.replace("_", " ");
  const localBadge = inc.isLocalDemo
    ? `<span class="local-badge" style="margin-left:auto">LOCAL DEMO</span>`
    : "";

  return `<div class="pop">
    <div class="pop-id">
      <i class="fas ${TI[inc.type] || 'fa-triangle-exclamation'}"></i>
      <span>${inc.id}</span>
      ${localBadge}
    </div>
    <div style="font-size:11px;font-weight:600;color:var(--txt);margin-bottom:6px;line-height:1.3">${inc.title || inc.location}</div>
    <div class="pop-row"><span class="pop-k">Location</span><span class="pop-v">${inc.location}</span></div>
    <div class="pop-row"><span class="pop-k">Type</span><span class="pop-v">${inc.type}</span></div>
    <div class="pop-row"><span class="pop-k">Severity</span><span class="pop-sev ${s}">${inc.sev.toUpperCase()}</span></div>
    <div class="pop-row"><span class="pop-k">Status</span><span class="status-tag ${stClass}" style="font-size:8px;padding:1px 5px">${stDisplay}</span></div>
    <div class="pop-row"><span class="pop-k">Area</span><span class="pop-v">${inc.area} km²</span></div>
    <div class="pop-row"><span class="pop-k">Date</span><span class="pop-v">${fmt(inc.date)}</span></div>
    <div class="pop-note">${inc.desc}</div>${sh}
    ${AWS_CONFIG.isConfigured && inc.source === "backend" ? `
      <div style="margin-top:8px;padding-top:7px;border-top:1px solid var(--line)">
        <label style="display:block;font-size:9px;color:var(--txt2);margin-bottom:4px">Update incident status</label>
        <div style="display:flex;gap:5px">
          <select id="status-${inc.id}" style="min-width:0;flex:1;background:var(--ocean);color:var(--txt);border:1px solid var(--line);padding:4px;font-size:10px">
            <option value="REPORTED" ${inc.backendStatus === "REPORTED" ? "selected" : ""}>Reported</option>
            <option value="UNDER_INVESTIGATION" ${inc.backendStatus === "UNDER_INVESTIGATION" ? "selected" : ""}>Under investigation</option>
            <option value="RESOLVED" ${inc.backendStatus === "RESOLVED" ? "selected" : ""}>Resolved</option>
          </select>
          <button type="button" onclick="updateIncidentStatus('${inc.id}', document.getElementById('status-${inc.id}').value)" style="background:var(--safe-d);color:var(--safe);border:1px solid var(--safe);padding:4px 7px;font-size:9px;cursor:pointer">Save</button>
        </div>
        <div id="status-msg-${inc.id}" style="font-size:9px;margin-top:4px"></div>
      </div>` : ""}
  </div>`;
}

function addMkrs(data) {
  mkrs.forEach(m => map.removeLayer(m.mk));
  mkrs = [];
  data.forEach(inc => {
    const m = L.marker([inc.lat, inc.lng], { icon:mkIcon(inc) });
    m.bindPopup(mkPop(inc), { maxWidth:280 });
    m.on("click", () => updTicker(inc));
    m.addTo(map);
    mkrs.push({ inc, mk:m });
  });
}

function updTicker(inc) {
  const c = SC[inc.sev] || "var(--txt)";
  document.getElementById("inc-txt").innerHTML =
    `<span style="color:${c};font-weight:600">${inc.id}</span> &nbsp;—&nbsp; ` +
    `<span style="color:var(--sh);font-weight:600">${inc.location}</span> &nbsp;—&nbsp; ` +
    `${inc.type} &nbsp;—&nbsp; ` +
    `<span style="color:${c}">${inc.sev.toUpperCase()}</span> &nbsp;—&nbsp; ` +
    `${inc.area} km²`;
}

// ── UNIFIED FILTERING SYSTEM ──────────────────────────────────────────────────
function getFilteredIncidents() {
  const cat = filt;
  const sev = document.getElementById("filter-sev") ? document.getElementById("filter-sev").value : "all";
  const st  = document.getElementById("filter-status") ? document.getElementById("filter-status").value : "all";
  const dt  = document.getElementById("filter-date") ? document.getElementById("filter-date").value : "";
  const q   = document.getElementById("srch") ? document.getElementById("srch").value.trim().toLowerCase() : "";

  return INC.filter(inc => {
    // 1. Category filter
    if (cat !== "all" && inc.type !== cat) return false;

        // 2. Severity filter
    if (
      sev !== "all" &&
      String(inc.sev || "").toUpperCase() !== String(sev).toUpperCase()
    ) {
      return false;
    }

    // 3. Status filter
    if (st !== "all") {
      const incStatus = inc.source === "backend"
        ? (inc.backendStatus || toBackendStatus(inc.status))
        : toBackendStatus(inc.status || RS[inc.id] || "REPORTED");

      if (incStatus !== st) return false;
    }

    // 4. Date filter (supports YYYY-MM or exact YYYY-MM-DD)
    if (dt) {
      if (!inc.date.startsWith(dt)) return false;
    }

    // 5. Text search query
    if (q) {
      const haystack = [
        inc.id,
        inc.title || "",
        inc.location,
        inc.type,
        inc.desc,
        inc.dist || "",
        inc.status || RS[inc.id] || ""
      ].join(" ").toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    return true;
  });
}

function updateDashboardData() {
  const filtered = getFilteredIncidents();

  // Update map markers
  addMkrs(filtered);

  // Update incident table
  buildTable(filtered);

  // Update summary cards based on filtered set
  animCnt(filtered);

  // Category badges always show total counts from complete dataset (Bug 2 fix)
  updateCategoryBadges();

  // Drawer record count indicator
  const drwMeta = document.getElementById("drw-meta");
  if (drwMeta) {
    drwMeta.textContent = `${filtered.length} of ${INC.length} records`;
  }
}

function applyFilter(type) {
  filt = type;
  updateDashboardData();
}

function resetFilters() {
  filt = "all";
  document.querySelectorAll(".frow").forEach(x => {
    x.classList.toggle("on", x.dataset.type === "all");
  });

  const srch = document.getElementById("srch");
  if (srch) srch.value = "";

  const sevSel = document.getElementById("filter-sev");
  if (sevSel) sevSel.value = "all";

  const stSel = document.getElementById("filter-status");
  if (stSel) stSel.value = "all";

  const dtSel = document.getElementById("filter-date");
  if (dtSel) dtSel.value = "";

  updateDashboardData();
}

function updateCategoryBadges() {
  const cAll = document.getElementById("c-all");
  const cOil = document.getElementById("c-oil");
  const cPla = document.getElementById("c-pla");
  const cChe = document.getElementById("c-che");
  const cAlg = document.getElementById("c-alg");

  if (cAll) cAll.textContent = INC.length;
  if (cOil) cOil.textContent = INC.filter(i => i.type === "Oil Spill").length;
  if (cPla) cPla.textContent = INC.filter(i => i.type === "Plastic Waste").length;
  if (cChe) cChe.textContent = INC.filter(i => i.type === "Chemical Pollution").length;
  if (cAlg) cAlg.textContent = INC.filter(i => i.type === "Algal Bloom").length;
}

// ── STAKEHOLDER VIEW SWITCH ───────────────────────────────────────────────────
function switchView(v) {
  view = v;
  document.body.className = v === "all" ? "" :
    ({ fishermen:"vf", government:"vg", tourism:"vt", residents:"vr" }[v] || "");

  document.querySelectorAll(".vtab").forEach(b => {
    b.classList.remove("active");
    if (b.dataset.view === v) b.classList.add("active");
  });

  const is  = document.getElementById("ins-strip");
  const ms  = document.getElementById("mstrip");
  const cfg = SH[v];

  if (!cfg) {
    is.classList.add("hidden");
    ms.classList.add("hidden");
  } else {
    is.classList.remove("hidden");
    document.getElementById("ins-tag").textContent  = cfg.tag;
    document.getElementById("ins-ttl").textContent  = cfg.ttl;
    document.getElementById("ins-txt").textContent  = cfg.txt;
    document.getElementById("ins-pills").innerHTML  =
      cfg.pills.map(p => `<span class="ins-pill">${p}</span>`).join("");

    ms.classList.remove("hidden");
    ms.innerHTML = cfg.metrics.map(m =>
      `<div class="mrow"><div class="mrow-l">
        <div class="mrow-lbl">${m.lbl}</div>
        <div class="mrow-val">${m.val}</div>
        <div class="mrow-sub">${m.sub}</div>
        <div class="mbar"><div class="mfill" data-pct="${m.pct}" style="width:0"></div></div>
      </div></div>`
    ).join("");

    setTimeout(() =>
      document.querySelectorAll(".mfill").forEach(g => g.style.width = g.dataset.pct + "%"),
      80
    );
  }

  const show = (id, yn) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.display = yn ? (id === "rh-charts" ? "block" : "flex") : "none";
    el.classList.toggle("hidden", !yn);
  };

  show("rh-charts",    v === "all" || v === "fishermen");
  show("beach-panel",  v === "tourism");
  show("resp-panel",   v === "government");
  show("health-panel", v === "residents");
  document.getElementById("fish-legend").classList.toggle("hidden", v !== "fishermen");
  document.getElementById("imp-th").style.display = v !== "all" ? "" : "none";

  const fd = getFilteredIncidents();
  buildTable(fd);
  addMkrs(fd);
  mkrs.forEach(({ inc, mk }) => mk.setPopupContent(mkPop(inc)));
}

// ── TABLE ─────────────────────────────────────────────────────────────────────
function buildTable(rows) {
  const cfg = view !== "all" ? SH[view] : null;
  const tbody = document.getElementById("tbl-body");
  if (!tbody) return;

  if (rows.length === 0) {
    tbody.innerHTML = `
      <tr class="empty-row">
        <td colspan="8" style="text-align:center;padding:34px 16px;color:var(--txt2)">
          <i class="fas fa-search" style="font-size:22px;margin-bottom:8px;opacity:0.5;display:block"></i>
          <span style="font-size:12px;font-weight:600;color:var(--txt)">No incidents match the active filters</span><br>
          <span style="font-size:10px;color:var(--txt3);margin-top:4px;display:inline-block">Try adjusting severity, status, search keyword, or click Reset.</span>
        </td>
      </tr>
    `;
    return;
  }

  const cm = {
    danger:  ["var(--crit)", "var(--crit-d)"],
    caution: ["var(--warn)", "var(--warn-d)"],
    safe:    ["var(--safe)", "var(--safe-d)"],
  };

  tbody.innerHTML = rows.map(inc => {
    const s  = inc.sev.toLowerCase();
    const ic = TI[inc.type] || "fa-circle";
    const stRaw = (inc.status || RS[inc.id] || "REPORTED").toUpperCase();
    const stClass = stRaw.toLowerCase();
    const stDisplay = stRaw.replace("_", " ");

    
const isAwsIncident =
  inc.source === "backend" ||
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    String(inc.id)
  );

const statusCell = isAwsIncident
  ? `<select
       class="form-select"
       style="min-width:145px;font-size:10px;padding:4px"
       value="${stRaw}"
       onclick="event.stopPropagation()"
       onchange="event.stopPropagation();updateIncidentStatus('${inc.id}',this.value)"
       aria-label="Update status for ${inc.title || inc.id}"
     >
       <option value="REPORTED" ${stRaw === "REPORTED" ? "selected" : ""}>REPORTED</option>
       <option value="UNDER_INVESTIGATION" ${stRaw === "UNDER_INVESTIGATION" ? "selected" : ""}>UNDER INVESTIGATION</option>
       <option value="RESOLVED" ${stRaw === "RESOLVED" ? "selected" : ""}>RESOLVED</option>
     </select>`
  : `<span class="status-tag ${stClass}">${stDisplay}</span>`;


    const localTag = inc.isLocalDemo
      ? `<span class="local-badge" title="Added during this browser demo session">LOCAL DEMO</span>`
      : "";

    let imp = "";
    if (cfg) {
      const v        = cfg.fn(inc);
      const cl       = cfg.cls(inc);
      const [fc, bg] = cm[cl];
      imp = `<td style="display:table-cell">
        <span class="imp" style="color:${fc};background:${bg};border-color:${fc};
          padding:0 5px;border:1px solid;font-family:var(--F3);font-size:8px">${v}</span>
      </td>`;
    }

    return `<tr onclick="jump('${inc.id}')" title="Click to view marker on map">
      <td>
        <div style="display:flex;align-items:center;gap:6px">
          <span style="color:var(--sh);font-family:var(--F3);font-size:9.5px;font-weight:600">${inc.id}</span>
          ${localTag}
        </div>
        <div style="color:var(--txt);font-size:10.5px;font-weight:500;margin-top:2px;max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
          ${inc.title || inc.location}
        </div>
      </td>
      <td style="color:var(--txt);font-weight:500">${inc.location}</td>
      <td><span class="ttype"><i class="fas ${ic}"></i> ${inc.type}</span></td>
      <td><span class="sev ${s}">${inc.sev.toUpperCase()}</span></td>
      <td>${statusCell}</td>
      <td style="font-family:var(--F3);color:var(--txt2)">${inc.area} km²</td>
      <td style="font-family:var(--F3);color:var(--txt2)">${fmt(inc.date)}</td>
      ${imp}
    </tr>`;
  }).join("");
}


async function jump(id) {
  let f = mkrs.find(m => m.inc.id === id);

  if (!f) {
    const inc = INC.find(i => i.id === id);
    if (inc) {
      const m = L.marker([inc.lat, inc.lng], { icon: mkIcon(inc) });
      m.bindPopup(mkPop(inc), { maxWidth: 280 });
      m.on("click", () => updTicker(inc));
      m.addTo(map);
      mkrs.push({ inc, mk: m });
      f = { inc, mk: m };
    }
  }

  if (!f) return;

  // Keep the existing map zoom and popup behavior.
  map.setView([f.inc.lat, f.inc.lng], 12);
  f.mk.openPopup();
  updTicker(f.inc);

  // Fetch the latest details only for AWS-backed incidents.
  const isAwsIncident =
    f.inc.source === "backend" ||
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      String(f.inc.id)
    );

  if (!isAwsIncident) return;

  try {
    const latest = await getAWSIncident(f.inc.id);

    // Update the existing incident object and marker.
    Object.assign(f.inc, latest);
    f.mk.setLatLng([latest.lat, latest.lng]);
    f.mk.setIcon(mkIcon(f.inc));
    f.mk.setPopupContent(mkPop(f.inc));

    // Preserve the zoom and refresh the open popup.
    map.setView([f.inc.lat, f.inc.lng], 12);
    f.mk.openPopup();
    updTicker(f.inc);

    console.log("Latest AWS incident details:", latest);
  } catch (error) {
    console.error("Could not fetch the latest AWS incident:", error);
  }
}


// ── CHARTS ────────────────────────────────────────────────────────────────────
function initCharts() {
  const gc = "rgba(0,229,176,0.06)";
  const tf = { color:"#9ec5dd", font:{ size:9, family:"DM Mono" } };
  const tt = {
    backgroundColor:"var(--ocean)", borderColor:"#1a4860", borderWidth:1,
    titleColor:"#00e5b0", bodyColor:"#9ec5dd", padding:8, cornerRadius:0,
    titleFont:{ family:"DM Mono", size:9 }, bodyFont:{ family:"DM Mono", size:10 },
  };

  new Chart(document.getElementById("typeChart"), {
    type:"bar",
    data:{
      labels:["Oil Spill","Plastic","Chemical","Algal"],
      datasets:[{
        data:[6,4,3,2],
        backgroundColor:["rgba(255,58,58,.35)","rgba(0,229,176,.35)","rgba(255,174,0,.35)","rgba(128,255,96,.3)"],
        borderColor:["var(--crit)","var(--safe)","var(--warn)","#80ff60"],
        borderWidth:1, barPercentage:.6,
      }],
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      plugins:{ legend:{ display:false }, tooltip:tt },
      scales:{
        x:{ ticks:{ ...tf }, grid:{ color:gc } },
        y:{ ticks:{ ...tf, stepSize:1 }, grid:{ color:gc }, beginAtZero:true },
      },
    },
  });

  const mRaw = {};
  INC.forEach(i => { const m = i.date.slice(0,7); mRaw[m] = (mRaw[m] || 0) + 1; });
  const mons = ["J","F","M","A","M","J","J","A","S","O","N","D"];
  const mc   = mons.map((_, i) => mRaw[`2024-${String(i+1).padStart(2,"0")}`] || 0);
  const cum  = [];
  mc.reduce((a, v, i) => { cum[i] = a + v; return a + v; }, 0);

  new Chart(document.getElementById("trendChart"), {
    type:"line",
    data:{
      labels:mons,
      datasets:[
        { label:"Monthly",  data:mc,  borderColor:"var(--phon)", backgroundColor:"rgba(0,229,176,0.06)", fill:true, tension:0.3, pointBackgroundColor:"var(--phon)", pointRadius:2, borderWidth:1.5 },
        { label:"Cumul.",   data:cum, borderColor:"var(--warn)", backgroundColor:"transparent", borderDash:[4,3], tension:0.3, pointRadius:1.5, borderWidth:1 },
      ],
    },
    options:{
      responsive:true, maintainAspectRatio:false,
      plugins:{
        legend:{ display:true, labels:{ color:"#9ec5dd", font:{ size:8, family:"DM Mono" }, boxWidth:8, usePointStyle:true } },
        tooltip:tt,
      },
      scales:{
        x:{ ticks:{ ...tf }, grid:{ color:gc } },
        y:{ ticks:{ ...tf, stepSize:1 }, grid:{ color:gc }, beginAtZero:true },
      },
    },
  });
}

// ── PANEL BUILDERS ────────────────────────────────────────────────────────────
function buildBeach() {
  document.getElementById("beach-list").innerHTML = BEACH.map(b => `
    <div class="rrow">
      <div style="flex:1">
        <div class="rname">${b.n}</div>
        <div class="rsub">${b.d}${b.nr ? ` · ${b.nr}` : ""}</div>
      </div>
      <span class="tag ${b.s}">${b.s === "safe" ? "SAFE" : b.s === "caution" ? "CAUTION" : "DANGER"}</span>
    </div>`).join("");
}

function buildResp() {
  document.getElementById("resp-list").innerHTML = INC.map(i => {
    const st = i.status ? String(i.status).toLowerCase() : (RS[i.id] || "active");
    const d  = RD[i.id] || 2;
    return `<div class="rrow">
      <span class="rid">${i.id}</span>
      <span class="rname" style="font-size:10px">${i.location}</span>
      <span class="tag ${st === "active" ? "danger" : st === "contained" ? "caution" : "safe"}">${st.toUpperCase()}</span>
      <span style="font-family:var(--F3);font-size:8px;color:var(--txt3);width:24px;text-align:right;margin-left:4px">
        ${st === "active" ? "—" : d + "D"}
      </span>
    </div>`;
  }).join("");
}

function buildHealth() {
  document.getElementById("health-grid").innerHTML = HEALTH.map(d => {
    const r = d.s >= 7 ? "HIGH RISK" : d.s >= 5 ? "MODERATE" : "LOW";
    return `<div class="hcard">
      <div class="hd">${d.d}</div>
      <div class="hs" style="color:${d.c}">${d.s}</div>
      <div class="hr" style="color:${d.c}">${r}</div>
      <div class="hbar"><div class="hfill" style="width:${d.s * 10}%;background:${d.c}"></div></div>
    </div>`;
  }).join("");
}

function buildAlerts() {
  const hi = INC.filter(i => i.sev === "High");
  const md = INC.filter(i => i.sev === "Medium").slice(0, 2);
  document.getElementById("abadge").textContent = hi.length;
  document.getElementById("ap-list").innerHTML = [...hi, ...md].slice(0, 7).map(inc => {
    const h = inc.sev === "High";
    return `<div class="acard ${h ? "" : "med"}"
      onclick="jump('${inc.id}');document.getElementById('ap').classList.remove('open')">
      <div class="ac-ttl"><i class="fas fa-triangle-exclamation"></i>${inc.sev.toUpperCase()} · ${inc.id}</div>
      <div class="ac-body">
        <strong style="color:var(--txt)">${inc.location}</strong><br>
        ${inc.type} · ${inc.area} km²<br>
        ${inc.desc.slice(0, 80)}…
      </div>
      <div class="ac-time">${fmt(inc.date)}</div>
    </div>`;
  }).join("");
}

// ── INCIDENT REPORTING MODAL & VALIDATION ─────────────────────────────────────
function openReportModal() {
  const modal = document.getElementById("report-modal");
  if (!modal) return;
  modal.classList.remove("hidden");
  modal.setAttribute("aria-hidden", "false");
  updateBackendStatusBadge();

  setTimeout(() => {
    const titleInput = document.getElementById("rep-title");
    if (titleInput) titleInput.focus();
  }, 100);
}

function closeReportModal(reset = true) {
  const modal = document.getElementById("report-modal");
  if (!modal) return;
  modal.classList.add("hidden");
  modal.setAttribute("aria-hidden", "true");
  if (reset) {
    resetReportForm();
  }
}

function resetReportForm() {
  const form = document.getElementById("incident-form");
  if (form) form.reset();

  // Status must default to REPORTED as per requirement 1 & 2
  const st = document.getElementById("rep-status");
  if (st) st.value = "REPORTED";

  clearFormErrors();
  hideFeedback();
}

function clearFormErrors() {
  document.querySelectorAll(".field-error").forEach(el => el.textContent = "");
  document.querySelectorAll(".form-inp.invalid, .form-select.invalid, .form-textarea.invalid")
    .forEach(el => el.classList.remove("invalid"));
}

function setFieldError(fieldId, errorId, message) {
  const field = document.getElementById(fieldId);
  const errEl = document.getElementById(errorId);
  if (field) field.classList.add("invalid");
  if (errEl) errEl.textContent = message;
}

function clearFieldError(fieldId, errorId) {
  const field = document.getElementById(fieldId);
  const errEl = document.getElementById(errorId);
  if (field) field.classList.remove("invalid");
  if (errEl) errEl.textContent = "";
}

function showFeedback(htmlMsg, type = "info") {
  const fb = document.getElementById("rep-feedback");
  if (!fb) return;
  fb.className = `form-feedback ${type}`;
  fb.innerHTML = htmlMsg;
  fb.classList.remove("hidden");
}

function hideFeedback() {
  const fb = document.getElementById("rep-feedback");
  if (!fb) return;
  fb.classList.add("hidden");
  fb.innerHTML = "";
}

function updateBackendStatusBadge() {
  const el = document.getElementById("modal-backend-status");
  if (!el) return;
  if (AWS_CONFIG.isConfigured) {
    el.className = "backend-notice cloud";
    el.innerHTML = `<i class="fas fa-cloud-arrow-up"></i> AWS Connected`;
  } else {
    el.className = "backend-notice";
    el.innerHTML = `<i class="fas fa-circle-info"></i> Local Demo Session (Cloud Unconfigured)`;
  }
}

// Coordinate picking directly from map click
function startMapCoordinatePicker() {
  closeReportModal(false);
  const banner = document.getElementById("map-pick-banner");
  if (banner) banner.classList.remove("hidden");
  isMapPicking = true;

  map.once("click", e => {
    if (!isMapPicking) return;
    const lat = Number(e.latlng.lat.toFixed(4));
    const lng = Number(e.latlng.lng.toFixed(4));
    document.getElementById("rep-lat").value = lat;
    document.getElementById("rep-lng").value = lng;
    clearFieldError("rep-lat", "err-rep-lat");
    clearFieldError("rep-lng", "err-rep-lng");
    cancelMapCoordinatePicker();
    openReportModal();
  });
}

function cancelMapCoordinatePicker() {
  isMapPicking = false;
  const banner = document.getElementById("map-pick-banner");
  if (banner) banner.classList.add("hidden");
}

// Form validation & submission handler
async function handleFormSubmit(e) {
  e.preventDefault();
  if (isSubmitting) return;

  clearFormErrors();
  hideFeedback();

  const title    = document.getElementById("rep-title").value.trim();
  const type     = document.getElementById("rep-type").value;
  const location = document.getElementById("rep-location").value.trim();
  const latStr   = document.getElementById("rep-lat").value.trim();
  const lngStr   = document.getElementById("rep-lng").value.trim();
  const sev      = document.getElementById("rep-sev").value;
  const status   = document.getElementById("rep-status").value;
  const areaStr  = document.getElementById("rep-area").value.trim();
  const desc     = document.getElementById("rep-desc").value.trim();

  let hasError = false;

  // 1. Required string fields
  if (!title) {
    setFieldError("rep-title", "err-rep-title", "Incident title is required.");
    hasError = true;
  } else if (title.length < 3) {
    setFieldError("rep-title", "err-rep-title", "Title must be at least 3 characters.");
    hasError = true;
  }

  if (!location) {
    setFieldError("rep-location", "err-rep-location", "Location name is required.");
    hasError = true;
  }

  // 2. Latitude validation: finite number between -90 and 90
  const latNum = Number(latStr);
  if (!latStr || isNaN(latNum) || !isFinite(latNum)) {
    setFieldError("rep-lat", "err-rep-lat", "Valid numeric latitude is required.");
    hasError = true;
  } else if (latNum < -90 || latNum > 90) {
    setFieldError("rep-lat", "err-rep-lat", "Latitude must be between -90 and 90.");
    hasError = true;
  }

  // 3. Longitude validation: finite number between -180 and 180
  const lngNum = Number(lngStr);
  if (!lngStr || isNaN(lngNum) || !isFinite(lngNum)) {
    setFieldError("rep-lng", "err-rep-lng", "Valid numeric longitude is required.");
    hasError = true;
  } else if (lngNum < -180 || lngNum > 180) {
    setFieldError("rep-lng", "err-rep-lng", "Longitude must be between -180 and 180.");
    hasError = true;
  }

  // 4. Severity allowed values
  const allowedSev = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
  if (!allowedSev.includes(sev)) {
    setFieldError("rep-sev", "err-rep-sev", "Please select a valid severity level.");
    hasError = true;
  }

  // 5. Status allowed values
  const allowedStatus = [
  "REPORTED",
  "UNDER_INVESTIGATION",
  "RESOLVED"
];
  if (!allowedStatus.includes(status)) {
    setFieldError("rep-status", "err-rep-status", "Please select a valid status.");
    hasError = true;
  }

  // 6. Affected area validation: finite non-negative number
  const areaNum = Number(areaStr);
  if (!areaStr || isNaN(areaNum) || !isFinite(areaNum)) {
    setFieldError("rep-area", "err-rep-area", "Valid affected area number is required.");
    hasError = true;
  } else if (areaNum < 0) {
    setFieldError("rep-area", "err-rep-area", "Affected area cannot be negative.");
    hasError = true;
  }

  // 7. Description validation
  if (!desc) {
    setFieldError("rep-desc", "err-rep-desc", "Incident description is required.");
    hasError = true;
  } else if (desc.length < 5) {
    setFieldError("rep-desc", "err-rep-desc", "Please provide a more detailed description (at least 5 characters).");
    hasError = true;
  }

  if (hasError) {
    showFeedback("Please resolve the validation errors highlighted below.", "error");
    return;
  }

  // Create new incident object
  // Build the payload expected by the AWS backend.
// Generate a temporary ID for Local Demo Session only.
const localId = `KL-${String(INC.length + 1).padStart(3, "0")}`;
const dateStr = new Date().toISOString().slice(0, 10);

// Dashboard-format object, used for local demo mode.
const newIncident = {
  id: localId,
  title,
  location,
  lat: Number(latStr),
  lng: Number(lngStr),
  type,
  sev: ({
    LOW: "Low",
    MEDIUM: "Medium",
    HIGH: "High",
    CRITICAL: "Critical"
  })[sev.toUpperCase()] || "Medium",
  status:
    status === "REPORTED" ? "ACTIVE" :
    status === "UNDER_INVESTIGATION" ? "CONTAINED" :
    "RESOLVED",
  backendStatus: status,
  area: Number(areaStr),
  desc,
  date: dateStr,
  dist: location.split(" ")[0] || "Kerala Coast",
  isLocalDemo: !AWS_CONFIG.isConfigured,
  source: AWS_CONFIG.isConfigured ? "backend" : "local"
};

// API-format object, sent to AWS only.
const backendPayload = {
  title,
  description: desc,
  location,
  latitude: Number(latStr),
  longitude: Number(lngStr),
  severity: sev.toUpperCase(),
  status,
  affectedAreaKm2: Number(areaStr)
};

  const submitBtn = document.getElementById("btn-submit-report");
  const origBtnHtml = submitBtn.innerHTML;

  try {
    isSubmitting = true;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fas fa-circle-notch fa-spin"></i> <span>Submitting…</span>`;

    if (AWS_CONFIG.isConfigured) {
  const res = await fetch(AWS_CONFIG.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    },
    body: JSON.stringify(backendPayload)
  });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(
      message || `AWS endpoint returned status ${res.status}`
    );
  }

  const backendData = await res.json();
  const savedItem = backendData.item;

  if (!savedItem || !savedItem.incidentId) {
    throw new Error("AWS did not return the saved incident ID.");
  }

  // Convert the saved backend record into the dashboard format.
  const savedIncident = fromBackendIncident(savedItem);

  INC.unshift(savedIncident);

  buildAlerts();
  buildResp();
  updateDashboardData();

  showFeedback(
    `Incident report saved successfully to AWS! Record ID: <strong>${savedIncident.id}</strong>`,
    "success"
  );

  resetReportForm();

  setTimeout(() => {
    closeReportModal();
    jump(savedIncident.id);
  }, 1500);

      
    } else {
      // Local Demo Session mode - explicitly labeled, NEVER claims saved to backend
      await new Promise(r => setTimeout(r, 350));

      INC.unshift(newIncident);
      updateDashboardData();
      buildAlerts();

      showFeedback(
        `<i class="fas fa-info-circle"></i> Incident logged to <strong>Local Demo Session</strong> as <strong>${newIncident.id}</strong>. ` +
        `<br><span style="font-size:9.5px;opacity:0.9">Notice: AWS backend is not configured, so this record is held in memory for testing and will reset on page reload.</span>`,
        "info"
      );
      resetReportForm();

      setTimeout(() => {
        closeReportModal();
        jump(newIncident.id);
      }, 2000);
    }
  } catch (err) {
    console.error("Incident submission error:", err);
    showFeedback(
      `<i class="fas fa-triangle-exclamation"></i> Submission failed: ${err.message || "Network / API error"}. Data was not saved.`,
      "error"
    );
  } finally {
    isSubmitting = false;
    submitBtn.disabled = false;
    submitBtn.innerHTML = origBtnHtml;
  }
}

// ── EVENT BINDINGS ────────────────────────────────────────────────────────────
function bind() {
  // Category buttons in Left HUD
  document.querySelectorAll(".frow").forEach(b => b.addEventListener("click", () => {
    document.querySelectorAll(".frow").forEach(x => x.classList.remove("on"));
    b.classList.add("on");
    applyFilter(b.dataset.type);
  }));

  // Stakeholder view tabs
  document.querySelectorAll(".vtab").forEach(b =>
    b.addEventListener("click", () => switchView(b.dataset.view))
  );

  // Alert panel toggle
  document.getElementById("alert-bell").onclick =
    () => document.getElementById("ap").classList.toggle("open");
  document.getElementById("ap-close").onclick  =
    () => document.getElementById("ap").classList.remove("open");

  // Drawer toggle
  const drawer = document.getElementById("drawer");
  const btn    = document.getElementById("tbl-btn");
  btn.onclick  = () => { tblOpen = !tblOpen; drawer.classList.toggle("open", tblOpen); };
  document.getElementById("drw-hdr").onclick = () => {
    tblOpen = false;
    drawer.classList.remove("open");
  };

  // Multi-criteria filter events
  const srchInput = document.getElementById("srch");
  if (srchInput) srchInput.addEventListener("input", () => updateDashboardData());

  const sevFilter = document.getElementById("filter-sev");
  if (sevFilter) sevFilter.addEventListener("change", () => updateDashboardData());

  const stFilter = document.getElementById("filter-status");
  if (stFilter) stFilter.addEventListener("change", () => updateDashboardData());

  const dtFilter = document.getElementById("filter-date");
  if (dtFilter) dtFilter.addEventListener("change", () => updateDashboardData());

  const resetBtn = document.getElementById("btn-reset-filters");
  if (resetBtn) resetBtn.addEventListener("click", () => resetFilters());

  // Report Incident buttons
  const btnReportLeft = document.getElementById("btn-report-left");
  if (btnReportLeft) btnReportLeft.addEventListener("click", () => openReportModal());

  const btnReportBottom = document.getElementById("btn-report");
  if (btnReportBottom) btnReportBottom.addEventListener("click", () => openReportModal());

  // Modal close buttons
  const modalClose = document.getElementById("report-modal-close");
  if (modalClose) modalClose.addEventListener("click", () => closeReportModal());

  const modalCancel = document.getElementById("btn-cancel-report");
  if (modalCancel) modalCancel.addEventListener("click", () => closeReportModal());

  // Modal overlay click outside to close
  const modalOverlay = document.getElementById("report-modal");
  if (modalOverlay) {
    modalOverlay.addEventListener("click", (e) => {
      if (e.target === modalOverlay) closeReportModal();
    });
  }

  // Coordinate picker from map
  const btnPickMap = document.getElementById("btn-pick-map");
  if (btnPickMap) btnPickMap.addEventListener("click", () => startMapCoordinatePicker());

  const btnCancelPick = document.getElementById("btn-cancel-map-pick");
  if (btnCancelPick) btnCancelPick.addEventListener("click", () => cancelMapCoordinatePicker());

  // Form submission
  const incidentForm = document.getElementById("incident-form");
  if (incidentForm) incidentForm.addEventListener("submit", handleFormSubmit);

  // Realtime clear on input
  ["rep-title", "rep-location", "rep-lat", "rep-lng", "rep-sev", "rep-status", "rep-area", "rep-desc"].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("input", () => clearFieldError(id, `err-${id}`));
      el.addEventListener("change", () => clearFieldError(id, `err-${id}`));
    }
  });

  // ESC key listener to close modal or cancel map pick
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (isMapPicking) {
        cancelMapCoordinatePicker();
        openReportModal();
      } else {
        closeReportModal();
        document.getElementById("ap").classList.remove("open");
      }
    }
  });
}

// ── HELPERS ───────────────────────────────────────────────────────────────────
function fmt(s) {
  return new Date(s + "T00:00:00").toLocaleDateString("en-IN", {
    day:"2-digit", month:"short", year:"numeric",
  });
}
