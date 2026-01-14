// Recommended Firestore Security Rules for Dripzy
// Copy these to Firebase Console > Firestore > Rules

/*
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is admin
    function isAdmin() {
      return request.auth != null && 
             request.auth.token.email in [
               'admin@dripzy.in',
               'dasmesh@dripzy.in'
             ];
    }
    
    // Products - public read, admin write
    match /products/{productId} {
      allow read: if true;  // Anyone can view products
      allow write: if isAdmin();  // Only admins can modify
    }
    
    // Orders - user can read own orders, admin can read all
    match /orders/{orderId} {
      allow read: if request.auth != null && 
                    (request.auth.uid == resource.data.userId || isAdmin());
      allow create: if request.auth != null;
      allow update, delete: if isAdmin();
    }
    
    // Users - only the user can access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && 
                           request.auth.uid == userId;
    }
    
    // Settings - admin only
    match /settings/{settingId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Categories - public read, admin write
    match /categories/{categoryId} {
      allow read: if true;
      allow write: if isAdmin();
    }
  }
}
*/

// For development, use these permissive rules:
/*
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
*/

export const FIRESTORE_RULES_INFO = {
    development: `
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
`,
    production: `
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    function isAdmin() {
      return request.auth != null && 
             request.auth.token.email in [
               'admin@dripzy.in',
               'dasmesh@dripzy.in'
             ];
    }
    
    match /products/{productId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    match /orders/{orderId} {
      allow read: if request.auth != null && 
                    (request.auth.uid == resource.data.userId || isAdmin());
      allow create: if request.auth != null;
      allow update, delete: if isAdmin();
    }
    
    match /users/{userId} {
      allow read, write: if request.auth != null && 
                           request.auth.uid == userId;
    }
    
    match /settings/{settingId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    match /categories/{categoryId} {
      allow read: if true;
      allow write: if isAdmin();
    }
  }
}
`
};
