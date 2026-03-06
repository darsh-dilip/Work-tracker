import { useState, useEffect } from 'react'
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../firebase.js'

export const useAuth = () => {
  const [firebaseUser, setFirebaseUser] = useState(undefined) // undefined = loading
  const [userProfile, setUserProfile]   = useState(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async fbUser => {
      if (fbUser) {
        setFirebaseUser(fbUser)
        // Load their profile from Firestore
        const snap = await getDoc(doc(db, 'users', fbUser.uid))
        if (snap.exists()) setUserProfile({ id: fbUser.uid, ...snap.data() })
      } else {
        setFirebaseUser(null)
        setUserProfile(null)
      }
    })
    return unsub
  }, [])

  const login = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    return cred.user
  }

  const logout = () => signOut(auth)

  const resetPassword = email => sendPasswordResetEmail(auth, email)

  // Used by admin to create new team members
  const createUser = (email, password) =>
    createUserWithEmailAndPassword(auth, email, password)

  return { firebaseUser, userProfile, login, logout, resetPassword, createUser, loading: firebaseUser === undefined }
}
