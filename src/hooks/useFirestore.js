import { useState, useEffect } from 'react'
import {
  collection, onSnapshot, query, orderBy,
  doc, addDoc, updateDoc, deleteDoc, setDoc, writeBatch,
  serverTimestamp, where, arrayUnion,
} from 'firebase/firestore'
import { db } from '../firebase.js'

/** Real-time collection listener */
export const useCollection = (collectionName, ...constraints) => {
  const [data,    setData]    = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    if (!collectionName) return
    const ref = collection(db, collectionName)
    const q   = constraints.length ? query(ref, ...constraints) : query(ref)
    const unsub = onSnapshot(q,
      snap => { setData(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setLoading(false) },
      err  => { setError(err.message); setLoading(false) }
    )
    return unsub
  }, [collectionName]) // eslint-disable-line

  return { data, loading, error }
}

/* ── USERS ── */
export const saveUser   = (uid, data) => setDoc(doc(db, 'users', uid), data, { merge: true })
export const updateUser = (uid, data) => updateDoc(doc(db, 'users', uid), { ...data, updatedAt: serverTimestamp() })

/* ── CLIENTS ── */
export const addClient    = data => addDoc(collection(db, 'clients'), { ...data, clientStatus: 'active', createdAt: serverTimestamp() })
export const updateClient = (id, data) => updateDoc(doc(db, 'clients', id), { ...data, updatedAt: serverTimestamp() })

/* ── TASKS ── */
export const addTask  = data => addDoc(collection(db, 'tasks'), data)
export const updateTask = (id, data) => updateDoc(doc(db, 'tasks', id), { ...data, updatedAt: serverTimestamp() })

/** Bulk-add tasks via batch writes (max 499 per batch) */
export const bulkAddTasks = async taskArray => {
  const chunks = []
  for (let i = 0; i < taskArray.length; i += 499) chunks.push(taskArray.slice(i, i + 499))
  for (const chunk of chunks) {
    const batch = writeBatch(db)
    chunk.forEach(t => batch.set(doc(collection(db, 'tasks')), t))
    await batch.commit()
  }
}

/** Reassign all pending tasks of a client + update client doc */
export const bulkReassignClientTasks = async (clientId, newAssigneeId, currentTasks) => {
  const DONE = ['filed','nil_filed','completed','payment_done','paid','itr_filed',
    'no_profits','na','no_employee','nil','cancelled','not_to_be_filed','late',
    'delayed_filing','differences_resolved','customer_refused','iff_filed','no_iff',
    'unregistered','paid_apr','paid_may','paid_jun','paid_jul','paid_aug','paid_sep',
    'paid_oct','paid_nov','paid_dec','paid_jan','paid_feb','paid_mar']
  const batch = writeBatch(db)
  currentTasks
    .filter(t => t.clientId === clientId && !DONE.includes(t.status))
    .forEach(t => batch.update(doc(db, 'tasks', t.id), { assignedTo: newAssigneeId, updatedAt: serverTimestamp() }))
  await batch.commit()
  await updateClient(clientId, { assignedTo: newAssigneeId })
}

/** Set client-level status (active | on_hold | discontinued) */
export const setClientStatus = (clientId, status) =>
  updateClient(clientId, { clientStatus: status })

/** Add a comment to a task with arrayUnion (Firestore merge) */
export const addTaskComment = (taskId, comment) =>
  updateDoc(doc(db, 'tasks', taskId), {
    comments:  arrayUnion(comment),
    updatedAt: serverTimestamp(),
  })
