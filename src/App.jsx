import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { NotificationProvider } from './context/NotificationContext.jsx'
import { PostsProvider } from './context/PostsContext.jsx'
import { LoginPage } from './pages/LoginPage.jsx'
import { PostDetailPage } from './pages/PostDetailPage.jsx'
import { PostsPage } from './pages/PostsPage.jsx'

function App() {
  return (
    <BrowserRouter>
      <NotificationProvider>
        <AuthProvider>
          <PostsProvider>
            <Routes>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Navigate to="/posts" replace />} />
                <Route path="/posts" element={<PostsPage />} />
                <Route path="/posts/:postId" element={<PostDetailPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="*" element={<Navigate to="/posts" replace />} />
              </Route>
            </Routes>
          </PostsProvider>
        </AuthProvider>
      </NotificationProvider>
    </BrowserRouter>
  )
}

export default App
