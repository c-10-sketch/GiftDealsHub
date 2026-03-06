## Packages
jwt-decode | For decoding auth tokens if needed locally
framer-motion | For beautiful page transitions and micro-interactions
recharts | For admin dashboard charts
clsx | Class name merging (usually in stack, ensuring it's there)
tailwind-merge | Utility for tailwind classes (usually in stack)

## Notes
- Authentication uses a JWT token stored in `localStorage` under the key `auth_token`.
- We implement an `authenticatedFetch` wrapper to automatically inject the `Authorization: Bearer <token>` header into all API requests to the endpoints defined in `shared/routes.ts`.
- `user.role === 'SUPER_ADMIN'` is used to protect admin routes on the frontend.
- Forms that upload URLs (like KYC) currently use simple text inputs to accept the URLs, assuming image uploading happens via an external service or a presigned URL approach not defined in the core schema.
