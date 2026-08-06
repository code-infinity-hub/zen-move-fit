import * as geolib from "geolib";
import { SqliteService } from "./sqlite.service";
import { KalmanFilter } from "./kalman.filter.ts";
import { eventBus } from "@/eventBus";
import { usePersistentSession } from "@/plugins/usePersistentSession.ts";
import type { AccelListenerEvent, MeasurementEvent } from "@/mobile";
import type { ActivitiesCategories, LocationPoint, RunningMetricsCheckpoint, Split } from "@/types/global.type";

const persistentSession = usePersistentSession();

export class RunningMetricsService {
  private readonly sqliteService = new SqliteService();
  private readonly BUFFER_LIMIT = 30;
  private pointsBuffer: LocationPoint[] = [];
  private latFilter = new KalmanFilter(0.0000001);
  private lngFilter = new KalmanFilter(0.0000001);
  private lastPoint?: LocationPoint;
  private distance = 0;
  private calories = 0;
  private splits: Split[] = [];
  private recentPoints: LocationPoint[] = [];
  private avgSpeed = 0;
  private avgPace = 0;
  private realtimePace = 0;
  private elapsedSeconds = 0;
  private currentSplitDistance = 0;
  private currentSplitStartedAt = 0;
  private cadence = 0;
  private acceleration = 0;
  private lastSteps = 0;
  private lastTimestamp = 0;
  private farRejections = 0;
  private movingDuration = 0;
  private currentSpeed = 0;
  private steps = 0;
  public initialized = false;

  constructor(
    private readonly workoutId: string,
    private readonly accountWeight: number,
    private readonly accountHeight: number,
    private readonly category: ActivitiesCategories,
  ) {
    eventBus.on("ACCEL_MOTION_EVENT", this.accelMotionEvent);
    eventBus.on("MEASUREMENT_EVENT", this.measurementEvent);
  };

  async destroy() {
    eventBus.off("ACCEL_MOTION_EVENT", this.accelMotionEvent);
    eventBus.off("MEASUREMENT_EVENT", this.measurementEvent);
    await this.flushPoints();
    await this.sqliteService.close();
  };

  async start() {
    await this.sqliteService.init();
    this.initialized = true;
  };

  async saveCoords() {
    await this.flushPoints();
  };

  private calculateBeltDistance(deltaSteps: number) {
    const isRunning = this.cadence > 140;
    const strideFactor = isRunning ? 0.645 : 0.413;
    return ((this.accountHeight / 100) * strideFactor) * deltaSteps;
  };

  private async persistentPoint(points: LocationPoint[]) {
    const savedPoints = JSON.parse(
      (await persistentSession.get("points")) || "[]"
    ) as LocationPoint[];

    savedPoints.push(...points);

    await persistentSession.set("points", JSON.stringify(savedPoints));
  };

  private async addPointSql(point: LocationPoint) {
    this.pointsBuffer.push(point);
    await this.persistentPoint([point]);

    if (this.pointsBuffer.length >= this.BUFFER_LIMIT) {
      await this.flushPoints();
    }
  };

  private async flushPoints() {
    if (this.pointsBuffer.length === 0) return;

    const pointsToSave = [...this.pointsBuffer];

    this.pointsBuffer = [];
    await persistentSession.remove("points");

    try {
      await this.sqliteService.insertPoints(this.workoutId, pointsToSave);
      console.debug(`[Metrics] ${pointsToSave.length} pontos salvos no SQLite.`);
    } catch (err) {
      console.error("Erro no flush do SQLite:", err);
      this.pointsBuffer = [...pointsToSave, ...this.pointsBuffer];
      await this.persistentPoint(
        [...pointsToSave, ...this.pointsBuffer]
      );
    }
  };

  private accelMotionEvent = (event: AccelListenerEvent) => {
    if (this.initialized) {
      const x = event.acceleration.x || 0;
      const y = event.acceleration.y || 0;
      const z = event.acceleration.z || 0;
      this.acceleration = Math.sqrt(x * x + y * y + z * z);
    }
  };

  private measurementEvent = (event: MeasurementEvent) => {
    if (this.initialized) {
      const now = Date.now();

      this.steps = event.numberOfSteps || 0;

      if (!this.lastTimestamp) {
        this.lastTimestamp = now;
        this.lastSteps = event.numberOfSteps || 0;
        return;
      }

      const deltaSteps = (event.numberOfSteps || 0) - this.lastSteps;

      if (this.category === "BELT") {
        const distance = this.calculateBeltDistance(deltaSteps);
        this.distance += distance;
        this.currentSplitDistance += distance;

        const deltaSeconds = (now - this.lastTimestamp) / 1000;
        if (this.cadence > 20 && deltaSeconds > 0) {
          this.movingDuration += deltaSeconds;
        }

        // splits baseados em tempo real, não GPS
        this.calculateSplits(this.movingDuration);

        if (deltaSeconds > 0) {
          const speedMs = distance / deltaSeconds;
          const speedKmh = speedMs * 3.6;
          const alpha = 0.3;
          this.currentSpeed = (alpha * speedKmh) + ((1 - alpha) * this.currentSpeed);
        }

        this.elapsedSeconds = this.movingDuration;

        if (this.currentSpeed > 0.5) {
          const secondsPerKm = 3600 / this.currentSpeed;
          const beta = 0.4;
          this.realtimePace = this.realtimePace > 0 ?
            beta * secondsPerKm + (1 - beta) * this.realtimePace :
            secondsPerKm;
        } else {
          this.realtimePace = 0;
        }

        const met = this.getMET();
        this.calories += met * this.accountWeight * (deltaSeconds / 3600);
      }

      const deltaMinutes = (now - this.lastTimestamp) / 1000 / 60;

      if (deltaMinutes <= 0) {
        return;
      }

      this.cadence = deltaSteps / deltaMinutes;
      this.lastSteps = event.numberOfSteps || 0;
      this.lastTimestamp = now;
    }
  };

  addPoint(point: Omit<LocationPoint, "elapsedSeconds">, durationSeconds: number) {
    const maxSpeed =  this.category === "CYCLING" ? 80 : 45;

    // Invalid
    if (point.accuracy > 20 || point.lat === 0 || point.lng === 0 || point.speed > maxSpeed) {
      return this.getMetrics(false);
    }

    // O filtro suaviza a coordenada antes de qualquer cálculo de distância.
    // Process noise dinâmico: variância do deslocamento esperado no intervalo
    // (multiplicador cresce com a velocidade) — parado tende a zero (jitter
    // congelado), lento suaviza forte (ruído relativo alto), rápido acompanha
    // a medição sem cortar curvas
    const deltaFilterSeconds = this.lastPoint ?
      Math.max(1, durationSeconds - this.lastPoint.elapsedSeconds) :
      1;
    const speedMs = Math.max(0, point.speed) / 3.6;
    const agility = Math.min(4, Math.max(2, 1.5 * speedMs));
    const expectedDisplacement = agility * speedMs * deltaFilterSeconds;
    const processNoise = (expectedDisplacement * expectedDisplacement) / 100000000;

    const filteredLat = this.latFilter.filter(point.lat, point.accuracy, processNoise);
    const filteredLng = this.lngFilter.filter(point.lng, point.accuracy, processNoise);

    // Normalized
    const normalizedPoint = {
      ...point,
      lat: filteredLat,
      lng: filteredLng,
      elapsedSeconds: durationSeconds,
    };

    // Duplicated
    if (
      this.lastPoint &&
      this.lastPoint.lat === normalizedPoint.lat &&
      this.lastPoint.lng === normalizedPoint.lng &&
      this.lastPoint.time === normalizedPoint.time
    ) {
      return this.getMetrics(false);
    }

    this.elapsedSeconds = durationSeconds;

    // Se for ESTEIRA, ignora cálculos de GPS
    if (this.category === "BELT") {
      this.addPointSql(normalizedPoint).catch(console.error);
      this.lastPoint = normalizedPoint;
      return this.getMetrics(true);
    }

    // Limit buffer
    this.recentPoints = this.recentPoints.filter((p) =>
      normalizedPoint.elapsedSeconds - p.elapsedSeconds <= 20
    );

    // First point
    if (!this.lastPoint) {
      this.lastPoint = normalizedPoint;
      return this.getMetrics(true);
    }

    const alpha = 0.3;
    this.currentSpeed = alpha * normalizedPoint.speed + (1 - alpha) * this.currentSpeed;

    // Distance between (float: o arredondamento default de 1 m enviesa
    // segmentos curtos e quantiza o limiar de deslocamento)
    const distanceBetween = geolib.getDistance(
      { latitude: this.lastPoint.lat, longitude: this.lastPoint.lng },
      { latitude: normalizedPoint.lat, longitude: normalizedPoint.lng },
      0.01
    );

    const deltaSeconds = durationSeconds - this.lastPoint.elapsedSeconds;

    // Velocidade implícita impossível para o tipo de atividade
    const impliedSpeedMs = deltaSeconds > 0 ? distanceBetween / deltaSeconds : 0;

    if (impliedSpeedMs > this.getMaxImpliedSpeedMs()) {
      return this.rejectFarPoint(normalizedPoint, distanceBetween);
    }

    // Ponte de perda de sinal: um intervalo longo sem pontos (túnel, sombra de
    // prédio) com velocidade implícita plausível soma o segmento reto; os gates
    // de curto alcance abaixo não se aplicam a um intervalo longo
    const isSignalGap = deltaSeconds >= 10;

    if (!isSignalGap) {
      const confidence = this.getPointConfidence(normalizedPoint, distanceBetween);

      if (confidence < 50) {
        return this.rejectFarPoint(normalizedPoint, distanceBetween);
      }

      // Ignore teleport
      if (distanceBetween > 100) {
        return this.rejectFarPoint(normalizedPoint, distanceBetween);
      }

      // Jitter por estado de movimento: parado (sem Doppler e sem cadência) o
      // gate é o raio de accuracy; devagar (< 2 m/s), acumula até ~5 m para
      // vencer a razão ruído/sinal; rápido, limiar pequeno para não cortar
      // cantos de curva (lastPoint não avança quando barra)
      const isStationary = normalizedPoint.speed < 1 && this.cadence < 20;
      const speedMs = Math.max(0, normalizedPoint.speed) / 3.6;
      const minDisplacement = isStationary ?
        normalizedPoint.accuracy :
        (speedMs < 2 ? Math.min(5, Math.max(2, 4 * speedMs)) : 2);

      if (distanceBetween < minDisplacement) {
        return this.getMetrics(false);
      }
    }

    this.farRejections = 0;
    if (distanceBetween > 1 && normalizedPoint.speed > 0.5) {
      this.movingDuration += deltaSeconds;

      const met = this.getMET();
      this.calories += met * this.accountWeight * (deltaSeconds / 3600);
    }

    this.addPointSql(normalizedPoint).catch((err) => console.error("SQLite insert failed:", err));

    // Realtime buffer
    this.recentPoints.push(normalizedPoint);
    this.recentPoints = this.recentPoints.slice(-100);

    // Segmento aceito soma integral: o erro de pontos consecutivos é
    // correlacionado, então descontar a accuracy absoluta por segmento vira um
    // viés subtrativo proporcional à taxa de amostragem
    this.distance += distanceBetween;
    this.currentSplitDistance += distanceBetween;

    // Distance Km
    const distanceKm = this.distance / 1000;

    // Avg speed
    this.avgSpeed = this.distance > 0 && this.movingDuration > 0 ?
      distanceKm / (this.movingDuration / 3600) :
      0;

    // Avg pace
    this.avgPace = this.distance > 0 && this.movingDuration > 0 ?
      this.movingDuration / distanceKm :
      0;

    // Realtime pace
    const newPace = this.calculateRealtimePace();
    const beta = 0.4;
    this.realtimePace = this.realtimePace > 0 ?
      (beta * newPace + (1 - beta) * this.realtimePace) :
      newPace;

    // Update
    this.lastPoint = normalizedPoint;

    // Split
    this.calculateSplits(durationSeconds);

    return this.getMetrics(true);
  };

  restorePoints(points: LocationPoint[]) {
    // reset
    this.distance = 0;
    this.calories = 0;
    this.splits = [];
    this.recentPoints = [];
    this.avgSpeed = 0;
    this.avgPace = 0;
    this.realtimePace = 0;
    this.elapsedSeconds = 0;
    this.currentSplitDistance = 0;
    this.currentSplitStartedAt = 0;
    this.movingDuration = 0;
    this.currentSpeed = 0;
    this.lastPoint = undefined;
    this.farRejections = 0;

    for (let i = 0; i < points.length; i++) {
      const point = points[i];

      if (!point) continue;

      let calculatedSpeed = point.speed;

      if (i > 0) {
        const prev = points[i - 1];

        if (prev) {
          const distance = geolib.getDistance(
            { latitude: prev.lat, longitude: prev.lng },
            { latitude: point.lat, longitude: point.lng }
          );

          const deltaSeconds = point.elapsedSeconds - prev.elapsedSeconds;

          if (deltaSeconds > 0) {
            calculatedSpeed = (distance / deltaSeconds) * 3.6;
          }
        }
      }

      this.addPoint(
        { ...point, speed: calculatedSpeed },
        point.elapsedSeconds
      );
    }

    return this.getMetrics(true);
  };

  getState(): RunningMetricsCheckpoint {
    return {
      distance: this.distance,
      calories: this.calories,
      movingDuration: this.movingDuration,
      avgSpeed: this.avgSpeed,
      avgPace: this.avgPace,
      realtimePace: this.realtimePace,
      currentSpeed: this.currentSpeed,
      elapsedSeconds: this.elapsedSeconds,
      currentSplitDistance: this.currentSplitDistance,
      currentSplitStartedAt: this.currentSplitStartedAt,
      cadence: this.cadence,
      splits: [...this.splits],
      lastPoint: this.lastPoint,
      steps: this.steps
    };
  };

  restoreState(state: RunningMetricsCheckpoint) {
    this.distance = state.distance;
    this.calories = state.calories;
    this.movingDuration = state.movingDuration;
    this.avgSpeed = state.avgSpeed;
    this.avgPace = state.avgPace;
    this.realtimePace = state.realtimePace;
    this.currentSpeed = state.currentSpeed;
    this.elapsedSeconds = state.elapsedSeconds;
    this.currentSplitDistance = state.currentSplitDistance;
    this.currentSplitStartedAt = state.currentSplitStartedAt;
    this.cadence = state.cadence;
    this.splits = [...state.splits];
    this.lastPoint = state.lastPoint;
    this.steps = state.steps;
  };

  async restoreSavedPoints() {
    this.pointsBuffer = JSON.parse(
      (await persistentSession.get("points")) || "[]"
    ) as LocationPoint[];
  };

  getMET() {
    const speedKmh = this.currentSpeed;
    const speedMmin = (speedKmh * 1000) / 60;

    if (speedKmh < 0.5) return 1;

    // velocidade decide o modelo
    const isWalking = speedKmh < 7;

    switch (this.category) {
      case "RUNNING":
        return isWalking
          ? (0.1 * speedMmin + 3.5) / 3.5   // ACSM walking
          : (0.2 * speedMmin + 3.5) / 3.5;  // ACSM running
      case "TRAIL_RUNNING":
        return isWalking
          ? (0.12 * speedMmin + 3.5) / 3.5  // walking em trilha
          : (0.23 * speedMmin + 3.5) / 3.5; // running em trilha
      case "WALKING":
        return (0.1 * speedMmin + 3.5) / 3.5;
      case "CYCLING":
        const met = 1 + (0.25 * speedKmh);

        // Alta velocidade sem cadência = suspeito (carro/moto/e-bike)
        if (speedKmh > 35 && this.cadence < 30) return met * 0.7;
        return met;
      case "BELT":
        return isWalking
          ? (0.1 * speedMmin + 3.5) / 3.5
          : (0.18 * speedMmin + 3.5) / 3.5;
      default:
        return 1;
    };
  };

  // Rejeições consecutivas de pontos distantes indicam âncora perdida (drift
  // durante rejeição, não outlier isolado): re-ancora sem somar distância para
  // o rastreio retomar em vez de travar até o fim da atividade
  private rejectFarPoint(point: LocationPoint, distanceBetween: number) {
    if (distanceBetween > 40) {
      this.farRejections++;

      if (this.farRejections >= 3) {
        this.farRejections = 0;
        this.lastPoint = point;
      }
    }

    return this.getMetrics(false);
  };

  private getMaxImpliedSpeedMs() {
    switch (this.category) {
      case "RUNNING":
      case "TRAIL_RUNNING":
        return 12;
      case "WALKING":
        return 4;
      case "CYCLING":
        return 25;
      default:
        return 12;
    };
  };

  private getPointConfidence(point: Omit<LocationPoint, "elapsedSeconds">, distanceBetween: number) {
    let confidence = 100;
    const speedKmh = point.speed;

    // GPS ruim
    if (point.accuracy > 15) {
      confidence -= 30;
    }

    // teleport
    if (distanceBetween > 40) {
      confidence -= 60;
    }

    // parado mas andando no GPS — só é suspeito se o Doppler também indicar
    // parado (ciclistas não geram cadência de passos e não podem ser punidos)
    if (this.cadence < 20 && distanceBetween > 15 && speedKmh < 3) {
      confidence -= 40;
    }

    switch (this.category) {
      case "RUNNING":
      case "TRAIL_RUNNING":
        if (speedKmh > 25) confidence -= 50;
        if (speedKmh > 18 && this.cadence < 60) confidence -= 20;
        if (speedKmh > 20 && this.acceleration < 0.05) confidence -= 20;
        break;
      case "WALKING":
        if (speedKmh > 10) confidence -= 50;
        break;
      case "CYCLING":
        if (speedKmh > 20 && this.cadence < 40) confidence -= 30;
        if (speedKmh > 25 && this.acceleration < 0.05) confidence -= 30;
        break;
      case "BELT":
        if (distanceBetween > 10) confidence -= 60;
        if (this.cadence < 100) confidence -= 40;
        break;
    }

    return confidence;
  };

  private calculateRealtimePace() {
    const points = this.recentPoints;

    // poucos pontos
    if (points.length < 2) return 0;

    let distance = 0;

    // distância acumulada
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];

      distance += geolib.getDistance(
        { latitude: prev!.lat, longitude: prev!.lng },
        { latitude: curr!.lat, longitude: curr!.lng }
      );
    }

    // evitar lixo
    if (distance < 15) {
      return this.currentSpeed < 0.8 ? 0 : this.realtimePace;
    }

    const first = points[0]!;
    const last = points[points.length - 1]!;

    // tempo em segundos
    const durationSeconds = last.elapsedSeconds - first.elapsedSeconds;

    if (durationSeconds <= 0) return 0;

    // km
    const distanceKm = distance / 1000;

    // seconds per km
    return durationSeconds / distanceKm;
  };

  private calculateSplits(durationSeconds: number) {
    if (this.currentSplitDistance < 1000) {
      return;
    }

    // duração do split atual
    const splitDuration = durationSeconds - this.currentSplitStartedAt;

    //evitar lixo
    if (splitDuration <= 0) {
      return;
    }

    // pace - seconds per km
    const splitDurationExact = splitDuration * (1000 / this.currentSplitDistance);
    const splitPace = splitDurationExact;

    // salva split
    this.splits.push({
      km: this.splits.length + 1,
      duration: splitDurationExact,
      pace: splitPace,
    });

    // mantém sobra - ex: 1015m - sobra 15m
    this.currentSplitDistance -= 1000;

    // novo início
    this.currentSplitStartedAt = durationSeconds;
  };

  private getMetrics(ok: boolean)  {
    return {
      duration: this.elapsedSeconds,
      movingDuration: this.movingDuration,
      distance: this.distance,
      avgPace: this.avgPace,
      realtimePace: this.realtimePace,
      avgSpeed: this.avgSpeed,
      calories: this.calories,
      splits: [...this.splits],
      lastPoint: ok ? this.lastPoint : undefined
    };
  };

  static formatPace(secondsPerKm: number) {
    if (!secondsPerKm ||!isFinite(secondsPerKm)) {
      return "--:--";
    }

    const totalSeconds = Math.floor(secondsPerKm);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  };

  static formatDistance(meters: number) {
    return (meters / 1000).toFixed(2);
  };

  static async getPointsAndRemove(workoutId: string) {
    const sqliteService = new SqliteService();
    await sqliteService.init();

    const points = await sqliteService.getWorkoutPoints(workoutId);

    await sqliteService.deleteWorkoutPoints(workoutId);
    await sqliteService.close();

    return points;
  };

  static async removePoints(workoutId: string) {
    const sqliteService = new SqliteService();
    await sqliteService.init();
    await sqliteService.deleteWorkoutPoints(workoutId);
    await sqliteService.close();
  };
};