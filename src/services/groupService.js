import {
  collection,
  addDoc,
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