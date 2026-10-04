import {
  collection,  addDoc,  getDocs, getDoc, doc,
  updateDoc, deleteDoc, arrayUnion, arrayRemove,
  query, orderBy, serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
const groupsRef = collection(db, "groups");

//Create
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

//Get all existing groups
export async function getAllGroups() {
  const q = query(groupsRef, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

//Get a specific group by its IDd
export async function getGroupById(id) {
  const snapshot = await getDoc(doc(db, "groups", id));
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() };
}


//Modify a groups name, date, place etc. Only the ownr can!
export async function updateGroup(id, data) {
  await updateDoc(doc(db, "groups", id), {
    title: data.title.trim(),
    subject: data.subject.trim(),
    description: data.description.trim(),
    location: data.location.trim(),
    schedule: data.schedule.trim(),
  });
}

//Remove a group
export async function deleteGroup(id) {
  await deleteDoc(doc(db, "groups", id));
}

//Only logged-in users can join or leave a group or join a group. The members field is an aray of user IDss.
export async function joinGroup(groupId, uid) {
  await updateDoc(doc(db, "groups", groupId), {
    members: arrayUnion(uid),
  });
}




export async function leaveGroup(groupId, uid) {
  await updateDoc(doc(db, "groups", groupId), {
    members: arrayRemove(uid),
  });
}