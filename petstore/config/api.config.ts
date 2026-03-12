export const API_CONFIG = {
  BASE_URL: 'https://petstore.swagger.io/v2',
  API_KEY: 'special-key',
  TIMEOUT: 30000,
};

export const ENDPOINTS = {
  // Pet endpoints
  PET: '/pet',
  PET_BY_ID: (id: number) => `/pet/${id}`,
  PET_FIND_BY_STATUS: '/pet/findByStatus',
  PET_FIND_BY_TAGS: '/pet/findByTags',
  PET_UPLOAD_IMAGE: (id: number) => `/pet/${id}/uploadImage`,

  // Store endpoints
  STORE_INVENTORY: '/store/inventory',
  STORE_ORDER: '/store/order',
  STORE_ORDER_BY_ID: (id: number) => `/store/order/${id}`,

  // User endpoints
  USER: '/user',
  USER_BY_NAME: (username: string) => `/user/${username}`,
  USER_LOGIN: '/user/login',
  USER_LOGOUT: '/user/logout',
  USER_CREATE_WITH_ARRAY: '/user/createWithArray',
  USER_CREATE_WITH_LIST: '/user/createWithList',
};

export const PET_STATUS = {
  AVAILABLE: 'available',
  PENDING: 'pending',
  SOLD: 'sold',
} as const;

export const ORDER_STATUS = {
  PLACED: 'placed',
  APPROVED: 'approved',
  DELIVERED: 'delivered',
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
} as const;
