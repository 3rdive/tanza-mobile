import axios, { AxiosInstance } from "axios";

export const BASE_URL = "https://a724ded58c5f.ngrok-free.app";
export const AXIOS: AxiosInstance = axios.create({ baseURL: BASE_URL, timeout: 10000 });

// Interceptors: log requests and responses
const isDev = typeof __DEV__ !== "undefined" ? __DEV__ : process.env.NODE_ENV !== "production";

// Request interceptor
AXIOS.interceptors.request.use(
  (config) => {
    if (isDev) {
      const rawHeaders = config.headers as any;
      const headers = typeof rawHeaders?.toJSON === "function" ? rawHeaders.toJSON() : rawHeaders;

      // Redact sensitive headers
      const safeHeaders: Record<string, unknown> = { ...(headers || {}) };
      // if (safeHeaders.Authorization) safeHeaders.Authorization = "***redacted***";

      console.log("[Axios Request]", {
        baseURL: config.baseURL,
        method: config.method,
        url: config.url,
        params: config.params,
        headers: safeHeaders,
        data: config.data,
        timeout: config.timeout,
      });
    }
    return config;
  },
  (error) => {
    if (isDev) {
      console.error("[Axios Request Error]", {
        message: error?.message,
        stack: error?.stack,
      });
    }
    return Promise.reject(error);
  }
);

// Response interceptor
AXIOS.interceptors.response.use(
  (response) => {
    if (isDev) {
      const rawHeaders = response.headers as any;
      const headers = typeof rawHeaders?.toJSON === "function" ? rawHeaders.toJSON() : rawHeaders;

      console.log("[Axios Response]", {
        method: response.config?.method,
        url: response.config?.url,
        status: response.status,
        statusText: response.statusText,
        headers,
        data: response.data,
      });
    }
    return response;
  },
  (error) => {
    if (isDev) {
      if (axios.isAxiosError(error)) {
        const res = error.response;
        console.error("[Axios Response Error]", {
          method: error.config?.method,
          url: error.config?.url,
          status: res?.status,
          statusText: res?.statusText,
          data: res?.data,
          message: error.message,
        });
      } else {
        console.error("[Axios Response Error]", error);
      }
    }
    return Promise.reject(error);
  }
);



// Types
export type Role = "user" | "admin" | string;

export interface IUser {
  id: string;
  firstName: string;
  lastName: string;
  role: Role;
	email: string;
	mobile: string;
 profilePic: string | null;
 countryCode: string;
 registrationDate: Date;
 updatedAt: Date;
 registrationMode: 'google' | 'apple' | 'manual';
}

export interface IApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface IAuthSuccessData {
  access_token: string | null;
  user: IUser | null;
}

export interface ILoginPayload {
  emailOrMobile: string;
  password: string;
}

export interface ISignUpPayload {
  lastName: string;
  firstName: string;
  email: string;
  mobile: string;
  password: string;
  otp: string;
  profilePic?: string | null;
  countryCode: string; // e.g. "+234"
}

export interface IOtpPayload {
  otpType: "MOBILE" | "EMAIL";
  reference: string; // phone or email
}

export interface IOtpConsumePayload extends IOtpPayload {
  code: string;
}

export interface IResetPasswordPayload {
  password: string;
  reference: string;
  code: string;
}

export const authService = {
  login: async (payload: ILoginPayload) => {
    const { data } = await AXIOS.post<IApiResponse<IAuthSuccessData>>("/api/v1/auth/login", payload);
    return data;
  },
  signUp: async (payload: ISignUpPayload) => {
    const { data } = await AXIOS.post<IApiResponse<IAuthSuccessData>>("/api/v1/auth/sign-up", payload);
    return data;
  },
  sendOtp: async (payload: IOtpPayload) => {
    const { data } = await AXIOS.post<IApiResponse<string>>("/api/v1/otp", payload);
    return data;
  },
  consumeOtp: async (payload: IOtpConsumePayload) => {
    const { data } = await AXIOS.post<IApiResponse<{ message: string }>>("/api/v1/otp/consume", payload);
    return data;
  },
  resetPassword: async (payload: IResetPasswordPayload) => {
    const { data } = await AXIOS.post<IApiResponse<string>>("/api/v1/auth/reset-password", payload);
    return data;
  },
  // New: unified existence check by email or mobile
  checkExisting: async (emailOrMobile: string) => {
    const { data } = await AXIOS.get<IApiResponse<{ exists: boolean; registrationMode?: string }>>("/api/v1/auth/check-existing", { params: { emailOrMobile } });
    return data;
  },
  userExistsByMobile: async (mobile: string) => {
    const { data } = await AXIOS.get<IApiResponse<any>>("/api/v1/user/exists/mobile", { params: { mobile } });
    // Support either {data: {exists:boolean}} or {data:boolean}
    const exists = (data as any)?.data?.exists ?? (data as any)?.data ?? false;
    return Boolean(exists);
  },
  userExistsByEmail: async (email: string) => {
    const { data } = await AXIOS.get<IApiResponse<any>>("/api/v1/user/exists/email", { params: { email } });
    const exists = (data as any)?.data?.exists ?? (data as any)?.data ?? false;
    return Boolean(exists);
  },
} as const;

export type AuthService = typeof authService;