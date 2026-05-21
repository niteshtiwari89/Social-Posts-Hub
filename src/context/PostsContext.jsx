/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  createPost as createPostRequest,
  deletePost as deletePostRequest,
  getPosts,
  updatePost as updatePostRequest,
} from '../services/jsonplaceholder.js'
import { useNotifications } from './NotificationContext.jsx'

const PostsContext = createContext(null)

function normalizePost(post) {
  return {
    ...post,
    id: Number(post.id),
    userId: Number(post.userId),
  }
}

function makeErrorMessage(error, fallback) {
  return error instanceof Error ? error.message : fallback
}

export function PostsProvider({ children }) {
  const [posts, setPosts] = useState([])
  const [postsLoading, setPostsLoading] = useState(true)
  const [postsError, setPostsError] = useState('')
  const { notify } = useNotifications()

  useEffect(() => {
    let active = true

    async function loadPosts() {
      try {
        const data = await getPosts()
        if (active) {
          setPosts(data.map(normalizePost))
        }
      } catch (error) {
        if (active) {
          setPostsError(makeErrorMessage(error, 'Unable to load posts.'))
        }
      } finally {
        if (active) {
          setPostsLoading(false)
        }
      }
    }

    loadPosts()

    return () => {
      active = false
    }
  }, [])

  const createPost = useCallback(async ({ title, body, userId }) => {
    const payload = {
      title: title.trim(),
      body: body.trim(),
      userId,
    }

    const createdPost = await createPostRequest(payload)
    const normalizedPost = normalizePost({
      ...payload,
      ...createdPost,
      id: createdPost?.id ?? Date.now(),
    })

    setPosts((currentPosts) => [normalizedPost, ...currentPosts])
    notify(`Post created: ${normalizedPost.title}`, 'success')

    return normalizedPost
  }, [notify])

  const updatePost = useCallback(async (postId, updates) => {
    const payload = {
      ...updates,
      id: postId,
    }

    const updatedPost = await updatePostRequest(postId, payload)
    const normalizedPost = normalizePost({
      ...payload,
      ...updatedPost,
      id: updatedPost?.id ?? postId,
    })

    setPosts((currentPosts) =>
      currentPosts.map((post) => (post.id === postId ? normalizedPost : post)),
    )
    notify(`Post updated: ${normalizedPost.title}`, 'success')

    return normalizedPost
  }, [notify])

  const deletePost = useCallback(async (postId) => {
    const removedPost = posts.find((post) => post.id === Number(postId))
    await deletePostRequest(postId)
    setPosts((currentPosts) => currentPosts.filter((post) => post.id !== postId))
    notify(
      removedPost ? `Post deleted: ${removedPost.title}` : 'Post deleted successfully.',
      'info',
    )
  }, [notify, posts])

  const value = useMemo(
    () => ({
      posts,
      postsLoading,
      postsError,
      setPosts,
      createPost,
      updatePost,
      deletePost,
    }),
    [createPost, deletePost, posts, postsLoading, postsError, updatePost],
  )

  return <PostsContext.Provider value={value}>{children}</PostsContext.Provider>
}

export function usePosts() {
  const context = useContext(PostsContext)

  if (!context) {
    throw new Error('usePosts must be used within PostsProvider')
  }

  return context
}