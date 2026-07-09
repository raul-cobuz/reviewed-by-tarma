import { useEffect, useState } from 'react'

const REVIEWS_ENDPOINT = 'http://localhost:8080/api/reviews'
const FILE_UPLOAD_ENDPOINT = 'http://localhost:8080/api/files/upload'

function App() {
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [reviews, setReviews] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedReview, setSelectedReview] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newArtist, setNewArtist] = useState('')
  const [newSummary, setNewSummary] = useState('')
  const [newContent, setNewContent] = useState('')
  const [newRating, setNewRating] = useState(10)
  const [selectedFile, setSelectedFile] = useState(null)
  const [isPublishing, setIsPublishing] = useState(false)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', isDarkMode)
  }, [isDarkMode])

  const fetchReviews = async () => {
    try {
      const response = await fetch(REVIEWS_ENDPOINT)

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
      }

      const data = await response.json()
      setReviews(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching reviews:', error)
      setReviews([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [])

  const resetForm = () => {
    setNewTitle('')
    setNewArtist('')
    setNewSummary('')
    setNewContent('')
    setNewRating(10)
    setSelectedFile(null)
  }

  const getCoverSrc = (coverUrl) => {
    if (!coverUrl) return null
    if (coverUrl.startsWith('http://') || coverUrl.startsWith('https://')) {
      return coverUrl
    }
    return `http://localhost:8080${coverUrl}`
  }

  const handlePublish = async (event) => {
    event.preventDefault()

    if (
      !newTitle.trim() ||
      !newArtist.trim() ||
      !newSummary.trim() ||
      !newContent.trim()
    )
      return

    setIsPublishing(true)

    try {
      let uploadedCoverUrl = null

      if (selectedFile) {
        const formData = new FormData()
        formData.append('file', selectedFile)

        const uploadResponse = await fetch(FILE_UPLOAD_ENDPOINT, {
          method: 'POST',
          headers: {
            Authorization: `Basic ${btoa('raul:parolagrea')}`,
          },
          body: formData,
        })

        if (!uploadResponse.ok) {
          throw new Error(`Upload failed with status ${uploadResponse.status}`)
        }

        uploadedCoverUrl = await uploadResponse.text()
      }

      const response = await fetch(REVIEWS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${btoa('raul:parolagrea')}`,
        },
        body: JSON.stringify({
          title: newTitle.trim(),
          artistName: newArtist.trim(),
          summary: newSummary.trim(),
          content: newContent.trim(),
          rating: parseInt(newRating, 10),
          coverUrl: uploadedCoverUrl || null,
        }),
      }).catch((error) => {
        console.log('Error publishing review:', error)
        throw error
      })

      if (!response.ok) {
        throw new Error(`POST failed with status ${response.status}`)
      }

      setIsModalOpen(false)
      resetForm()
      setIsLoading(true)
      await fetchReviews()
    } catch (error) {
      console.log('Error publishing review:', error)
    } finally {
      setIsPublishing(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://localhost:8080/api/reviews/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Basic ${btoa('raul:parolagrea')}`,
        },
      })

      if (!response.ok) {
        throw new Error(`DELETE failed with status ${response.status}`)
      }

      setReviews((prev) => prev.filter((review) => review.id !== id))
    } catch (error) {
      console.log('Error deleting review:', error)
    }
  }

  const handleAdminAccess = () => {
    const password = window.prompt('Parola de acces:')
    if (password === 'tarma2026') {
      setIsAdmin(true)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-950 transition-colors duration-300 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(236,72,153,0.16),transparent_40%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.18),transparent_42%),radial-gradient(circle_at_bottom,rgba(244,63,94,0.14),transparent_45%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(236,72,153,0.22),transparent_42%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.24),transparent_44%),radial-gradient(circle_at_bottom,rgba(244,63,94,0.18),transparent_46%)]" />

      <nav className="border-b border-zinc-900/10 bg-white/80 backdrop-blur-md dark:border-white/10 dark:bg-zinc-950/80">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-lg font-black uppercase tracking-[0.2em] text-zinc-950 dark:text-white">
              Reviewed By Tarma
            </p>
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-600 dark:text-zinc-400">
              album reviews / beats / tracklists
            </p>
          </div>

          <div className="flex items-center">
            <button
              type="button"
              onClick={() => setIsDarkMode((prev) => !prev)}
              className="inline-flex items-center gap-2 border border-zinc-900/20 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-900 transition hover:border-fuchsia-500 hover:text-fuchsia-600 dark:border-white/20 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-pink-400 dark:hover:text-pink-300"
            >
              <span className="h-2.5 w-2.5 bg-gradient-to-r from-fuchsia-500 to-rose-500" />
              {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </button>

            {isAdmin ? (
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="ml-3 inline-flex items-center border border-zinc-900/20 bg-transparent px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-800 transition hover:border-fuchsia-500 hover:text-fuchsia-600 dark:border-white/20 dark:text-zinc-200 dark:hover:border-pink-400 dark:hover:text-pink-300"
              >
                New Post
              </button>
            ) : null}
          </div>
        </div>
      </nav>

      <main className="mx-auto w-full max-w-6xl px-6 py-10 md:py-14">
        <header className="mb-10 max-w-3xl md:mb-12">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-fuchsia-600 dark:text-fuchsia-400">
            Music Blog
          </p>
          <h1 className="mb-3 text-4xl font-black leading-tight md:text-5xl">
            Album Reviews cu Energie, Beat-Making cu Atitudine
          </h1>
          <p className="text-sm text-zinc-700 dark:text-zinc-300">
            Descoperim albume noi, disecam tracklists si intram in procesul de
            productie, de la groove la mix.
          </p>
        </header>

        {isLoading ? (
          <p>Loading...</p>
        ) : reviews.length === 0 ? (
          <p>Nu există recenzii momentan</p>
        ) : (
          <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((review) => (
              <article
                key={review.id ?? `${review.title}-${review.artist}`}
                onClick={() => setSelectedReview(review)}
                className="group relative cursor-pointer overflow-hidden border border-zinc-900/10 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.02)] transition duration-300 transition-transform hover:-translate-y-1 hover:scale-[1.02] hover:border-fuchsia-400/70 hover:shadow-[0_12px_34px_-20px_rgba(217,70,239,0.8)] dark:border-white/10 dark:bg-zinc-900/70 dark:hover:border-pink-400/70 dark:hover:shadow-[0_14px_36px_-20px_rgba(244,63,94,0.7)]"
              >
                {isAdmin ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(review.id)
                    }}
                    className="absolute bottom-3 right-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full border border-rose-500/60 bg-rose-500/15 text-rose-600 transition hover:bg-rose-500/25 dark:text-rose-300"
                    aria-label="Delete review"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 6h18" />
                      <path d="M8 6V4h8v2" />
                      <path d="M19 6l-1 14H6L5 6" />
                      <path d="M10 11v6" />
                      <path d="M14 11v6" />
                    </svg>
                  </button>
                ) : null}

                <div className="aspect-square w-full border-b border-zinc-900/10 bg-zinc-900/10 dark:border-white/10 dark:bg-zinc-800/40">
                  {review.coverUrl ? (
                    <img
                      src={getCoverSrc(review.coverUrl)}
                      alt={review.title || 'Review image'}
                      className="w-full aspect-square object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-fuchsia-500 via-violet-500 to-rose-500 p-4">
                      <div className="flex h-full flex-col justify-between border border-white/30 bg-black/15 p-3 backdrop-blur-sm">
                        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white/80">
                          {review.type || 'Review'}
                        </p>
                        <p className="text-xs uppercase tracking-[0.2em] text-white/90">
                          {review.year || ''}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3 p-5">
                  <h2 className="text-xl font-extrabold leading-tight text-zinc-950 dark:text-white">
                    {(review.artistName || review.artist) + ' - ' + (review.title || '')}
                  </h2>
                  <p className="text-sm uppercase tracking-[0.12em] text-zinc-600 dark:text-zinc-400">
                    {review.artistName || review.artist}
                  </p>
                  <p className="line-clamp-3 text-sm text-zinc-500 dark:text-zinc-400">
                    {review.summary}
                  </p>
                  {review.rating !== undefined && review.rating !== null ? (
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-fuchsia-700 dark:text-pink-300">
                      Rating: {review.rating}/10
                    </p>
                  ) : null}
                  {review.tracks || review.date || review.createdAt || review.artist ? (
                    <div className="inline-flex border border-zinc-900/20 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-zinc-700 dark:border-white/20 dark:text-zinc-300">
                      {review.tracks || review.date || review.createdAt || review.artist}
                    </div>
                  ) : null}
                </div>
              </article>
            ))}
          </section>
        )}
      </main>

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/55 px-4">
          <div className="w-full max-w-xl border border-zinc-900/10 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-zinc-900">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-zinc-950 dark:text-white">
                New Post
              </h2>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false)
                  resetForm()
                }}
                className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 transition hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                Close
              </button>
            </div>

            <form onSubmit={handlePublish} className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="title"
                  className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-600 dark:text-zinc-400"
                >
                  Titlu
                </label>
                <input
                  id="title"
                  type="text"
                  value={newTitle}
                  onChange={(event) => setNewTitle(event.target.value)}
                  className="w-full border border-zinc-900/15 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-fuchsia-500 dark:border-white/15 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-pink-400"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="artist"
                  className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-600 dark:text-zinc-400"
                >
                  Artist
                </label>
                <input
                  id="artist"
                  type="text"
                  value={newArtist}
                  onChange={(event) => setNewArtist(event.target.value)}
                  className="w-full border border-zinc-900/15 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-fuchsia-500 dark:border-white/15 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-pink-400"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="rating"
                  className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-600 dark:text-zinc-400"
                >
                  Rating
                </label>
                <input
                  id="rating"
                  type="number"
                  min="1"
                  max="10"
                  value={newRating}
                  onChange={(event) => setNewRating(event.target.value)}
                  className="w-full border border-zinc-900/15 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-fuchsia-500 dark:border-white/15 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-pink-400"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="summary"
                  className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-600 dark:text-zinc-400"
                >
                  Părere pe scurt
                </label>
                <input
                  id="summary"
                  type="text"
                  value={newSummary}
                  onChange={(event) => setNewSummary(event.target.value)}
                  className="w-full border border-zinc-900/15 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-fuchsia-500 dark:border-white/15 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-pink-400"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="cover"
                  className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-600 dark:text-zinc-400"
                >
                  Cover
                </label>
                <input
                  id="cover"
                  type="file"
                  accept="image/*"
                  onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
                  className="w-full border border-zinc-900/15 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition file:mr-3 file:border-0 file:bg-zinc-100 file:px-2.5 file:py-1.5 file:text-xs file:font-semibold file:uppercase file:tracking-[0.1em] dark:border-white/15 dark:bg-zinc-950 dark:text-zinc-100 dark:file:bg-zinc-800"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="content"
                  className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-600 dark:text-zinc-400"
                >
                  Conținut
                </label>
                <textarea
                  id="content"
                  value={newContent}
                  onChange={(event) => setNewContent(event.target.value)}
                  className="min-h-40 w-full resize-y border border-zinc-900/15 bg-white px-3 py-2 text-sm text-zinc-900 outline-none transition focus:border-fuchsia-500 dark:border-white/15 dark:bg-zinc-950 dark:text-zinc-100 dark:focus:border-pink-400"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false)
                    resetForm()
                  }}
                  className="border border-zinc-900/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-700 transition hover:border-zinc-900/40 dark:border-white/20 dark:text-zinc-300 dark:hover:border-white/40"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPublishing}
                  className="border border-fuchsia-500/40 bg-fuchsia-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-fuchsia-700 transition hover:bg-fuchsia-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-pink-400/40 dark:bg-pink-500/10 dark:text-pink-300 dark:hover:bg-pink-500/20"
                >
                  {isPublishing ? 'Publishing...' : 'Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {selectedReview ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 px-4 py-6"
          onClick={() => setSelectedReview(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto border border-zinc-900/10 bg-white shadow-2xl dark:border-white/10 dark:bg-zinc-900"
            onClick={(event) => event.stopPropagation()}
          >
            {selectedReview.coverUrl ? (
              <img
                src={getCoverSrc(selectedReview.coverUrl)}
                alt={selectedReview.title || 'Review cover'}
                className="w-64 h-64 md:w-80 md:h-80 object-cover rounded-xl shadow-2xl mx-auto mb-6"
              />
            ) : (
              <div className="w-64 h-64 md:w-80 md:h-80 rounded-xl shadow-2xl mx-auto mb-6 bg-gradient-to-br from-fuchsia-500 via-violet-500 to-rose-500" />
            )}

            <div className="space-y-4 p-6 md:p-8">
              <div className="flex items-start justify-between gap-4">
                <h2 className="text-3xl font-black leading-tight text-zinc-950 dark:text-white">
                  {(selectedReview.artistName || selectedReview.artist || '') +
                    ' - ' +
                    (selectedReview.title || '')}
                </h2>
                <button
                  type="button"
                  onClick={() => setSelectedReview(null)}
                  className="shrink-0 border border-zinc-900/20 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-700 transition hover:border-zinc-900/40 dark:border-white/20 dark:text-zinc-300 dark:hover:border-white/40"
                >
                  Close
                </button>
              </div>

              {selectedReview.rating !== undefined &&
              selectedReview.rating !== null ? (
                <p className="inline-flex border border-fuchsia-500/40 bg-fuchsia-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-fuchsia-700 dark:border-pink-400/40 dark:bg-pink-500/10 dark:text-pink-300">
                  Rating: {selectedReview.rating}/10
                </p>
              ) : null}

              {selectedReview.summary ? (
                <p className="text-lg italic text-fuchsia-700 dark:text-pink-300">
                  {selectedReview.summary}
                </p>
              ) : null}

              <hr className="border-neutral-800 my-4" />

              <div className="whitespace-pre-wrap text-base leading-relaxed text-zinc-800 dark:text-zinc-200">
                {selectedReview.content || selectedReview.continut}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={handleAdminAccess}
        className="fixed bottom-3 right-4 text-[0.65rem] font-medium uppercase tracking-[0.18em] text-neutral-800/45 transition hover:text-neutral-800/70 dark:text-zinc-300/30 dark:hover:text-zinc-300/55"
      >
        Admin
      </button>
    </div>
  )
}

export default App
