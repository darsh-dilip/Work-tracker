import { useState, useEffect } from 'react'
import { collection, onSnapshot, query, doc, addDoc, updateDoc, setDoc, writeBatch, serverTimestamp, arrayUnion } from 'firebase/firestore'
import { db } from '../firebase.js'

export const useCollection = (name) => {
  const [data,    setData]    = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  useEffect(() => {
    if (!name) return
    const q = query(collection(db, name))
    const unsub = onSnapshot(q,
      snap => { setData(snap.docs.map(d=>({id:d.id,...d.data()}))); setLoading(false) },
      err  => { setError(err.message); setLoading(false) }
    )
    return unsub
  }, [name])
  return { data, loading, error }
}

export const saveUser    = (uid, data) => setDoc(doc(db,'users',uid), data, { merge:true })
export const updateUser  = (uid, data) => updateDoc(doc(db,'users',uid), { ...data, updatedAt:serverTimestamp() })
export const addClient   = data => addDoc(collection(db,'clients'), { ...data, clientStatus:'active', createdAt:serverTimestamp() })
export const updateClient= (id, data) => updateDoc(doc(db,'clients',id), { ...data, updatedAt:serverTimestamp() })
export const addTask     = data => addDoc(collection(db,'tasks'), data)
export const updateTask  = (id, data) => updateDoc(doc(db,'tasks',id), { ...data, updatedAt:serverTimestamp() })
export const addTaskComment = (taskId, comment) => updateDoc(doc(db,'tasks',taskId), { comments:arrayUnion(comment), updatedAt:serverTimestamp() })
export const setClientStatus = (clientId, status) => updateClient(clientId, { clientStatus:status })

export const bulkAddTasks = async taskArray => {
  const chunks = []
  for (let i=0;i<taskArray.length;i+=499) chunks.push(taskArray.slice(i,i+499))
  for (const chunk of chunks) {
    const batch = writeBatch(db)
    chunk.forEach(t => batch.set(doc(collection(db,'tasks')), t))
    await batch.commit()
  }
}

export const bulkReassignClientTasks = async (clientId, newAssigneeId, currentTasks) => {
  const DONE = ['filed','nil_filed','completed','payment_done','paid','itr_filed',
    'no_profits','na','no_employee','nil','cancelled','not_to_be_filed','late',
    'delayed_filing','differences_resolved','customer_refused','iff_filed','no_iff','unregistered']
  const batch = writeBatch(db)
  currentTasks
    .filter(t => t.clientId===clientId && !DONE.includes(t.status))
    .forEach(t => batch.update(doc(db,'tasks',t.id), { assignedTo:newAssigneeId, updatedAt:serverTimestamp() }))
  await batch.commit()
  await updateClient(clientId, { assignedTo:newAssigneeId })
}
