import {
  collection, doc, getDoc, addDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit, startAfter,
  serverTimestamp, increment, arrayUnion, arrayRemove,
  getDocs, DocumentSnapshot,
} from 'firebase/firestore';
import { db, DEMO_MODE } from '../config/firebase';

export interface CommunityPost {
  id: string;
  uid: string;
  authorName: string;
  authorFitzpatrick?: number;
  text: string;
  imageUrl?: string;
  tags: string[];
  likeCount: number;
  replyCount: number;
  likedBy: string[];
  flaggedBy: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PostReply {
  id: string;
  uid: string;
  authorName: string;
  text: string;
  likeCount: number;
  likedBy: string[];
  createdAt: Date;
}

const POSTS = 'community_posts';
const PAGE_SIZE = 15;

// ── Demo fallback ─────────────────────────────────────────────────────────────

const DEMO_POSTS: CommunityPost[] = [
  {
    id: 'demo1',
    uid: 'demo',
    authorName: 'Adwoa M.',
    authorFitzpatrick: 5,
    text: 'Week 8 with niacinamide and my dark spots are finally fading! Consistency really is everything. 💜',
    tags: ['hyperpigmentation', 'niacinamide'],
    likeCount: 24,
    replyCount: 3,
    likedBy: [],
    flaggedBy: [],
    createdAt: new Date(Date.now() - 2 * 3600000),
    updatedAt: new Date(Date.now() - 2 * 3600000),
  },
  {
    id: 'demo2',
    uid: 'demo',
    authorName: 'Kwame T.',
    authorFitzpatrick: 6,
    text: "SPF every day even when it's cloudy — game changer for keeping PIH from coming back. Ernest Chemists has the Neutrogena SPF 50 for GHS 65.",
    tags: ['spf', 'acne', 'pih'],
    likeCount: 41,
    replyCount: 7,
    likedBy: [],
    flaggedBy: [],
    createdAt: new Date(Date.now() - 5 * 3600000),
    updatedAt: new Date(Date.now() - 5 * 3600000),
  },
  {
    id: 'demo3',
    uid: 'demo',
    authorName: 'Esi A.',
    authorFitzpatrick: 4,
    text: "My SANO scan found razor bumps on my neck — didn't even know that was a thing! Switched to single-blade and it's already much calmer after 2 weeks.",
    tags: ['razor_bumps', 'neck'],
    likeCount: 18,
    replyCount: 2,
    likedBy: [],
    flaggedBy: [],
    createdAt: new Date(Date.now() - 24 * 3600000),
    updatedAt: new Date(Date.now() - 24 * 3600000),
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function docToPost(d: DocumentSnapshot): CommunityPost {
  const data = d.data()!;
  return {
    id: d.id,
    uid: data.uid,
    authorName: data.authorName,
    authorFitzpatrick: data.authorFitzpatrick,
    text: data.text,
    imageUrl: data.imageUrl,
    tags: data.tags ?? [],
    likeCount: data.likeCount ?? 0,
    replyCount: data.replyCount ?? 0,
    likedBy: data.likedBy ?? [],
    flaggedBy: data.flaggedBy ?? [],
    createdAt: data.createdAt?.toDate?.() ?? new Date(),
    updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
  };
}

// ── Service ───────────────────────────────────────────────────────────────────

export const communityService = {

  async fetchPosts(cursor?: DocumentSnapshot): Promise<{ posts: CommunityPost[]; nextCursor: DocumentSnapshot | null }> {
    if (DEMO_MODE || !db) return { posts: DEMO_POSTS, nextCursor: null };

    const constraints: any[] = [
      orderBy('createdAt', 'desc'),
      limit(PAGE_SIZE),
    ];
    if (cursor) constraints.push(startAfter(cursor));

    const q = query(collection(db, POSTS), ...constraints);
    const snap = await getDocs(q);
    const posts = snap.docs.map(docToPost);
    const nextCursor = snap.docs.length === PAGE_SIZE ? snap.docs[snap.docs.length - 1] : null;
    return { posts, nextCursor };
  },

  async getPost(postId: string): Promise<CommunityPost | null> {
    if (DEMO_MODE || !db) return DEMO_POSTS.find(p => p.id === postId) ?? null;
    const snap = await getDoc(doc(db, POSTS, postId));
    return snap.exists() ? docToPost(snap) : null;
  },

  async createPost(uid: string, authorName: string, text: string, tags: string[], authorFitzpatrick?: number): Promise<string> {
    if (DEMO_MODE || !db) return 'demo-new';
    const ref = await addDoc(collection(db, POSTS), {
      uid,
      authorName,
      authorFitzpatrick: authorFitzpatrick ?? null,
      text: text.trim(),
      tags,
      likeCount: 0,
      replyCount: 0,
      likedBy: [],
      flaggedBy: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return ref.id;
  },

  async toggleLike(postId: string, uid: string, liked: boolean): Promise<void> {
    if (DEMO_MODE || !db) return;
    await updateDoc(doc(db, POSTS, postId), {
      likedBy: liked ? arrayUnion(uid) : arrayRemove(uid),
      likeCount: increment(liked ? 1 : -1),
    });
  },

  async flagPost(postId: string, uid: string): Promise<void> {
    if (DEMO_MODE || !db) return;
    await updateDoc(doc(db, POSTS, postId), {
      flaggedBy: arrayUnion(uid),
    });
  },

  async deletePost(postId: string): Promise<void> {
    if (DEMO_MODE || !db) return;
    await deleteDoc(doc(db, POSTS, postId));
  },

  // ── Replies ─────────────────────────────────────────────────────────────────

  async fetchReplies(postId: string): Promise<PostReply[]> {
    if (DEMO_MODE || !db) return [];
    const q = query(
      collection(db, POSTS, postId, 'replies'),
      orderBy('createdAt', 'asc'),
      limit(50),
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        uid: data.uid,
        authorName: data.authorName,
        text: data.text,
        likeCount: data.likeCount ?? 0,
        likedBy: data.likedBy ?? [],
        createdAt: data.createdAt?.toDate?.() ?? new Date(),
      };
    });
  },

  async addReply(postId: string, uid: string, authorName: string, text: string): Promise<void> {
    if (DEMO_MODE || !db) return;
    await addDoc(collection(db, POSTS, postId, 'replies'), {
      uid,
      authorName,
      text: text.trim(),
      likeCount: 0,
      likedBy: [],
      createdAt: serverTimestamp(),
    });
    await updateDoc(doc(db, POSTS, postId), {
      replyCount: increment(1),
    });
  },
};
