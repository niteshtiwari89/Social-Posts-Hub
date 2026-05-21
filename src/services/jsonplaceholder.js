const BASE_URL = 'https://jsonplaceholder.typicode.com'

async function request(path, options = {}) {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
    ...options,
  })

  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`)
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}

export function getUsers() {
  return request('/users')
}

export function getPosts() {
  return request('/posts')
}

export function createPost(payload) {
  return request('/posts', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updatePost(postId, payload) {
  return request(`/posts/${postId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function deletePost(postId) {
  return request(`/posts/${postId}`, {
    method: 'DELETE',
  })
}

export function getCommentsByPost(postId) {
  return request(`/comments?postId=${postId}`)
}

export function createComment(payload) {
  return request('/comments', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}