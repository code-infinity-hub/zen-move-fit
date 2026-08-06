import { AppAttest, Preferences } from "@/mobile";
import { Fetcher } from "@/plugins/Fetcher";

const REGISTERED_KEY_ID_STORAGE_KEY = "attestation-registered-key-id";

export class AttestationService {
  private keyId: string | null = null;
  private ensurePromise: Promise<string | null> | null = null;

  private async post(url: string, body: Record<string, any> = {}): Promise<Record<string, any> | null> {
    try {
      const response = await Fetcher(`${import.meta.env.VITE_API_BACKEND}${url}`, { method: "POST", body });
      return response.error ? null : (response.json || null);
    } catch {
      return null;
    };
  };

  private async register(keyId: string): Promise<boolean> {
    const challengeResponse = await this.post("attestation/challenge");
    if (!challengeResponse?.challenge) return false;

    const attestation = await AppAttest.createAttestation({ keyId, challenge: challengeResponse.challenge });

    const registerResponse = await this.post("attestation/register", {
      platform: attestation.platform,
      format: attestation.format,
      key_id: attestation.keyId,
      challenge: attestation.challenge,
      token: attestation.token
    });

    if (!registerResponse) {
      await AppAttest.clearStoredKeyId();
    };

    return Boolean(registerResponse);
  };

  private async prepare(): Promise<string | null> {
    try {
      const support = await AppAttest.isSupported();
      if (!support.isSupported) return null;

      const stored = await AppAttest.getStoredKeyId();
      let keyId = stored.hasStoredKey ? stored.keyId : null;

      if (!keyId) {
        const prepared = await AppAttest.prepare();
        keyId = prepared.keyId;
        await AppAttest.storeKeyId({ keyId });
      };

      // Apple only allows one attestation per key ever created — only (re)register when the
      // stored key changed (fresh install, key rotated), never on every app launch.
      const { value: registeredKeyId } = await Preferences.get({ key: REGISTERED_KEY_ID_STORAGE_KEY });

      if (registeredKeyId !== keyId) {
        const registered = await this.register(keyId);
        if (!registered) return null;
        await Preferences.set({ key: REGISTERED_KEY_ID_STORAGE_KEY, value: keyId });
      };

      this.keyId = keyId;
      return keyId;
    } catch {
      return null;
    };
  };

  async ensureKey(): Promise<string | null> {
    if (this.keyId) return this.keyId;
    if (!this.ensurePromise) this.ensurePromise = this.prepare().finally(() => this.ensurePromise = null);
    return await this.ensurePromise;
  };

  async getAssertionHeaders(): Promise<Record<string, string>> {
    const keyId = await this.ensureKey();
    if (!keyId) return { };

    const challengeResponse = await this.post("attestation/challenge");
    if (!challengeResponse?.challenge) return { };

    try {
      const assertion = await AppAttest.createAssertion({ keyId, payload: challengeResponse.challenge });

      return {
        "x-attestation-platform": assertion.platform,
        "x-attestation-key-id": assertion.keyId,
        "x-attestation-challenge": challengeResponse.challenge,
        "x-attestation-token": assertion.token
      };
    } catch {
      return { };
    };
  };
};

export const attestationService = new AttestationService();