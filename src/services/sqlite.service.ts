import {
  CapacitorSQLite,
  SQLiteConnection,
  SQLiteDBConnection
} from "@/mobile";

export class SqliteService {
  static instance = new SqliteService();
  private sqlite!: SQLiteConnection;
  private db!: SQLiteDBConnection;
  private initialized = false;

  get database() {
    return this.db;
  };

  async init() {
    if (SqliteService.instance.initialized) return;

    SqliteService.instance.sqlite = new SQLiteConnection(CapacitorSQLite);

    SqliteService.instance.db = await SqliteService.instance.sqlite.createConnection(
      "running_db",
      false,
      "no-encryption",
      1,
      false
    );

    await SqliteService.instance.db.open();

    await SqliteService.instance.createTables();

    SqliteService.instance.initialized = true;

    console.debug("[SQLITE] initialized");
  };

  async close() {
    await SqliteService.instance.sqlite.closeConnection("running_db", false);
    SqliteService.instance.initialized = false;
    console.debug("[SQLITE] closed");
  };

  async createTables() {
    await Promise.all([
      SqliteService.instance.db.execute(`
        CREATE TABLE IF NOT EXISTS workout_points (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          workout_id TEXT,
          lat REAL,
          lng REAL,
          accuracy REAL,
          altitude REAL,
          altitudeAccuracy REAL,
          speed REAL,
          time INTEGER,
          elapsedSeconds REAL
        );
      `),
      SqliteService.instance.db.execute(`
        CREATE INDEX IF NOT EXISTS idx_workout_points_workout_id
        ON workout_points(workout_id);
      `),
      SqliteService.instance.db.execute(`
        CREATE INDEX IF NOT EXISTS idx_workout_points_time
        ON workout_points(time);
      `)
    ]);
  };

  async insertPoints(
    workoutId: string,
    points: {
      lat: number,
      lng: number,
      accuracy:number,
      altitude: number,
      altitudeAccuracy: number,
      speed: number,
      time: number,
      elapsedSeconds: number,
    }[]
  ) {
    if (!points.length) {
      return;
    }

    const statements = points.map((point) => ({
      statement: `
        INSERT INTO workout_points (
          workout_id,
          lat,
          lng,
          accuracy,
          altitude,
          altitudeAccuracy,
          speed,
          time,
          elapsedSeconds
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      values: [
        workoutId,
        point.lat,
        point.lng,
        point.accuracy,
        point.altitude,
        point.altitudeAccuracy,
        point.speed,
        point.time,
        point.elapsedSeconds,
      ],
    }));

    if (statements.length) {
      await SqliteService.instance.db.executeSet(statements);
    }
  };

  async getWorkoutPoints(workoutId: string) {
    const result = await SqliteService.instance.db.query(
      `
        SELECT *
        FROM workout_points
        WHERE workout_id = ?
        ORDER BY time ASC, id ASC
      `,
      [workoutId]
    );

    return result.values || [];
  };

  async deleteWorkoutPoints(workoutId: string) {
    await SqliteService.instance.db.run(
      `
        DELETE FROM workout_points
        WHERE workout_id = ?
      `,
      [workoutId]
    );
  };
};