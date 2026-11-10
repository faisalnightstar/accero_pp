import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters long for cryptographic security'),
  
  // Payment Credentials (Paytm)
  PAYTM_MID: z.string().optional(),
  PAYTM_MERCHANT_KEY: z.string().optional(),
  PAYTM_UPI: z.string().optional(),
  PAYTM_WEBSITE: z.string().default('DEFAULT'),
  PAYTM_ENVIRONMENT: z.enum(['STANDARD', 'CUSTOM']).default('STANDARD'),
  
  // External Verification APIs
  NEO_API_KEY: z.string().optional(),
  AXEN_API_KEY: z.string().optional(),
  FASTNEXORA_API_KEY: z.string().optional(),
  
  // Distributed Rate Limiting (Upstash Redis)
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  
  // Sandbox testing control (strictly forbidden in production)
  ALLOW_SANDBOX_RECHARGE: z.string().optional(),
  ALLOW_MOCK_PROVIDERS: z.string().optional(),
});

export type EnvConfig = z.infer<typeof envSchema>;

let validatedEnv: EnvConfig | null = null;

export function getEnv(): EnvConfig {
  if (validatedEnv) return validatedEnv;

  const rawEnv = {
    NODE_ENV: process.env.NODE_ENV,
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    PAYTM_MID: process.env.PAYTM_MID || process.env.MID1,
    PAYTM_MERCHANT_KEY: process.env.PAYTM_MERCHANT_KEY,
    PAYTM_UPI: process.env.PAYTM_UPI || process.env.UPI1,
    PAYTM_WEBSITE: process.env.PAYTM_WEBSITE,
    PAYTM_ENVIRONMENT: process.env.PAYTM_ENVIRONMENT,
    NEO_API_KEY: process.env.NEO_API_KEY,
    AXEN_API_KEY: process.env.AXEN_API_KEY,
    FASTNEXORA_API_KEY: process.env.FASTNEXORA_API_KEY,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    ALLOW_SANDBOX_RECHARGE: process.env.ALLOW_SANDBOX_RECHARGE,
    ALLOW_MOCK_PROVIDERS: process.env.ALLOW_MOCK_PROVIDERS,
  };

  const parsed = envSchema.safeParse(rawEnv);

  if (!parsed.success) {
    const errorDetails = parsed.error.issues
      .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    const msg = `[CRITICAL CONFIG ERROR] Invalid or missing environment configuration:\n${errorDetails}`;
    
    // In production or when JWT_SECRET is missing, fail immediately
    if (process.env.NODE_ENV === 'production' || !process.env.JWT_SECRET) {
      console.error(msg);
      throw new Error(msg);
    } else {
      console.warn(msg);
      // In dev mode with missing JWT secret, require explicit fix
      if (!rawEnv.JWT_SECRET || rawEnv.JWT_SECRET.length < 32) {
        throw new Error('JWT_SECRET must be configured with at least 32 characters in .env.local');
      }
    }
  }

  validatedEnv = parsed.data as EnvConfig;
  return validatedEnv;
}

