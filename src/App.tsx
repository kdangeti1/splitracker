import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import CreateGroup from './pages/CreateGroup'
import GroupView from './pages/GroupView'
import { useAuth } from './firebase/config'

export default function App() {
  const user = useAuth()

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" replace />} />
      <Route
        path="/create-group"
        element={user ? <CreateGroup /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/group/:groupId"
        element={user ? <GroupView /> : <Navigate to="/login" replace />}
      />
    </Routes>
  )
}
