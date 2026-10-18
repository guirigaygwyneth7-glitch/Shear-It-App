# Security Specification: PayMongo Real-Time Notes Marketplace

## 1. System Invariants
- **Identity Invariant**: A user's profile (`/users/{userId}`) can only be created by the authenticated owner (`request.auth.uid == userId`). The `role` cannot be escalated to `admin` by standard users; only the project bootstrap administrator (`guirigay.gwyneth7@gmail.com`) can hold `admin`.
- **Note Publication Invariant**: Notes uploaded by students default to `approvedStatus: false` and `authorizedBuyers: []`. Only verified administrators can toggle `approvedStatus` to `true`.
- **Access Control & Purchase Invariant**: A buyer acquires download rights to a note when their `uid` is appended to `authorizedBuyers` (via successful PayMongo checkout webhook or authorized server mutation). Standard users cannot overwrite existing authorized buyers or arbitrarily add themselves without payment validation.
- **PayMongo Credential Protection**: Users can register and update their `paymongoAccountId` on their own profile document. Other non-admin users cannot mutate another seller's payout account credentials.

## 2. The Dirty Dozen Attack Payloads
1. **Self-Escalation Attack**: Non-admin user creates profile with `role: "admin"`. -> *Expected: DENIED*
2. **Ghost Seller Injection**: User creates a note with `sellerId: "another_user_uid"`. -> *Expected: DENIED*
3. **Pre-Approved Publishing Bypass**: User uploads note with `approvedStatus: true` directly. -> *Expected: DENIED*
4. **Free Access Injection**: User creates note with their own uid in `authorizedBuyers`. -> *Expected: DENIED*
5. **Unauthorized Approval Toggle**: Non-admin attempts to update `approvedStatus` to `true`. -> *Expected: DENIED*
6. **Price Tampering During Update**: Non-admin buyer attempts to alter note's `price`. -> *Expected: DENIED*
7. **Junk ID Denial of Wallet**: Malicious actor injects 2KB string as `noteId`. -> *Expected: DENIED*
8. **Buyer Eviction Attack**: Malicious user overwrites `authorizedBuyers` array removing previous buyers. -> *Expected: DENIED*
9. **Account Hijacking**: User tries to update another user's `paymongoAccountId`. -> *Expected: DENIED*
10. **Unauthenticated Read of Private User Data**: Unauthenticated client attempts to query all user profiles. -> *Expected: DENIED*
11. **Negative Price Exploit**: Seller sets note price to negative number. -> *Expected: DENIED*
12. **Malformed Schema Injection**: Payload contains invalid types or missing required fields. -> *Expected: DENIED*
