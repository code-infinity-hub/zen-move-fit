export class KalmanFilter {
  private x: number = 0; // Valor estimado (Lat ou Lng)
  private p: number = 1; // Erro da estimativa
  private q: number;     // Ruído do processo (constante de agilidade)
  private initialized = false;

  constructor(q: number = 0.000001) {
    this.q = q;
  };

  public filter(measurement: number, accuracy: number, processNoise?: number): number {
    if (!this.initialized) {
      this.x = measurement;
      this.initialized = true;
      return measurement;
    }

    // Predição: process noise adaptativo à velocidade — parado tende a zero
    // (amortecimento máximo do jitter); em movimento o filtro acompanha a
    // medição sem lag, evitando o corte de curvas. Sem o parâmetro, usa o q fixo
    this.p = this.p + (processNoise ?? this.q);

    // Ganho de Kalman (Quanto maior o accuracy do GPS, menor o ganho K)
    // Nota: Dividimos accuracy por um fator de escala para bater com as casas decimais de Lat/Lng
    const r = (accuracy * accuracy) / 100000000;
    const k = this.p / (this.p + r);

    // Atualização
    this.x = this.x + k * (measurement - this.x);
    this.p = (1 - k) * this.p;

    return this.x;
  };
};