import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";

const groupsRef = collection(db, "groups");

export async function createGroup(data, user) {
  const docRef = await addDoc(groupsRef, {
    title: data.title.trim(),
    subject: data.subject.trim(),
    description: data.description.trim(),
    location: data.location.trim(),
    schedule: data.schedule.trim(),
    ownerId: user.uid,
    ownerName: user.displayName || user.email,
    members: [user.uid],
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getAllGroups() {
  const q = query(groupsRef, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getGroupById(id) {
  const snapshot = await getDoc(doc(db, "groups", id));
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() };
}