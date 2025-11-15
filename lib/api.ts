import axios, { AxiosInstance, isAxiosError } from "axios";

export const BASE_URL = "http://localhost:3030";
export const AXIOS: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Interceptors: log requests and responses
const isDev =
  typeof __DEV__ !== "undefined"
    ? __DEV__
    : process.env.NODE_ENV !== "production";

// Request interceptor
AXIOS.interceptors.request.use(
  (config) => {
    // Ensure Authorization header is synced with the global axios default if not explicitly set
    const globalAuth = (axios.defaults.headers.common || ({} as any))[
      "Authorization"
    ] as string | undefined;
    const hasAuthOnConfig = !!(config.headers as any)?.Authorization;
    if (!hasAuthOnConfig && globalAuth) {
      (config.headers as any) = {
        ...(config.headers as any),
        Authorization: globalAuth,
      };
    }

    if (isDev) {
      const rawHeaders = config.headers as any;
      const headers =
        typeof rawHeaders?.toJSON === "function"
          ? rawHeaders.toJSON()
          : rawHeaders;

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
      const headers =
        typeof rawHeaders?.toJSON === "function"
          ? rawHeaders.toJSON()
          : rawHeaders;

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
      if (isAxiosError(error)) {
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

export interface IUsersAddress {
  name: string;
  lat: number;
  lon: number;
}

export interface IUser {
  id: string;
  firstName: string;
  lastName: string;
  role: Role;
  email: string;
  mobile: string;
  profilePic: string | null;
  countryCode: string;
  registrationDate: Date | string;
  updatedAt: Date | string;
  registrationMode: "google" | "apple" | "manual";
  usersAddress?: IUsersAddress | null;
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
  usersAddress: IUsersAddress;
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
    const { data } = await AXIOS.post<IApiResponse<IAuthSuccessData>>(
      "/api/v1/auth/login",
      payload
    );
    return data;
  },
  signUp: async (payload: ISignUpPayload) => {
    const { data } = await AXIOS.post<IApiResponse<IAuthSuccessData>>(
      "/api/v1/auth/sign-up",
      payload
    );
    return data;
  },
  sendOtp: async (payload: IOtpPayload) => {
    const { data } = await AXIOS.post<IApiResponse<string>>(
      "/api/v1/otp",
      payload
    );
    return data;
  },
  consumeOtp: async (payload: IOtpConsumePayload) => {
    const { data } = await AXIOS.post<IApiResponse<{ message: string }>>(
      "/api/v1/otp/consume",
      payload
    );
    return data;
  },
  resetPassword: async (payload: IResetPasswordPayload) => {
    const { data } = await AXIOS.post<IApiResponse<string>>(
      "/api/v1/auth/reset-password",
      payload
    );
    return data;
  },
  // New: unified existence check by email or mobile
  checkExisting: async (emailOrMobile: string) => {
    const { data } = await AXIOS.get<
      IApiResponse<{ exists: boolean; registrationMode?: string }>
    >("/api/v1/auth/check-existing", { params: { emailOrMobile } });
    return data;
  },
  userExistsByMobile: async (mobile: string) => {
    const { data } = await AXIOS.get<IApiResponse<any>>(
      "/api/v1/user/exists/mobile",
      { params: { mobile } }
    );
    // Support either {data: {exists:boolean}} or {data:boolean}
    const exists = (data as any)?.data?.exists ?? (data as any)?.data ?? false;
    return Boolean(exists);
  },
  userExistsByEmail: async (email: string) => {
    const { data } = await AXIOS.get<IApiResponse<any>>(
      "/api/v1/user/exists/email",
      { params: { email } }
    );
    const exists = (data as any)?.data?.exists ?? (data as any)?.data ?? false;
    return Boolean(exists);
  },
} as const;

export type AuthService = typeof authService;

// Wallet & Transactions
export interface IWallet {
  id: string;
  walletBalance: number;
  createdAt: string;
  isFrozen: boolean;
  customerCode: string;
}

export type TransactionType = "DEPOSIT" | "WITHDRAWAL" | "TRANSFER" | string;
export interface ITransaction {
  id: string;
  amount: number;
  type: TransactionType;
  createdAt: string;
  orderId: string | null;
  description: string;
  status: string;
  // present for ORDER transactions in history list
  orderStatus?: string;
}

export interface IPaginated<T> {
  total: number;
  page: number;
  take: number;
  totalPages: number;
  data?: T[]; // when the API wraps it differently
}

export interface IVirtualAccount {
  id: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  customerCode: string;
}

export const walletService = {
  getWallet: async () => {
    const { data } = await AXIOS.get<IApiResponse<IWallet>>("/api/v1/wallet");
    return data;
  },
  getVirtualAccount: async () => {
    const { data } = await AXIOS.get<IApiResponse<IVirtualAccount>>(
      "/api/v1/wallet/virtual-account"
    );
    return data;
  },
  fund: async (payload: IFundWallet) => {
    const { data } = await AXIOS.post<IApiResponse<string>>(
      "/api/v1/wallet/fund",
      payload
    );
    return data;
  },
} as const;

// User Profile & Password
export interface IUpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  profilePic?: string | null;
  countryCode?: string;
  email?: string;
  mobile?: string;
  usersAddress?: IUsersAddress;
}

export interface IUpdatePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface IFundWallet {
  customerCode: string;
  transactionReference: string;
}
export const userService = {
  updateProfile: async (payload: IUpdateProfilePayload) => {
    const { data } = await AXIOS.put<IApiResponse<IUser>>(
      "/api/v1/user/profile",
      payload
    );
    return data;
  },
  updatePassword: async (payload: IUpdatePasswordPayload) => {
    const { data } = await AXIOS.put<IApiResponse<string>>(
      "/api/v1/user/password/update",
      payload
    );
    return data;
  },
  getProfile: async () => {
    const { data } = await AXIOS.get<IApiResponse<IUser>>(
      "/api/v1/user/profile"
    );
    return data;
  },
} as const;

export interface IOrderTracking {
  id: string;
  status: string; // e.g., picked_up, in_transit, delivered
  note: string | null;
  createdAt: string;
  updatedAt: string;
  orderId: string;
}

// Updated: pickUpLocation is now an object
export interface IOrderLocation {
  address: string;
  latitude: string;
  longitude: string;
}

export interface IOrderData {
  id: string;
  sender: any;
  recipient: any;
  pickUpLocation: IOrderLocation; // updated from string to object
  dropOffLocation: IOrderLocation; // updated from string to object
  userOrderRole: string;
  vehicleType: string;
  noteForRider: string | null;
  serviceChargeAmount: number | string;
  deliveryFee: number | string;
  totalAmount: number | string;
  eta: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  orderTracking?: IOrderTracking[];
}

export interface ITransactionDetail {
  id: string;
  walletId: string;
  userId: string;
  amount: number | string;
  reference: string | null;
  orderId: string | null;
  order: IOrderData | null;
  type: string; // e.g., ORDER, DEPOSIT
  description: string | null;
  createdAt: string;
  updatedAt: string;
  status: string;
}

export const transactionService = {
  getRecent: async (params: {
    limit: number;
    page: number;
    transactionType?: "ORDER" | "DEPOSIT" | string;
  }) => {
    const { data } = await AXIOS.get<
      IApiResponse<ITransaction[]> & { pagination: IPaginated<ITransaction> }
    >("/api/v1/transaction", { params });
    return data;
  },
  getById: async (id: string) => {
    const { data } = await AXIOS.get<IApiResponse<ITransactionDetail | null>>(
      `/api/v1/transaction/${id}`
    );
    return data;
  },
} as const;

// Location Search

// Order & Pricing
export interface ICalculateChargeParams {
  startLat: number;
  startLon: number;
  endLat: number;
  endLon: number;
  vehicleType: string; // e.g., bicycle | bike | van etc.
  isUrgent: boolean;
  urgencyFee?: number; // urgency fee amount
}

export interface ICalculateChargeData {
  totalAmount: number;
  deliveryFee: number;
  serviceCharge: number;
  duration: string; // e.g., "2 minutes 30 seconds"
}

export interface ICreateOrderPayload {
  sender: {
    name: string;
    email: string;
    phone: string;
  };
  recipient: {
    name: string;
    email: string;
    phone: string;
  };
  dropOffLocation: string;
  pickUpLocation: string;
  userOrderRole: "sender" | "recipient" | string;
  vehicleType: string; // e.g., bike
  noteForRider?: string | null;
}

// export interface IOrderData {
//   id: string;
//   sender: any;
//   recipient: any;
//   pickUpLocation: string;
//   dropOffLocation: string;
//   userOrderRole: string;
//   vehicleType: string;
//   noteForRider: string | null;
//   serviceChargeAmount: number;
//   deliveryFee: number;
//   totalAmount: number;
//   eta: string;
//   userId: string;
//   createdAt: string;
//   updatedAt: string;
// }

export const orderService = {
  calculateCharge: async (params: ICalculateChargeParams) => {
    const { data } = await AXIOS.get<IApiResponse<ICalculateChargeData>>(
      "/api/v1/order/calculate-charge",
      { params }
    );
    return data;
  },
  calculateMultipleDeliveryCharge: async (params: {
    pickupLocation: [number, number]; // [lon, lat]
    deliveryLocations: [number, number][]; // [[lon, lat], ...]
    isUrgent: boolean;
    urgencyFee?: number;
  }) => {
    const { data } = await AXIOS.post<
      IApiResponse<{
        totalAmount: number;
        totalDeliveryFee: number;
        serviceCharge: number;
        pickupLocation: [number, number];
        deliveries: {
          deliveryLocation: [number, number];
          distance_from_pickup_km: number;
          duration_from_pickup: string;
          deliveryFee: number;
        }[];
        totalDistanceKm: number;
        estimatedTotalDuration: string;
        vehicleType: string;
      }>
    >("/api/v1/order/calculate-multiple-delivery-charge", params);
    return data;
  },
  create: async (
    query: {
      startLat: number;
      startLon: number;
      endLat: number;
      endLon: number;
      vehicleType: string;
      isUrgent: boolean;
      urgencyFee?: number;
    },
    payload: ICreateOrderPayload
  ) => {
    const { data } = await AXIOS.post<IApiResponse<IOrderData>>(
      "/api/v1/order",
      payload,
      { params: query }
    );
    return data;
  },
  createMultipleDelivery: async (payload: {
    sender: {
      name: string;
      email: string;
      phone: string;
    };
    pickUpAddress: string;
    pickUpCoordinates: [number, number]; // [lon, lat]
    deliveryLocations: {
      address: string;
      coordinates: [number, number]; // [lon, lat]
      recipient: {
        name: string;
        email: string;
        phone: string;
      };
    }[];
    userOrderRole: string;
    noteForRider?: string | null;
    isUrgent: boolean;
    urgencyFee?: number;
  }) => {
    const { data } = await AXIOS.post<IApiResponse<IOrderData>>(
      "/api/v1/order/multiple-delivery",
      payload
    );
    return data;
  },
  getAddressBook: async (query?: string) => {
    const { data } = await AXIOS.get<{
      success: boolean;
      message: string;
      data: {
        name: string;
        email: string;
        phone: string;
        role: "sender" | "recipient";
      }[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    }>("/api/v1/order/address-book", {
      params: query ? { query } : undefined,
    });
    return data;
  },
} as const;

export interface ILocationFeatureProperties {
  osm_type: string;
  osm_id: number;
  osm_key?: string;
  osm_value?: string;
  type?: string;
  postcode?: string;
  housenumber?: string;
  countrycode?: string;
  name?: string;
  country?: string;
  city?: string;
  street?: string;
  state?: string;
  county?: string;
  extent?: number[];
}

export interface ILocationFeatureGeometry {
  type: "Point" | string;
  coordinates: [number, number]; // [lon, lat]
}

export interface ILocationFeature {
  type: string;
  properties: ILocationFeatureProperties;
  geometry: ILocationFeatureGeometry;
}

export const locationService = {
  search: async (q: string) => {
    const { data } = await AXIOS.get<IApiResponse<ILocationFeature[]>>(
      "/api/v1/location/search",
      { params: { q } }
    );
    return data;
  },
  reverse: async (lat: number, lon: number) => {
    const { data } = await AXIOS.get<IApiResponse<any>>(
      "/api/v1/location/reverse",
      { params: { lat, lon } }
    );
    return data;
  },
} as const;

// Storage Media Upload Service
export interface IRateRiderPayload {
  riderId: string;
  score: number; // 1-5
  comment?: string;
}

export const ratingsService = {
  rate: async (payload: IRateRiderPayload) => {
    const { data } = await AXIOS.post<IApiResponse<{ message: string }>>(
      "/api/v1/ratings/rate",
      payload,
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return data;
  },
} as const;

export const storageService = {
  upload: async (file: { uri: string; name?: string; type?: string }) => {
    const form = new FormData();
    const filename =
      file.name || file.uri.split("/").pop() || `upload-${Date.now()}.jpg`;
    const mimetype = file.type || "image/jpeg";
    form.append("file", {
      // @ts-ignore React Native FormData file
      uri: file.uri,
      name: filename,
      type: mimetype,
    } as any);

    const { data } = await AXIOS.post<
      IApiResponse<{
        filename: string;
        mimetype: string;
        size: number;
        url: string;
      }>
    >("/api/v1/storage-media/upload", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
} as const;

// Tasks
export type TaskCategory = "request_review" | string;
export type TaskStatus = "pending" | "completed" | "cancelled";

export interface ITaskReference {
  userId: string;
  profilePic: string;
  firstName: string;
  lastName: string;
}

export interface ITask {
  id: string;
  category: TaskCategory;
  status: TaskStatus;
  userId: string;
  reference: string; // JSON string containing ITaskReference
  createdAt: string;
  completedAt: string | null;
}

export interface ITaskPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ITaskListResponse {
  success: boolean;
  message: string;
  data: ITask[];
  pagination: ITaskPagination;
}

export interface IRateUserPayload {
  targetUserId: string;
  starRating: number;
  comment: string;
}

export const taskService = {
  getTasks: async (params: {
    status?: TaskStatus;
    page?: number;
    limit?: number;
  }) => {
    const { data } = await AXIOS.get<ITaskListResponse>("/api/v1/task", {
      params,
    });
    return data;
  },
  completeTask: async (taskId: string) => {
    const { data } = await AXIOS.patch<IApiResponse<ITask>>(
      `/api/v1/task/${taskId}/complete`
    );
    return data;
  },
  cancelTask: async (taskId: string) => {
    console.log("Cancelling task:", taskId);
    const { data } = await AXIOS.patch<IApiResponse<ITask>>(
      `/api/v1/task/${taskId}/cancel`
    );
    return data;
  },
} as const;

// Ratings
export const ratingService = {
  rateUser: async (payload: IRateUserPayload) => {
    const { data } = await AXIOS.post<IApiResponse<any>>(
      "/api/v1/ratings/rate",
      payload
    );
    return data;
  },
} as const;
