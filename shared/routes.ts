import { z } from 'zod';
import { 
  insertUserSchema, insertGiftCardSchema, insertSellRequestSchema, 
  insertPayoutDetailsSchema, insertKycDocumentSchema, insertBannerSchema, 
  insertSupportTicketSchema, loginSchema,
  users, giftCards, sellRequests, payoutDetails, kycDocuments, banners, supportTickets
} from './schema';

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  notFound: z.object({ message: z.string() }),
  unauthorized: z.object({ message: z.string() }),
  internal: z.object({ message: z.string() }),
};

export const api = {
  auth: {
    register: {
      method: 'POST' as const,
      path: '/api/auth/register' as const,
      input: insertUserSchema,
      responses: {
        201: z.object({ token: z.string(), user: z.custom<typeof users.$inferSelect>() }),
        400: errorSchemas.validation,
      }
    },
    login: {
      method: 'POST' as const,
      path: '/api/auth/login' as const,
      input: loginSchema,
      responses: {
        200: z.object({ token: z.string(), user: z.custom<typeof users.$inferSelect>() }),
        401: errorSchemas.unauthorized,
      }
    },
    me: {
      method: 'GET' as const,
      path: '/api/auth/me' as const,
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: errorSchemas.unauthorized,
      }
    }
  },
  giftCards: {
    list: {
      method: 'GET' as const,
      path: '/api/gift-cards' as const,
      responses: { 200: z.array(z.custom<typeof giftCards.$inferSelect>()) }
    }
  },
  sellRequests: {
    list: {
      method: 'GET' as const,
      path: '/api/sell-requests' as const,
      responses: { 200: z.array(z.custom<typeof sellRequests.$inferSelect>()) }
    },
    create: {
      method: 'POST' as const,
      path: '/api/sell-requests' as const,
      input: insertSellRequestSchema,
      responses: {
        201: z.custom<typeof sellRequests.$inferSelect>(),
        400: errorSchemas.validation,
        403: z.object({ message: z.string() })
      }
    },
    updateStatus: {
      method: 'PATCH' as const,
      path: '/api/sell-requests/:id/status' as const,
      input: z.object({ status: z.string(), rejectionNote: z.string().optional() }),
      responses: {
        200: z.custom<typeof sellRequests.$inferSelect>(),
        404: errorSchemas.notFound,
      }
    }
  },
  payoutDetails: {
    get: {
      method: 'GET' as const,
      path: '/api/payout-details' as const,
      responses: { 200: z.custom<typeof payoutDetails.$inferSelect>().nullable() }
    },
    save: {
      method: 'POST' as const,
      path: '/api/payout-details' as const,
      input: insertPayoutDetailsSchema,
      responses: { 200: z.custom<typeof payoutDetails.$inferSelect>() }
    }
  },
  kyc: {
    get: {
      method: 'GET' as const,
      path: '/api/kyc' as const,
      responses: { 200: z.custom<typeof kycDocuments.$inferSelect>().nullable() }
    },
    submit: {
      method: 'POST' as const,
      path: '/api/kyc' as const,
      input: insertKycDocumentSchema,
      responses: { 201: z.custom<typeof kycDocuments.$inferSelect>() }
    },
    list: {
      method: 'GET' as const,
      path: '/api/admin/kyc' as const,
      responses: { 200: z.array(z.custom<typeof kycDocuments.$inferSelect>()) }
    },
    updateStatus: {
      method: 'PATCH' as const,
      path: '/api/admin/kyc/:id/status' as const,
      input: z.object({ status: z.string() }),
      responses: { 200: z.custom<typeof kycDocuments.$inferSelect>() }
    }
  },
  banners: {
    list: {
      method: 'GET' as const,
      path: '/api/banners' as const,
      responses: { 200: z.array(z.custom<typeof banners.$inferSelect>()) }
    },
    create: {
      method: 'POST' as const,
      path: '/api/banners' as const,
      input: insertBannerSchema,
      responses: { 201: z.custom<typeof banners.$inferSelect>() }
    }
  },
  admin: {
    dashboardStats: {
      method: 'GET' as const,
      path: '/api/admin/stats' as const,
      responses: { 200: z.object({ totalUsers: z.number(), totalTransactions: z.number(), pendingSellRequests: z.number(), payoutRequests: z.number() }) }
    },
    users: {
      method: 'GET' as const,
      path: '/api/admin/users' as const,
      responses: { 200: z.array(z.custom<typeof users.$inferSelect>()) }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
