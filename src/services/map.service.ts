import * as OsmBright from "@/json/osm-bright.json";
import * as geolib from "geolib";
import html2canvas from "html2canvas";
import { Map } from "maplibre-gl";
import { EventEmitterService } from "./event-emitter.service";
import { eventBus } from "@/eventBus";
import type { OrientationListenerEvent } from "@/mobile";
import type { Marker, StyleSpecification, GeoJSONSource } from "maplibre-gl";
import type { Maplibre, MapOnEvents, Point } from "@/types/global.type";
import FinishFlag from "@/assets/images/finish-flag.png";

const maplibregl = (window as any).maplibregl as Maplibre;

export class MapService {
  private readonly emitter = new EventEmitterService();
  private readonly style = OsmBright;
  private readonly defaultZoom = 18;
  private activityCoordinates: [number, number][] = [];
  private map!: Map;
  private userMarker?: Marker;
  private startMarker: Marker | null = null;
  private finishMarker: Marker | null = null;
  private startedBearing = false;
  private _isFollowing = true;

  started = false;

  get isFollowing() {
    return this._isFollowing;
  };

  set isFollowing(val: boolean) {
    this._isFollowing = val;
    if (!val) this.emitter.emit("change-recenter", undefined);
  };

  constructor(private readonly id = "map") {
    eventBus.on("ORIENTATION_MOTION_EVENT", this.orientationMotionEvent);
  };

  destroy() {
    eventBus.off("ORIENTATION_MOTION_EVENT", this.orientationMotionEvent);
    this.map?.remove();
    this.emitter.clear();
  };

  on(event: MapOnEvents, fn: () => void) {
    this.emitter.on(event, fn);
  };

  init(coords: [number, number]) {
    const [lng, lat] = coords;

    this.map = new maplibregl.Map({
      container: this.id,
      style: this.style as unknown as StyleSpecification,
      center: [lng, lat],
      zoom: this.defaultZoom,
      attributionControl: false,
      canvasContextAttributes: { preserveDrawingBuffer: true }
    });

    this.map.on("dragstart", () => this.isFollowing = false);

    this.map.on("wheel", () => this.isFollowing = false);

    this.map.on("load", () => {
      const map = this.map;

      try {
        map.getStyle().layers.forEach((layer) => {
          const id = layer.id.toLowerCase();

          // ── Fundo do mapa ──────────────────────────────────────
          if (layer.type === "background") {
            map.setPaintProperty(layer.id, "background-color", "#0D0D0D");
          }

          // ── Água ───────────────────────────────────────────────
          if (layer.type === "fill" && id.includes("water")) {
            map.setPaintProperty(layer.id, "fill-color", "#111C22");
          }

          // ── Áreas verdes / parques ────────────────────────────
          if (layer.type === "fill") {
            const greenOptions = ["park", "green", "grass", "forest", "wood", "nature", "landuse"];
            if (greenOptions.some((o) => id.includes(o))) {
              map.setPaintProperty(layer.id, "fill-color", "#0F1A10");
            }
          }

          // ── Quadras / construções ─────────────────────────────
          if (layer.type === "fill") {
            const buildingOptions = ["building", "block", "landcover"];
            if (buildingOptions.some((o) => id.includes(o))) {
              map.setPaintProperty(layer.id, "fill-color", "#161616");
              map.setPaintProperty(layer.id, "fill-outline-color", "#222222");
            }
          }

          // ── Ruas ───────────────────────────────────────────────
          if (layer.type === "line") {
            const roadOptions = [
              "road", "street", "motorway", "primary", "secondary",
              "tertiary", "residential", "trunk", "link", "service",
              "track", "path", "footway", "pedestrian", "cycleway",
              "steps", "corridor", "bridleway", "minor", "unclassified",
            ];
            const isRoad = roadOptions.some((o) => id.includes(o));

            if (isRoad) {
              // Via principal — cinza médio para contraste sutil
              map.setPaintProperty(layer.id, "line-color", "#2A2A2A");

              // Vias maiores (motorway, primary, trunk) — um toque mais visível
              const isHighway = ["motorway", "primary", "trunk"].some((o) => id.includes(o));
              if (isHighway) {
                map.setPaintProperty(layer.id, "line-color", "#333333");
              }

              // Casing / outline — borda quase invisível
              if (id.includes("casing") || id.includes("outline")) {
                map.setPaintProperty(layer.id, "line-color", "#1A1A1A");
              }
            }

            // Fronteiras / limites administrativos
            if (id.includes("boundary") || id.includes("border") || id.includes("admin")) {
              map.setPaintProperty(layer.id, "line-color", "#1E2A1E");
              map.setPaintProperty(layer.id, "line-dasharray", [2, 2]);
            }

            // Trilhos / rail
            if (id.includes("rail") || id.includes("transit")) {
              map.setPaintProperty(layer.id, "line-color", "#1F3320");
            }
          }

          // ── Labels / texto ────────────────────────────────────
          if (layer.type === "symbol") {
            // Remove números de casas
            const numbersOptions = ["housenumber", "house_number", "house-number", "addr", "address_number"];
            if (numbersOptions.some((o) => id.includes(o))) {
              map.setLayoutProperty(layer.id, "visibility", "none");
              return;
            }

            // 🔥 Aplica em TODAS as camadas de símbolo sem exceção
            // Texto branco bem legível
            map.setPaintProperty(layer.id, "text-color", "#E8E8E8");
            // Halo escuro para contraste (nunca branco!)
            map.setPaintProperty(layer.id, "text-halo-color", "#0D0D0D");
            map.setPaintProperty(layer.id, "text-halo-width", 2);
            map.setPaintProperty(layer.id, "text-halo-blur", 0);

            // Nomes de ruas — um pouco mais discretos que POIs
            const streetLabelOptions = ["road", "street", "highway", "path", "route"];
            if (streetLabelOptions.some((o) => id.includes(o))) {
              map.setPaintProperty(layer.id, "text-color", "#AAAAAA");
              map.setPaintProperty(layer.id, "text-halo-color", "#0D0D0D");
              map.setPaintProperty(layer.id, "text-halo-width", 2);
            }

            // Ícones (shields de rodovia como RJ-106) — esconde ou neutraliza
            try {
              map.setPaintProperty(layer.id, "icon-color", "#333333");
              map.setPaintProperty(layer.id, "icon-halo-color", "#0D0D0D");
              map.setPaintProperty(layer.id, "icon-halo-width", 1);
            } catch {}
          }
        });
      } catch { }

      setTimeout(() => {
        this.started = true;
        this.emitter.emit("ready", undefined);
      }, 200);
    });
  };

  rotationUser(speed: number, bearing: number) {
    const cone = document.querySelector("#heading-cone") as SVGGElement | null;

    if (speed > 0 && bearing > 0 && cone) {
      if (this.isFollowing) {
        this.map?.rotateTo(bearing, { duration: 300 });

        const lastCoords = this.activityCoordinates[this.activityCoordinates.length - 1];

        if (lastCoords) {
          this.recenter(
            lastCoords,
            this.userMarker?.getRotation() || 0
          );
        }

        this.isFollowing = true;
      }

      cone.style.transform = `rotate(${bearing}deg)`;

      if (!this.startedBearing) this.startedBearing = true;
    }
  };

  addUserLocationMarker(coords: [number, number]) {
    const [lng, lat] =  coords;

    const el = document.createElement("div");
    el.style.cssText = `
      width: 120px;
      height: 120px;
      position: relative;
      z-index: 999;
      pointer-events: none;
    `;

    el.innerHTML = `
      <svg width="120" height="120" viewBox="0 0 160 160" xmlns="http://www.w3.org/2000/svg" style="overflow:visible;">
        <!-- Radar rings saindo do ponto -->
        <circle cx="80" cy="80" r="10" fill="none" stroke="#39FF14" stroke-width="1" opacity="0">
          <animate attributeName="r" values="10;60" dur="2s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.7;0" dur="2s" repeatCount="indefinite"/>
        </circle>
        <circle cx="80" cy="80" r="10" fill="none" stroke="#39FF14" stroke-width="1" opacity="0">
          <animate attributeName="r" values="10;60" dur="2s" begin="0.66s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.7;0" dur="2s" begin="0.66s" repeatCount="indefinite"/>
        </circle>
        <circle cx="80" cy="80" r="10" fill="none" stroke="#39FF14" stroke-width="1" opacity="0">
          <animate attributeName="r" values="10;60" dur="2s" begin="1.33s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.7;0" dur="2s" begin="1.33s" repeatCount="indefinite"/>
        </circle>
        <!-- Cone de direção -->
        <g id="heading-cone" style="transform-origin:80px 80px; transform:rotate(0deg)">
          <path d="M80 80 L62 34 A26 26 0 0 1 98 34 Z" fill="#39FF14" opacity="0.15"/>
        </g>
        <!-- Ponto verde com borda branca -->
        <circle cx="80" cy="80" r="10" fill="#39FF14"/>
        <circle cx="80" cy="80" r="10" fill="none" stroke="white" stroke-width="2.5"/>
      </svg>
    `;

    const marker = new maplibregl.Marker({
      element: el,
      anchor: "center",
    }).setLngLat([lng, lat]).addTo(this.map);

    this.userMarker = marker;

    return marker;
  };

  recenter(center: [number, number], bearing = 0) {
    this.isFollowing = true;

    this.map.easeTo({
      center,
      bearing,
      zoom: this.defaultZoom,
      duration: 500
    });
  };

  initActivityLine(width?: number) {
    const map = this.map;

    // Source
    if (!map.getSource("activity-line")) {
      map.addSource("activity-line", {
        type: "geojson",
        tolerance: 0,
        data: {
          type: "Feature",
          geometry: { type: "LineString", coordinates: [] },
          properties: { },
        },
      });
    }

    // Outline
    if (!map.getLayer("activity-line-outline")) {
      map.addLayer({
        id: "activity-line-outline",
        type: "line",
        source: "activity-line",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": "#111111",
          "line-width": width ?
            width + 2 :
            [
              "interpolate",
              ["linear"],
              ["zoom"],
              10, 5,
              14, 8,
              18, 12
            ],
          "line-opacity": 0.9,
        },
      });
    }

    // Line
    if (!map.getLayer("activity-line")) {
      map.addLayer({
        id: "activity-line",
        type: "line",
        source: "activity-line",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": "#48F26D",
          "line-width": width ?
            width :
            [
              "interpolate",
              ["linear"],
              ["zoom"],
              10, 3,
              14, 5,
              18, 8
            ],
          "line-opacity": 1,
        },
      });
    }
  };

  addActivityPoint(coords: [number, number]) {
    this.activityCoordinates.push(coords);

    const source = this.map!.getSource("activity-line") as GeoJSONSource;

    if (!source) return;

    source.setData({
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: this.activityCoordinates,
      },
      properties: { },
    });
  };

  addStartMarker(coords: [number, number]) {
    const [lng, lat] = coords;

    const el = document.createElement("div");

    el.style.cssText = `
      width: 15px;
      height: 15px;
      border-radius: 999px;
      background: #48F26D;
      border: 3px solid white;
      box-shadow: 0 0 20px rgba(72, 242, 109, 0.5);
    `;

    this.startMarker = new maplibregl.Marker({
      element: el,
      anchor: "center",
    }).setLngLat([lng, lat]).addTo(this.map!);
  };

  removeStartMarker() {
    if (this.startMarker) {
      this.startMarker.remove();
      this.startMarker = null;
    }
  };

  addFinishMarker(coords: [number, number]) {
    const [lng, lat] = coords;

    const el = document.createElement("div");

    el.style.cssText = `
      width: 15px;
      height: 15px;
      border-radius: 999px;
      background-color: #111111;
      background-image: url(${FinishFlag});
      background-position: center;
      background-repeat: no-repeat;
      background-size: cover;
      border: 3px solid white;
      box-shadow: 0 0 25px rgba(0,0,0,0.45);
    `;

    this.finishMarker = new maplibregl.Marker({
      element: el,
      anchor: "center",
    }).setLngLat([lng, lat]).addTo(this.map!);
  };

  removeFinishMarker() {
    if (this.finishMarker) {
      this.finishMarker.remove();
      this.finishMarker = null;
    }
  };

  private orientationMotionEvent = (event: OrientationListenerEvent) => {
    const cone = document.querySelector("#heading-cone") as SVGGElement | null;

    if (cone && !this.startedBearing) {
      cone.style.transform = `rotate(${event.alpha}deg)`;
    }
  };

  showWorkoutRoute(points: Point[], block = true) {
    if (!this.map || !points.length) {
      return;
    }

    // filtra accuracy ruim
    const filtered = points.filter((p) => p.accuracy <= 15);

    // remove jitter
    const cleaned: Point[] = [];

    for (const point of filtered) {
      const last = cleaned[cleaned.length - 1];

      if (!last) {
        cleaned.push(point);
        continue;
      }

      const distance = geolib.getDistance(
        { latitude: last.lat, longitude: last.lng },
        { latitude: point.lat, longitude: point.lng }
      );

      const minDistance = point.speed <= 1.8 ?
        Math.max(1, point.accuracy * 0.15) :
        Math.max(2, point.accuracy * 0.25);

      if (distance >= minDistance) {
        cleaned.push(point);
      }
    }

    // suavização
    const smooth = cleaned.map((point, index) => {
      const prev = cleaned[index - 1] || point;
      const next = cleaned[index + 1] || point;

      return {
        lng: (prev.lng + point.lng + next.lng) / 3,
        lat: (prev.lat + point.lat + next.lat) / 3,
      };
    });

    const coordinates = smooth.map(
      (p) => [p.lng, p.lat]
    ) as [number, number][];

    // source
    const source = this.map.getSource("activity-line") as GeoJSONSource;

    if (!source) {
      return;
    }

    // desenha
    source.setData({
      type: "Feature",
      geometry: { type: "LineString", coordinates },
      properties: {},
    });

    // bounds
    const bounds = new maplibregl.LngLatBounds();

    coordinates.forEach((coord) => {
      bounds.extend(coord);
    });

    // fit
    this.map.fitBounds(bounds, {
      padding: {
        top: 30,
        bottom: 30,
        left: 30,
        right: 30,
      },
      duration: 0,
      pitch: 0,
      bearing: 0,
      maxZoom: 19,
    });

    // trava interação
    if (block) {
      this.map.dragPan.disable();
      this.map.scrollZoom.disable();
      this.map.touchZoomRotate.disable();
      this.map.doubleClickZoom.disable();
      this.map.boxZoom.disable();
      this.map.keyboard.disable();
    }

    // remove marker usuário
    this.userMarker?.remove();

    // início/fim
    const start = coordinates[0];
    const finish = coordinates[coordinates.length - 1];

    if (start) this.addStartMarker(start);

    if (finish) this.addFinishMarker(finish);
  };

  async getMapImage() {
    const element = document.querySelector(`#${this.id}`);

    if (!element) {
      return null;
    }

    // espera render
    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve))
    );

    const canvas = await html2canvas(element as HTMLElement, {
      useCORS: true,
      backgroundColor: null,
      logging: false,
      scale: 2,
    });

    return canvas.toDataURL("image/png");
  };
};