import {
  addDoc,
  collection,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

import type { ChatMessage, ChatThread, Review } from '../types';
import { normalizeReview } from '../utils';

/** SHA-256 hash of the email (lowercased + trimmed) — used as the Firestore document ID so each email can only post one review. */
export async function hashEmail(email: string): Promise<string> {
  const normalized = email.toLowerCase().trim();
  const msgBuffer = new TextEncoder().encode(normalized);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Returns true if this email has already submitted a website review. */
export async function checkEmailAlreadyReviewed(emailHash: string): Promise<boolean> {
  const snap = await getDoc(doc(db, 'reviews', emailHash));
  return snap.exists();
}

/**
 * Saves a website review using the email hash as the document ID.
 * A second call with the same email will throw because the document already exists
 * (Firestore `allow create` rule only applies to NEW documents).
 */
export async function addWebsiteReviewWithEmail(
  emailHash: string,
  userName: string,
  rating: number,
  comment: string,
): Promise<void> {
  await setDoc(doc(db, 'reviews', emailHash), {
    user_name: userName,
    rating,
    comment,
    car_id: 'website',
    email_hash: emailHash,
    createdAt: serverTimestamp(),
  });
}

export function subscribeReviewsForCar(carId: string, callback: (reviews: Review[]) => void): Unsubscribe {
  const q = query(

    collection(db, 'reviews'),
    where('car_id', '==', carId),
    orderBy('createdAt', 'desc'),
  );

  return onSnapshot(
    q,
    (snapshot) => {
      callback(snapshot.docs.map((d) => normalizeReview(d.id, d.data())));
    },
    () => {
      const legacyQ = query(
        collection(db, 'reviews'),
        where('carId', '==', carId),
        orderBy('createdAt', 'desc'),
      );
      onSnapshot(legacyQ, (snapshot) => {
        callback(snapshot.docs.map((d) => normalizeReview(d.id, d.data())));
      });
    },
  );
}

export function subscribeLatestReviews(callback: (reviews: Review[]) => void, count = 3): Unsubscribe {
  return onSnapshot(query(collection(db, 'reviews'), orderBy('createdAt', 'desc'), limit(count)), (snapshot) => {
    callback(snapshot.docs.map((d) => normalizeReview(d.id, d.data())));
  });
}

export function subscribeWebsiteReviews(callback: (reviews: Review[]) => void): Unsubscribe {
  return onSnapshot(
    query(collection(db, 'reviews'), where('car_id', '==', 'website'), orderBy('createdAt', 'desc')),
    (snapshot) => {
      callback(snapshot.docs.map((d) => normalizeReview(d.id, d.data())));
    },
    (err) => {
      // Composite index may be missing — fall back to a full collection scan + client-side filter.
      // Check the Firebase console to create the index: car_id ASC, createdAt DESC
      console.warn('[RJ] subscribeWebsiteReviews: index missing, falling back to client filter.', err.message);
      onSnapshot(
        query(collection(db, 'reviews'), orderBy('createdAt', 'desc')),
        (snapshot) => {
          const websiteReviews = snapshot.docs
            .filter((d) => {
              const data = d.data();
              return data.car_id === 'website' || data.carId === 'website';
            })
            .map((d) => normalizeReview(d.id, d.data()));
          callback(websiteReviews);
        },
      );
    },
  );
}

export function subscribeChatThreads(callback: (threads: ChatThread[]) => void): Unsubscribe {
  return onSnapshot(query(collection(db, 'chats'), orderBy('updatedAt', 'desc')), (snapshot) => {
    callback(
      snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<ChatThread, 'id'>),
      })),
    );
  });
}

export function subscribeChatMessages(userId: string, callback: (messages: ChatMessage[]) => void): Unsubscribe {
  return onSnapshot(
    query(collection(db, 'chats', userId, 'messages'), orderBy('createdAt', 'asc')),
    (snapshot) => {
      callback(
        snapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<ChatMessage, 'id'>),
        })),
      );
    },
  );
}

export async function sendCustomerMessage(userId: string, userName: string, text: string): Promise<void> {
  await addDoc(collection(db, 'chats', userId, 'messages'), {
    senderId: userId,
    senderName: userName,
    text,
    createdAt: serverTimestamp(),
  });

  await setDoc(
    doc(db, 'chats', userId),
    {
      userId,
      userName,
      lastMessage: text,
      updatedAt: serverTimestamp(),
      unreadCount: 1,
    },
    { merge: true },
  );
}

export async function sendAdminMessage(userId: string, text: string): Promise<void> {
  await addDoc(collection(db, 'chats', userId, 'messages'), {
    senderId: 'admin',
    senderName: 'RJ Support',
    text,
    createdAt: serverTimestamp(),
  });

  await setDoc(
    doc(db, 'chats', userId),
    {
      lastMessage: text,
      updatedAt: serverTimestamp(),
      unreadCount: 0,
    },
    { merge: true },
  );
}

export async function markChatRead(userId: string): Promise<void> {
  await setDoc(doc(db, 'chats', userId), { unreadCount: 0 }, { merge: true });
}

export function averageRating(reviews: Review[]): number {
  if (!reviews.length) return 0;
  return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
}

/** @deprecated Use addWebsiteReviewWithEmail for spam-proof reviews. */
export async function addWebsiteReview(userName: string, rating: number, comment: string): Promise<void> {
  await addDoc(collection(db, 'reviews'), {
    user_name: userName,
    rating,
    comment,
    car_id: 'website',
    createdAt: serverTimestamp(),
  });
}
