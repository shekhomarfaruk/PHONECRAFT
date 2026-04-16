import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { getAuthToken } from './session.js'

const API_URL = import.meta.env.VITE_API_URL || ''

function shouldAttachAuth(url) {
	try {
		const target = new URL(url, window.location.origin)
		if (API_URL) {
			const apiOrigin = new URL(API_URL, window.location.origin).origin
			if (target.origin !== window.location.origin && target.origin !== apiOrigin) return false
		}
		return target.pathname.startsWith('/api/')
	} catch {
		return String(url || '').includes('/api/')
	}
}

if (!window.__phonecraftFetchWrapped) {
	const nativeFetch = window.fetch.bind(window)
	window.fetch = (input, init = {}) => {
		const url = typeof input === 'string' ? input : input?.url
		const token = getAuthToken()

		if (!token || !shouldAttachAuth(url)) {
			return nativeFetch(input, init)
		}

		const headers = new Headers(init.headers || (input instanceof Request ? input.headers : undefined))
		if (!headers.has('Authorization')) {
			headers.set('Authorization', `Bearer ${token}`)
		}

		return nativeFetch(input, { ...init, headers })
	}
	window.__phonecraftFetchWrapped = true
}

createRoot(document.getElementById('root')).render(<App />)
