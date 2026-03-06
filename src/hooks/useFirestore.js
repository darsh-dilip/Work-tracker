import { useState, useEffect } from 'react'
import {
  collection, onSnapshot, query, orderBy,
  doc, addDoc, updateDoc, deleteDoc, setDoc, writeBatch,
  serverTimestamp, where,
} from 'firebase/firestore'
import { db } from '../firebase.js'

/**
 * Real-time listener for a Firestore collection.
 * Returns { data, loading, error }
 */
export const useCollection = (collectionName, ...queryConstraints) => {
  const [data,    setData]    = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    if (!collectionName) return
    const ref = collection(db, collectionName)
    const q   = queryConstraints.length ? query(ref, ...queryConstraints) : query(ref)

    const unsub = onSnapshot(q,
      snap => {
        setData(snap.docs.map(d => ({ id: d.id, ...d.data() })))
        setLoading(false)
      },
      err => { setError(err.message); setLoading(false) }
    )
    return unsub
  }, [collectionName]) // eslint-disable-line

  return { data, loading, error }
}

/* ── USERS ───────────────────────────────────── */
export const saveUser = (uid, data) =>
  setDoc(doc(db, 'users', uid), data, { merge: true })

export const updateUser = (uid, data) =>
  updateDoc(doc(db, 'users', uid), { ...data, updatedAt: serverTimestamp() })

/* ── CLIENTS ─────────────────────────────────── */
export const addClient = data =>
  addDoc(collection(db, 'clients'), { ...data, createdAt: serverTimestamp() })

export const updateClient = (id, data) =>
  updateDoc(doc(db, 'clients', id), { ...data, updatedAt: serverTimestamp() })

/* ── TASKS ───────────────────────────────────── */
export const addTask = data =>
  addDoc(collection(db, 'tasks'), data)

/**
 * Bulk-add tasks using a Firestore batch write (max 500 per batch).
 */
export const bulkAddTasks = async taskArray => {
  const chunks = []
  for (let i = 0; i < taskArray.length; i += 499) chunks.push(taskArray.slice(i, i + 499))
  for (const chunk of chunks) {
    const batch = writeBatch(db)
    chunk.forEach(t => batch.set(doc(collection(db, 'tasks')), t))
    await batch.commit()
  }
}

export const updateTask = (id, data) =>
  updateDoc(doc(db, 'tasks', id), { ...data, updatedAt: serverTimestamp() })

/**
 * Bulk-reassign: update all tasks matching clientId + pending statuses
 */
export const bulkReassignClientTasks = async (clientId, newAssigneeId, currentTasks) => {
  const batch = writeBatch(db)
  currentTasks
    .filter(t => t.clientId === clientId && !['filed','nil_filed','completed','dropped'].includes(t.status))
    .forEach(t => batch.update(doc(db, 'tasks', t.id), { assignedTo: newAssigneeId, updatedAt: serverTimestamp() }))
  await batch.commit()
  // Also update client document
  await updateClient(clientId, { assignedTo: newAssigneeId })
}

/**
 * Delete all GST tasks for a client (used when switching monthly↔quarterly)
 */
export const deleteGstTasks = async (clientId, currentTasks) => {
  const gstServices = ['GSTR-1','GSTR-2B Reconciliation','GSTR-3B','GSTR-1 (Quarterly)','GSTR-3B (Quarterly)']
  const batch = writeBatch(db)
  currentTasks
    .filter(t => t.clientId === clientId && gstServices.includes(t.service) && t.status === 'pending')
    .forEach(t => batch.delete(doc(db, 'tasks', t.id)))
  await batch.commit()
}
