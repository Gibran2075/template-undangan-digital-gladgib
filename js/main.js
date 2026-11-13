/* =========================================================
   Gibran & Gladis — Digital Wedding Invitation
   ========================================================= */
(function () {
  'use strict'

  const WEDDING = {
    start: '2026-12-28T08:00:00+07:00',
    end: '2026-12-28T13:00:00+07:00',
    title: 'Pernikahan Gibran & Gladis',
    location: 'Kediaman Mempelai Wanita, Ds Pagu, Wates, Kediri, Jawa Timur',
    description:
      'Akad Nikah pukul 08.00 WIB dan Resepsi pukul 10.00 WIB. Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir.',
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const $ = (selector, scope) => (scope || document).querySelector(selector)
  const $$ = (selector, scope) => Array.from((scope || document).querySelectorAll(selector))

  /* ---------------------------------------------------------
     Toast
     --------------------------------------------------------- */
  const toast = $('#toast')
  const toastText = $('#toast-text')
  let toastTimer

  function showToast(message) {
    if (!toast) return
    toastText.textContent = message
    toast.classList.add('is-visible')
    window.clearTimeout(toastTimer)
    toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 3200)
  }

  /* ---------------------------------------------------------
     Scroll lock helpers
     --------------------------------------------------------- */
  let lockCount = 0

  function lockScroll() {
    lockCount += 1
    document.body.style.overflow = 'hidden'
  }

  function unlockScroll() {
    lockCount = Math.max(0, lockCount - 1)
    if (lockCount === 0) document.body.style.overflow = ''
  }

  /* ---------------------------------------------------------
     Scroll reveal
     --------------------------------------------------------- */
  const revealItems = $$('[data-reveal]')

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-visible'))
  } else {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('is-visible')
          revealObserver.unobserve(entry.target)
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
    )
    revealItems.forEach((item) => revealObserver.observe(item))
  }

  /* ---------------------------------------------------------
     Subtle hero parallax
     --------------------------------------------------------- */
  const heroWrapper = $('.hero-img')?.parentElement
  if (heroWrapper && !prefersReducedMotion) {
    let ticking = false

    const updateParallax = () => {
      const offset = Math.min(window.scrollY * 0.14, 26)
      heroWrapper.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`
      ticking = false
    }

    window.addEventListener(
      'scroll',
      () => {
        if (ticking) return
        ticking = true
        window.requestAnimationFrame(updateParallax)
      },
      { passive: true }
    )
  }

  /* ---------------------------------------------------------
     Save the date -> .ics
     --------------------------------------------------------- */
  function toICSDate(value) {
    return new Date(value).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  }

  function buildICS() {
    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Gibran & Gladis//Wedding Invitation//ID',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      'UID:' + Date.now() + '@gibran-gladis',
      'DTSTAMP:' + toICSDate(new Date().toISOString()),
      'DTSTART:' + toICSDate(WEDDING.start),
      'DTEND:' + toICSDate(WEDDING.end),
      'SUMMARY:' + WEDDING.title,
      'LOCATION:' + WEDDING.location,
      'DESCRIPTION:' + WEDDING.description,
      'END:VEVENT',
      'END:VCALENDAR',
    ]
    return lines.join('\r\n')
  }

  const saveDateButton = $('#save-date')
  if (saveDateButton) {
    saveDateButton.addEventListener('click', () => {
      const blob = new Blob([buildICS()], { type: 'text/calendar;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'gibran-gladis.ics'
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.setTimeout(() => URL.revokeObjectURL(url), 4000)
      showToast('Undangan kalender sedang diunduh')
    })
  }

  /* ---------------------------------------------------------
     Countdown
     --------------------------------------------------------- */
  const countdown = $('#countdown')

  if (countdown) {
    const target = new Date(WEDDING.start).getTime()
    const nodes = {
      days: $('[data-count="days"]', countdown),
      hours: $('[data-count="hours"]', countdown),
      minutes: $('[data-count="minutes"]', countdown),
      seconds: $('[data-count="seconds"]', countdown),
    }
    const previous = { days: null, hours: null, minutes: null, seconds: null }

    const pad = (value) => String(value).padStart(2, '0')

    const renderCountdown = () => {
      const distance = Math.max(0, target - Date.now())
      const values = {
        days: pad(Math.floor(distance / 86400000)),
        hours: pad(Math.floor((distance / 3600000) % 24)),
        minutes: pad(Math.floor((distance / 60000) % 60)),
        seconds: pad(Math.floor((distance / 1000) % 60)),
      }

      Object.keys(values).forEach((key) => {
        if (values[key] === previous[key]) return
        previous[key] = values[key]
        const node = nodes[key]
        if (!node) return
        node.textContent = values[key]
        if (!prefersReducedMotion) {
          node.classList.remove('is-tick')
          void node.offsetWidth
          node.classList.add('is-tick')
        }
      })
    }

    renderCountdown()
    window.setInterval(renderCountdown, 1000)
  }

  /* ---------------------------------------------------------
     Gallery lightbox
     --------------------------------------------------------- */
  const lightbox = $('#lightbox')
  const lightboxImage = $('#lightbox-img')
  const lightboxCaption = $('#lightbox-caption')
  const galleryButtons = $$('.gallery-item')
  const galleryItems = galleryButtons.map((button) => {
    const image = $('img', button)
    return { src: image?.getAttribute('src') || '', alt: image?.getAttribute('alt') || '' }
  })
  let lightboxIndex = 0
  let lightboxOpener = null

  function paintLightbox() {
    const item = galleryItems[lightboxIndex]
    if (!item || !lightboxImage) return
    lightboxImage.src = item.src
    lightboxImage.alt = item.alt
    if (lightboxCaption) {
      lightboxCaption.textContent = `${lightboxIndex + 1} / ${galleryItems.length}`
    }
  }

  function openLightbox(index) {
    if (!lightbox || galleryItems.length === 0) return
    lightboxIndex = index
    lightboxOpener = document.activeElement
    paintLightbox()
    lightbox.classList.add('is-open')
    lightbox.setAttribute('aria-hidden', 'false')
    lockScroll()
    $('[data-lightbox-close]', lightbox)?.focus({ preventScroll: true })
  }

  function closeLightbox() {
    if (!lightbox || !lightbox.classList.contains('is-open')) return
    lightbox.classList.remove('is-open')
    lightbox.setAttribute('aria-hidden', 'true')
    unlockScroll()
    if (lightboxOpener instanceof HTMLElement) lightboxOpener.focus({ preventScroll: true })
  }

  function stepLightbox(direction) {
    if (!lightbox?.classList.contains('is-open')) return
    lightboxIndex = (lightboxIndex + direction + galleryItems.length) % galleryItems.length
    paintLightbox()
  }

  galleryButtons.forEach((button, index) => {
    button.addEventListener('click', () => openLightbox(index))
  })

  $('[data-lightbox-close]')?.addEventListener('click', closeLightbox)
  $('[data-lightbox-prev]')?.addEventListener('click', () => stepLightbox(-1))
  $('[data-lightbox-next]')?.addEventListener('click', () => stepLightbox(1))

  lightbox?.addEventListener('click', (event) => {
    if (event.target === lightbox) closeLightbox()
  })

  let touchStartX = 0
  lightbox?.addEventListener(
    'touchstart',
    (event) => {
      touchStartX = event.changedTouches[0].clientX
    },
    { passive: true }
  )
  lightbox?.addEventListener(
    'touchend',
    (event) => {
      const delta = event.changedTouches[0].clientX - touchStartX
      if (Math.abs(delta) > 48) stepLightbox(delta > 0 ? -1 : 1)
    },
    { passive: true }
  )

  /* ---------------------------------------------------------
     Gift sheet
     --------------------------------------------------------- */
  const giftSheet = $('#gift-sheet')
  const giftSheetPanel = giftSheet ? $('.sheet-panel', giftSheet) : null
  let giftOpener = null

  function openGiftSheet() {
    if (!giftSheet) return
    giftOpener = document.activeElement
    giftSheet.classList.add('is-open')
    giftSheet.setAttribute('aria-hidden', 'false')
    lockScroll()
    giftSheetPanel?.focus({ preventScroll: true })
  }

  function closeGiftSheet() {
    if (!giftSheet || !giftSheet.classList.contains('is-open')) return
    giftSheet.classList.remove('is-open')
    giftSheet.setAttribute('aria-hidden', 'true')
    unlockScroll()
    if (giftOpener instanceof HTMLElement) giftOpener.focus({ preventScroll: true })
  }

  $('#open-gift')?.addEventListener('click', openGiftSheet)
  $$('[data-close-sheet]').forEach((trigger) => trigger.addEventListener('click', closeGiftSheet))

  /* ---------------------------------------------------------
     Copy to clipboard
     --------------------------------------------------------- */
  async function copyText(value) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(value)
        return true
      }
    } catch (error) {
      /* fall through to legacy copy */
    }

    const helper = document.createElement('textarea')
    helper.value = value
    helper.setAttribute('readonly', '')
    helper.style.position = 'fixed'
    helper.style.opacity = '0'
    document.body.appendChild(helper)
    helper.select()
    let ok = false
    try {
      ok = document.execCommand('copy')
    } catch (error) {
      ok = false
    }
    helper.remove()
    return ok
  }

  $$('[data-copy]').forEach((button) => {
    button.addEventListener('click', async () => {
      const ok = await copyText(button.getAttribute('data-copy') || '')
      showToast(ok ? 'Nomor rekening berhasil disalin' : 'Salin manual: ' + button.getAttribute('data-copy'))
    })
  })

  /* ---------------------------------------------------------
     Wishes & RSVP
     --------------------------------------------------------- */
  const WISHES_KEY = 'gg-wishes-v1'
  const wishForm = $('#wish-form')
  const wishList = $('#wish-list')
  const nameInput = $('#guest-name')
  const messageInput = $('#guest-message')
  const nameNote = $('#name-note')
  const formError = $('#form-error')
  const attendButtons = $$('.attend-btn')
  let attendance = 'hadir'

  const seedWishes = [
    {
      name: 'Keluarga Besar',
      message: "Barakallahu lakuma wa baraka 'alaikuma wa jama'a bainakuma fii khair.",
      attendance: 'hadir',
      createdAt: '2026-02-12T09:12:00+07:00',
    },
    {
      name: 'Rani & Dimas',
      message: 'Selamat menempuh hidup baru, semoga sakinah mawaddah warahmah. Sampai jumpa di hari bahagianya!',
      attendance: 'hadir',
      createdAt: '2026-02-10T18:42:00+07:00',
    },
    {
      name: 'Fajar',
      message: 'Selamat ya Gibran & Gladis, semoga selalu diberi kebahagiaan dan keberkahan.',
      attendance: 'hadir',
      createdAt: '2026-02-08T14:05:00+07:00',
    },
  ]

  function loadWishes() {
    try {
      const raw = window.localStorage.getItem(WISHES_KEY)
      if (!raw) return seedWishes.slice()
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) return seedWishes.slice()
      return parsed.filter((item) => item && typeof item.name === 'string' && typeof item.message === 'string')
    } catch (error) {
      return seedWishes.slice()
    }
  }

  let wishes = loadWishes()

  function saveWishes() {
    try {
      window.localStorage.setItem(WISHES_KEY, JSON.stringify(wishes.slice(0, 60)))
    } catch (error) {
      /* storage might be unavailable — the list still works for this session */
    }
  }

  function formatWishDate(value) {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return ''
    const pad = (number) => String(number).padStart(2, '0')
    return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()} ${pad(
      date.getHours()
    )}:${pad(date.getMinutes())}`
  }

  function createWishElement(wish) {
    const item = document.createElement('li')
    item.className = 'wish'

    const avatar = document.createElement('span')
    avatar.className = 'avatar'
    avatar.setAttribute('aria-hidden', 'true')
    avatar.innerHTML =
      '<svg viewBox="0 0 24 24" fill="currentColor" class="h-[1.15rem] w-[1.15rem]"><path d="M12 12a4.25 4.25 0 1 0 0-8.5A4.25 4.25 0 0 0 12 12Zm0 1.9c-3.6 0-6.5 1.85-6.5 4.35V20h13v-1.75c0-2.5-2.9-4.35-6.5-4.35Z"/></svg>'

    const body = document.createElement('div')
    body.className = 'min-w-0 flex-1'

    const header = document.createElement('div')
    header.className = 'flex flex-wrap items-baseline gap-x-2 gap-y-0.5'

    const name = document.createElement('p')
    name.className = 'wish-name'
    name.textContent = wish.name

    const meta = document.createElement('p')
    meta.className = 'wish-meta'
    meta.textContent = formatWishDate(wish.createdAt)

    header.append(name, meta)

    const text = document.createElement('p')
    text.className = 'wish-text'
    text.textContent = wish.message

    body.append(header, text)
    item.append(avatar, body)
    return item
  }

  function renderWishes() {
    if (!wishList) return
    wishList.replaceChildren(...wishes.map(createWishElement))
  }

  function setAttendance(value) {
    attendance = value
    attendButtons.forEach((button) => {
      button.setAttribute('aria-pressed', String(button.getAttribute('data-attend') === value))
    })
  }

  attendButtons.forEach((button) => {
    button.addEventListener('click', () => setAttendance(button.getAttribute('data-attend') || 'hadir'))
  })

  function showFieldError(message, field) {
    if (formError) {
      formError.textContent = message
      formError.classList.remove('hidden')
    }
    if (field) {
      field.classList.add('is-invalid')
      field.focus({ preventScroll: true })
    }
  }

  function clearFormError() {
    formError?.classList.add('hidden')
    nameInput?.classList.remove('is-invalid')
    messageInput?.classList.remove('is-invalid')
  }

  function updateNameNote() {
    if (!nameNote || !nameInput) return
    const empty = nameInput.value.trim().length === 0
    nameNote.classList.toggle('is-visible', empty)
  }

  nameInput?.addEventListener('input', () => {
    nameInput.classList.remove('is-invalid')
    if (nameInput.value.trim()) nameNote?.classList.remove('is-visible')
    else updateNameNote()
  })

  messageInput?.addEventListener('input', () => messageInput.classList.remove('is-invalid'))

  wishForm?.addEventListener('submit', (event) => {
    event.preventDefault()
    clearFormError()

    const name = (nameInput?.value || '').trim()
    const message = (messageInput?.value || '').trim()

    if (!name) {
      nameNote?.classList.add('is-visible')
      showFieldError('Mohon isi nama Anda terlebih dahulu.', nameInput)
      return
    }
    if (!message) {
      showFieldError('Mohon tuliskan ucapan & doa restu Anda.', messageInput)
      return
    }

    wishes.unshift({
      name: name.slice(0, 40),
      message: message.slice(0, 500),
      attendance,
      createdAt: new Date().toISOString(),
    })
    saveWishes()
    renderWishes()

    if (messageInput) messageInput.value = ''
    showToast('Terima kasih atas ucapan & doa restunya 🤍')

    const firstWish = wishList?.firstElementChild
    if (firstWish && !prefersReducedMotion) {
      firstWish.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  })

  renderWishes()

  /* ---------------------------------------------------------
     Keyboard: close overlays
     --------------------------------------------------------- */
  document.addEventListener('keydown', (event) => {
    const lightboxOpen = lightbox?.classList.contains('is-open')
    const giftOpen = giftSheet?.classList.contains('is-open')

    if (event.key === 'Escape') {
      if (lightboxOpen) closeLightbox()
      if (giftOpen) closeGiftSheet()
      return
    }

    if (!lightboxOpen) return
    if (event.key === 'ArrowLeft') stepLightbox(-1)
    if (event.key === 'ArrowRight') stepLightbox(1)
  })
})()
