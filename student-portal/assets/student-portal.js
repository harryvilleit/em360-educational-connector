;(() => {
  "use strict"
  // The student portal page: EM360 student sign-in, then the React student portal in a same-origin frame.
  document.querySelectorAll("[data-em360-student-root]").forEach((root) => {
    let csrf = "",
      schoolName = "Your school",
      frame = null
    const node = (tag, text, className) => {
      const el = document.createElement(tag)
      if (text !== undefined) el.textContent = text
      if (className) el.className = className
      return el
    }
    const api = async (path, method = "GET", query = {}) => {
      const url = new URL(root.dataset.restBase, location.origin)
      if (url.searchParams.has("rest_route"))
        url.searchParams.set("rest_route", url.searchParams.get("rest_route").replace(/\/$/, "") + "/" + path)
      else url.pathname = url.pathname.replace(/\/$/, "") + "/" + path
      Object.entries(query).forEach(([k, v]) => url.searchParams.set(k, v))
      const response = await fetch(url, {
        method,
        credentials: "same-origin",
        cache: "no-store",
        headers: { Accept: "application/json", ...(csrf ? { "X-EM360-CSRF": csrf } : {}) },
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        const error = new Error(data.message || "The request could not be completed. Please try again.")
        error.status = response.status
        throw error
      }
      return data
    }
    const message = (text, error = false) => {
      root.querySelector(".em360-message")?.remove()
      const el = node("p", text, `em360-message ${error ? "em360-error" : ""}`)
      el.setAttribute("role", error ? "alert" : "status")
      ;(root.querySelector(".em360-welcome") || root).prepend(el)
    }
    const button = (label, callback, secondary = false) => {
      const el = node("button", undefined, secondary ? "em360-button em360-secondary" : "em360-button")
      el.type = "button"
      el.append(node("span", label, "em360-button-label"))
      el.addEventListener("click", async () => {
        el.disabled = true
        try {
          await callback()
        } catch (error) {
          message(error.message, true)
        } finally {
          el.disabled = false
        }
      })
      return el
    }
    const page = (...content) => {
      frame = null
      root.classList.remove("em360-has-workspace")
      root.replaceChildren()
      const header = node("header", undefined, "em360-welcome-header")
      const brand = node("div", undefined, "em360-brand")
      const text = node("div", undefined, "em360-brand-text")
      text.append(node("strong", "EM360"), node("span", "Student portal"))
      const mark = node("span", undefined, "em360-brand-mark")
      // The same school line icon as the staff portal; drawn from a fixed path, never from data.
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
      Object.entries({ viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-width": "1.7", "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true", focusable: "false" })
        .forEach(([k, v]) => svg.setAttribute(k, v))
      const icon = document.createElementNS(svg.namespaceURI, "path")
      icon.setAttribute("d", "M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6M9 9h.01M15 9h.01M9 12h.01M15 12h.01")
      svg.append(icon)
      mark.append(svg)
      brand.append(mark, text)
      const back = node("a", "Back to website", "em360-site-link")
      const home = new URL(root.dataset.homeUrl || "/", location.origin)
      back.href = home.origin === location.origin ? home.href : "/"
      header.append(brand, back)
      const card = node("main", undefined, "em360-welcome")
      card.tabIndex = -1
      card.append(...content)
      root.append(header, card)
      return card
    }
    const signIn = async () => {
      const response = await api("login", "POST", { audience: "student" })
      const destination = new URL(response.authorizeUrl)
      if (destination.protocol !== "https:") throw new Error("Invalid sign-in address. Contact your school.")
      location.assign(destination.href)
    }
    const login = (notice) => {
      page(
        node("div", "STUDENT PORTAL", "em360-eyebrow"),
        node("h1", schoolName),
        node("p", "Sign in with your EM360 student account to see your timetable, results, attendance, e-learning and more."),
        button("Continue to EM360 sign-in", signIn),
        node("p", "For students of this school. You will only see your own records.", "em360-muted"),
      )
      if (notice) message(notice, true)
    }
    const otherPortal = () => {
      page(
        node("div", "STUDENT PORTAL", "em360-eyebrow"),
        node("h1", schoolName),
        node("p", "This browser is signed in to the staff portal. Sign out of it to sign in as a student."),
        button("Sign out and continue", async () => {
          await api("logout", "POST")
          login()
        }),
      )
    }
    // Screens are remembered in the address (#/timetable), so refresh and shared links reopen them.
    const screen = () => location.hash.replace(/^#\/?/, "").replace(/[^a-z-]/g, "").slice(0, 30)
    const open = () => {
      root.classList.add("em360-has-workspace")
      root.replaceChildren()
      const url = new URL(root.dataset.frameUrl, location.origin)
      if (url.origin !== location.origin) throw new Error("Invalid portal address.")
      if (screen()) url.searchParams.set("path", screen())
      frame = node("iframe", undefined, "em360-module-frame")
      frame.title = "Student portal — " + schoolName
      frame.src = url.href
      frame.referrerPolicy = "no-referrer"
      // Live classes need the camera and microphone; e-learning plays video full screen.
      frame.allow = "camera; microphone; display-capture; fullscreen; autoplay"
      root.append(frame)
    }
    window.addEventListener("message", (event) => {
      if (!frame || event.source !== frame.contentWindow || event.origin !== location.origin) return
      if (event.data?.type === "em360:session-ended") {
        login("Your session ended. Sign in again to continue.")
        return
      }
      if (event.data?.type === "em360:student-route" && typeof event.data.path === "string") {
        const path = event.data.path.replace(/^\/+/, "").split("/")[0].replace(/[^a-z-]/g, "")
        history.replaceState(history.state, "", path ? "#/" + path : location.pathname + location.search)
      }
    })
    const init = async () => {
      const data = await api("bootstrap", "GET", { audience: "student" })
      csrf = data.csrf
      schoolName = data.schoolName || "Your school"
      if (!data.connected) {
        page(node("h1", "The student portal is almost ready"), node("p", "Ask the website administrator to connect the school in WordPress → EM360."))
        return
      }
      if (data.signedIn) open()
      else if (data.signedInElsewhere === "staff") otherPortal()
      else login()
    }
    init().catch((error) => {
      page(node("h1", "We could not load the student portal"), node("p", error.message), button("Try again", init))
    })
  })
})()
