;(() => {
  "use strict"
  document.querySelectorAll("[data-em360-root]").forEach((root, instance) => {
    let csrf = "",
      schoolName = "Your school",
      signedIn = false,
      requestGeneration = 0
    let activeFrame = null,
      activeNavigation = null,
      syncSidebar = () => {}
    let collapsed = false,
      drawerOpen = false
    try {
      collapsed = localStorage.getItem("em360-sidebar-collapsed") === "1"
    } catch {
      /* Storage is optional. */
    }
    const mobile = matchMedia("(max-width: 900px)")
    const navigationRules = globalThis.EM360Navigation
    const sidebarId = `em360-sidebar-${instance}`
    const contentId = instance
      ? `em360-workspace-content-${instance}`
      : "em360-workspace-content"
    const node = (tag, text, className) => {
      const el = document.createElement(tag)
      if (text !== undefined) el.textContent = text
      if (className) el.className = className
      return el
    }
    // Static line icons match the React dashboard; labels and API data are always text nodes.
    const paths = {
      school: [
        "M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6M9 9h.01M15 9h.01M9 12h.01M15 12h.01",
      ],
      menu: ["M4 5h16M4 12h16M4 19h16"],
      close: ["m6 6 12 12M6 18 18 6"],
      panel: [
        "M9 3v18",
        "M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z",
      ],
      grid: ["M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z"],
      users: [
        "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M22 21v-2a4 4 0 0 0-3-3.87",
        "M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8M16 3.13a4 4 0 0 1 0 7.75",
      ],
      briefcase: ["M8 6V4h8v2M3 11l9 3 9-3M3 6h18v14H3zM12 12v4"],
      card: [
        "M3 5h18v14H3zM14 10h4M14 14h4M6 14h4M8 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4",
      ],
      calendar: ["M8 2v4M16 2v4M3 10h18M3 4h18v18H3zM8 14h2M14 14h2M8 18h2"],
      check: ["m5 12 4 4L19 6"],
      shield: ["M12 3 3 7v5c0 5 9 9 9 9s9-4 9-9V7z", "m8 12 3 3 5-6"],
      chat: [
        "M21 11.5a8.5 8.5 0 0 1-8.5 8.5H4l-3 2 2-6V11.5A8.5 8.5 0 0 1 11.5 3h1a8.5 8.5 0 0 1 8.5 8.5Z",
        "M7 11h.01M12 11h.01M17 11h.01",
      ],
      bell: ["M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"],
      settings: [
        "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2",
      ],
      visit: ["M3 21h18M5 21V3h10v18M15 9h4v12M9 12h.01"],
      chevron: ["m9 5 7 7-7 7"],
      down: ["m6 9 6 6 6-6"],
      refresh: ["M20 7a8 8 0 1 0 1 8M20 3v5h-5"],
      logout: ["M9 21H3V3h6M9 12h12m-4-4 4 4-4 4"],
      back: ["m12 5-7 7 7 7M5 12h15"],
    }
    const icon = (name) => {
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
      Object.entries({
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        "stroke-width": "1.7",
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
        "aria-hidden": "true",
        focusable: "false",
      }).forEach(([k, v]) => svg.setAttribute(k, v))
      ;(paths[name] || paths.grid).forEach((d) => {
        const p = document.createElementNS(svg.namespaceURI, "path")
        p.setAttribute("d", d)
        svg.append(p)
      })
      return svg
    }
    const menuIcon = (name) => {
      const n = name.toLowerCase()
      return /role/.test(n)
        ? "briefcase"
        : /id card/.test(n)
          ? "card"
          : /attendance|session|academic/.test(n)
            ? "calendar"
            : /consent/.test(n)
              ? "shield"
              : /visit/.test(n)
                ? "visit"
                : /chat|message/.test(n)
                  ? "chat"
                  : /notification/.test(n)
                    ? "bell"
                    : /setting/.test(n)
                      ? "settings"
                      : /manage.*user/.test(n)
                        ? "users"
                        : "grid"
    }
    const message = (text, error = false) => {
      root.querySelector(".em360-message")?.remove()
      const el = node("p", text, `em360-message ${error ? "em360-error" : ""}`)
      el.setAttribute("role", error ? "alert" : "status")
      ;(root.querySelector(".em360-main") || root).prepend(el)
    }
    const button = (label, callback, secondary = false, symbol) => {
      const el = node(
        "button",
        undefined,
        secondary ? "em360-button em360-secondary" : "em360-button",
      )
      el.type = "button"
      el.setAttribute("aria-label", label)
      if (symbol) el.append(icon(symbol))
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
    const api = async (path, method = "GET") => {
      const url = new URL(root.dataset.restBase, location.origin)
      if (url.searchParams.has("rest_route"))
        url.searchParams.set(
          "rest_route",
          url.searchParams.get("rest_route").replace(/\/$/, "") + "/" + path,
        )
      else url.pathname = url.pathname.replace(/\/$/, "") + "/" + path
      const response = await fetch(url, {
        method,
        credentials: "same-origin",
        cache: "no-store",
        headers: {
          Accept: "application/json",
          ...(csrf ? { "X-EM360-CSRF": csrf } : {}),
        },
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        const error = new Error(
          data.message ||
            "The request could not be completed. Please try again.",
        )
        error.status = response.status
        throw error
      }
      return data
    }
    const siteLink = () => {
      const el = node("a", undefined, "em360-site-link")
      const url = new URL(root.dataset.homeUrl || "/", location.origin)
      el.href = url.origin === location.origin ? url.href : "/"
      el.append(
        icon("back"),
        node("span", "Back to website", "em360-button-label"),
      )
      el.title = "Back to website"
      el.setAttribute("aria-label", "Back to website")
      return el
    }
    const brand = () => {
      const el = node("div", undefined, "em360-brand")
      const mark = node("span", undefined, "em360-brand-mark")
      mark.append(icon("school"))
      const text = node("div", undefined, "em360-brand-text")
      text.append(node("strong", "EM360"), node("span", "School management"))
      el.append(mark, text)
      return el
    }
    const heading = () => {
      activeFrame = null
      activeNavigation = null
      drawerOpen = false
      syncSidebar = () => {}
      root.replaceChildren()
      root.classList.remove("em360-has-workspace")
      const header = node("header", undefined, "em360-welcome-header")
      header.append(brand(), siteLink())
      root.append(header)
    }
    const signIn = async () => {
      const response = await api("login", "POST"),
        destination = new URL(response.authorizeUrl)
      if (destination.protocol !== "https:")
        throw new Error(
          "Invalid sign-in address. Contact your school administrator.",
        )
      location.assign(destination.href)
    }
    const login = (notice) => {
      signedIn = false
      heading()
      const card = node("main", undefined, "em360-welcome")
      card.id = contentId
      card.tabIndex = -1
      card.append(
        node("div", "YOUR SCHOOL WORKSPACE", "em360-eyebrow"),
        node("h1", schoolName),
        node(
          "p",
          "Sign in with your EM360 account to open your school overview and permitted modules.",
        ),
        button("Continue to EM360 sign-in", signIn, false, "logout"),
        node(
          "p",
          "For school owners and active staff. Your school’s permissions apply.",
          "em360-muted",
        ),
      )
      root.append(card)
      if (notice) message(notice, true)
    }
    const date = (value) =>
      value
        ? new Date(value).toLocaleDateString(undefined, {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : ""
    const accessLabel = (reason) =>
      ({
        Paid: "Subscription active",
        Trial: "Trial active",
        RenewalGrace: "Renewal grace period",
        SubscriptionRequired: "Subscription required",
        AwaitingApproval: "Awaiting approval",
        AdminBlocked: "Portal paused",
      })[reason] ||
      reason ||
      "School access"
    const dashboard = async () => {
      const generation = ++requestGeneration
      let data
      try {
        data = await api("dashboard")
      } catch (error) {
        if (generation !== requestGeneration) return
        if (error.status === 401 || error.status === 403) {
          login(error.message)
          return
        }
        throw error
      }
      if (generation !== requestGeneration) return
      signedIn = true
      schoolName = data.school.name
      const restoreFocus = root.contains(document.activeElement)
      heading()
      root.classList.add("em360-has-workspace")
      const app = node("div", undefined, "em360-app")
      const header = node("header", undefined, "em360-topbar")
      const toggle = button(
        "Toggle navigation",
        () => {
          if (mobile.matches) drawerOpen = !drawerOpen
          else {
            collapsed = !collapsed
            try {
              localStorage.setItem(
                "em360-sidebar-collapsed",
                collapsed ? "1" : "0",
              )
            } catch {}
          }
          syncSidebar()
        },
        true,
        "panel",
      )
      toggle.classList.add("em360-icon-button")
      toggle.title = "Toggle navigation"
      toggle.setAttribute("aria-controls", sidebarId)
      const identity = node("div", undefined, "em360-school-heading")
      identity.append(
        node("strong", schoolName),
        node(
          "span",
          data.roles?.length ? data.roles.join(" · ") : data.role,
          "em360-muted",
        ),
      )
      const actions = node("div", undefined, "em360-actions")
      const refresh = button("Refresh", dashboard, true, "refresh")
      refresh.classList.add("em360-icon-button")
      refresh.title = "Refresh"
      const logout = button(
        "Sign out",
        async () => {
          await api("logout", "POST")
          await init()
        },
        true,
        "logout",
      )
      logout.classList.add("em360-icon-button")
      logout.title = "Sign out"
      actions.append(refresh, logout)
      header.append(toggle, identity, actions)
      const sidebar = node("aside", undefined, "em360-sidebar")
      sidebar.id = sidebarId
      const sideHeader = node("div", undefined, "em360-sidebar-header")
      const close = button(
        "Close navigation",
        () => {
          drawerOpen = false
          syncSidebar()
          toggle.focus()
        },
        false,
        "close",
      )
      close.classList.add("em360-drawer-close", "em360-icon-button")
      sideHeader.append(brand(), close)
      sidebar.append(sideHeader)
      const main = node("main", undefined, "em360-main")
      main.id = contentId
      main.tabIndex = -1
      const contextbar = node("div", undefined, "em360-contextbar")
      const breadcrumb = node("div", undefined, "em360-breadcrumb")
      const access = node(
        "div",
        undefined,
        data.access.canLaunch
          ? "em360-access"
          : "em360-access em360-access-paused",
      )
      access.append(
        node("span", undefined, "em360-status-dot"),
        node("span", accessLabel(data.access.reason)),
      )
      if (data.access.accessEndsAtUtc) {
        const expiry = node(
          "span",
          "Until " + date(data.access.accessEndsAtUtc),
          "em360-access-date",
        )
        access.append(expiry)
      }
      contextbar.append(breadcrumb, access)
      main.append(contextbar)
      const backdrop = button("Close navigation", () => {
        drawerOpen = false
        syncSidebar()
        toggle.focus()
      })
      backdrop.className = "em360-backdrop"
      backdrop.tabIndex = -1
      backdrop.setAttribute("aria-hidden", "true")
      app.append(sidebar, header, main, backdrop)
      root.replaceChildren(app)
      syncSidebar = () => {
        const isMobile = mobile.matches,
          opened = isMobile && drawerOpen
        app.classList.toggle("em360-sidebar-collapsed", !isMobile && collapsed)
        app.classList.toggle("em360-drawer-open", opened)
        toggle.setAttribute(
          "aria-expanded",
          String(isMobile ? drawerOpen : !collapsed),
        )
        sidebar.inert = isMobile && !drawerOpen
        if (isMobile && !drawerOpen) sidebar.setAttribute("aria-hidden", "true")
        else sidebar.removeAttribute("aria-hidden")
        main.inert = opened
        header.inert = opened
        if (opened) {
          sidebar.setAttribute("role", "dialog")
          sidebar.setAttribute("aria-modal", "true")
          sidebar.setAttribute("aria-label", "School navigation")
          close.focus()
        } else {
          sidebar.removeAttribute("role")
          sidebar.removeAttribute("aria-modal")
          sidebar.removeAttribute("aria-label")
        }
      }
      const navigation = navigationRules.normalize(data)
      activeNavigation = navigation
      const selected = navigation
        ? navigationRules.selection(navigation, location.hash)
        : {}
      const switchTo = async (module, menu) => {
        drawerOpen = false
        syncSidebar()
        const next = navigationRules.hash(module.id, menu.id)
        if (location.hash === next) await dashboard()
        else location.hash = next
      }
      if (navigation) {
        const profile = node("details", undefined, "em360-profile")
        const summary = node("summary")
        summary.setAttribute("aria-label", "Switch module, " + data.role)
        summary.append(
          node(
            "span",
            (data.role || "Staff").charAt(0).toUpperCase(),
            "em360-avatar",
          ),
          node("span", data.role + " · Modules", "em360-profile-label"),
          icon("down"),
        )
        profile.append(summary)
        const choices = node("div", undefined, "em360-module-choices")
        choices.append(node("strong", "Switch module"))
        const rank = (name) =>
          name === "User Management" ? 0 : name === "Exams and Records" ? 1 : 2
        ;[...navigation.modules]
          .sort((a, b) => rank(a.name) - rank(b.name))
          .forEach((module) => {
            const item = button(
              module.name,
              () => switchTo(module, module.menus[0]),
              true,
              "grid",
            )
            if (module.id === selected.module?.id)
              item.setAttribute("aria-current", "true")
            choices.append(item)
          })
        if (!navigation.modules.length)
          choices.append(node("p", "No module access assigned."))
        profile.append(choices)
        actions.prepend(profile)
        profile.addEventListener("keydown", (e) => {
          if (e.key === "Escape") {
            profile.open = false
            summary.focus()
          }
        })
      }
      const nav = node("nav", undefined, "em360-sidebar-nav")
      nav.setAttribute(
        "aria-label",
        (selected.module?.name || "School") + " menus",
      )
      sidebar.append(
        node("h3", selected.module?.name || "School workspace"),
        nav,
      )
      if (selected.module && selected.menu) {
        selected.module.menus.forEach((menu) => {
          const item = button(
            menu.name,
            () => switchTo(selected.module, menu),
            true,
            menuIcon(menu.name),
          )
          item.dataset.menuId = menu.id
          item.title = menu.name
          if (menu.id === selected.menu.id)
            item.setAttribute("aria-current", "page")
          nav.append(item)
        })
        breadcrumb.append(
          node("span", selected.module.name),
          icon("chevron"),
          node("strong", selected.menu.name),
        )
      }
      const footer = node("div", undefined, "em360-sidebar-footer")
      footer.append(siteLink())
      sidebar.append(footer)
      const content = node("section", undefined, "em360-content")
      main.append(content)
      if (!data.access.canLaunch) {
        content.append(
          node("h2", "School access paused"),
          node(
            "p",
            data.access.reason === "SubscriptionRequired"
              ? "The school owner can manage the subscription in EM360. Refresh this page after access is restored."
              : "Contact the school owner or EM360 support to restore access.",
            "em360-panel",
          ),
        )
      } else if (!navigation) {
        content.append(
          node(
            "p",
            "Update the EM360 School API to enable module navigation for this connector version.",
            "em360-panel",
          ),
        )
      } else if (!selected.module || !selected.menu) {
        content.append(
          node("h2", "No module access"),
          node(
            "p",
            "Contact your school administrator to assign access.",
            "em360-panel",
          ),
        )
      } else if (
        (["/dashboard/staff/voting", "/dashboard/availability"].includes(selected.menu.path) || ["user management", "student portal", "parent portal", "exams and records", "fee management", "e-learning", "timetable", "attendance", "hostel", "staff", "staff management", "health records", "training & development", "learner support", "voting", "reporting & analytics", "reports & analytics", "safeguarding and pastoral care", "document designer"].includes(
          selected.module.name.toLowerCase(),
        )) &&
        root.dataset.moduleUrl
      ) {
        const url = new URL(root.dataset.moduleUrl, location.origin)
        if (url.origin !== location.origin)
          throw new Error("Invalid module application address.")
        url.searchParams.set("path", selected.menu.path)
        url.searchParams.set("menu", selected.menu.id)
        url.searchParams.set(
          "module",
          ["/dashboard/staff/voting", "/dashboard/availability"].includes(selected.menu.path) ? "staff" : selected.module.name.toLowerCase() === "student portal"
            ? "students"
            : selected.module.name.toLowerCase() === "parent portal" ? "parents" : selected.module.name.toLowerCase() === "exams and records" ? "exams" : selected.module.name.toLowerCase() === "fee management" ? "fees" : selected.module.name.toLowerCase() === "e-learning" ? "elearning" : selected.module.name.toLowerCase() === "timetable" ? "timetable" : selected.module.name.toLowerCase() === "attendance" ? "attendance" : selected.module.name.toLowerCase() === "hostel" ? "hostel" : ["staff", "staff management"].includes(selected.module.name.toLowerCase()) ? "staff" : selected.module.name.toLowerCase() === "health records" ? "health" : selected.module.name.toLowerCase() === "training & development" ? "training" : selected.module.name.toLowerCase() === "learner support" ? "learner-support" : selected.module.name.toLowerCase() === "voting" ? "voting" : ["reporting & analytics", "reports & analytics"].includes(selected.module.name.toLowerCase()) ? "reports" : selected.module.name.toLowerCase() === "safeguarding and pastoral care" ? "safeguarding" : selected.module.name.toLowerCase() === "document designer" ? "document-designer" : "users",
        )
        const frame = node("iframe", undefined, "em360-module-frame")
        frame.title = selected.module.name + " — " + selected.menu.name
        frame.src = url.href
        frame.referrerPolicy = "no-referrer"
        frame.allow = "geolocation; camera; microphone; display-capture; fullscreen; autoplay"
        activeFrame = frame
        content.classList.add("em360-native-module")
        content.append(frame)
      } else {
        content.append(
          node("p", selected.module.name, "em360-eyebrow"),
          node("h3", selected.menu.name),
        )
        if (selected.module.description)
          content.append(node("p", selected.module.description, "em360-muted"))
        const launcher = node("div", undefined, "em360-launcher")
        launcher.append(
          node(
            "p",
            "Continue to this school’s " +
              selected.menu.name +
              " screen in EM360. Your current account and permissions are checked again before it opens.",
          ),
        )
        const link = node(
          "a",
          "Open " + selected.menu.name + " in EM360 ↗",
          "em360-button",
        )
        link.href = navigationRules.launch(
          data.frontendUrl,
          data.school.id,
          selected.module.id,
          selected.menu.id,
        )
        link.target = "_blank"
        link.rel = "noopener noreferrer"
        launcher.append(
          link,
          node(
            "p",
            "Opens in a new tab. This module will be implemented inside WordPress in a later phase.",
            "em360-muted",
          ),
        )
        content.append(launcher)
        const rights = node("div", undefined, "em360-permissions")
        rights.append(node("span", "Your menu permissions: "))
        selected.menu.permissions.forEach((p) =>
          rights.append(node("span", p, "em360-tag")),
        )
        content.append(rights)
        if (data.counts) {
          const stats = node("div", undefined, "em360-stats")
          ;[
            ["Active students", data.counts.students],
            ["Active staff", data.counts.staff],
            ["Classes", data.counts.classes],
          ].forEach(([label, value]) => {
            const card = node("div", undefined, "em360-stat")
            card.append(
              node("span", label),
              node("strong", Number(value).toLocaleString()),
            )
            stats.append(card)
          })
          content.append(stats)
        }
      }
      syncSidebar()
      if (restoreFocus) main.focus({ preventScroll: true })
    }
    mobile.addEventListener("change", () => {
      drawerOpen = false
      syncSidebar()
    })
    root.addEventListener("keydown", (event) => {
      if (!mobile.matches || !drawerOpen) return
      if (event.key === "Escape") {
        event.preventDefault()
        drawerOpen = false
        syncSidebar()
        root.querySelector(".em360-topbar button")?.focus()
      }
      if (event.key === "Tab") {
        const items = [
          ...root.querySelectorAll(
            ".em360-sidebar button:not([disabled]),.em360-sidebar a[href]",
          ),
        ].filter((e) => e.getClientRects().length)
        const first = items[0],
          last = items[items.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last?.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first?.focus()
        }
      }
    })
    root.addEventListener("click", (event) => {
      const profile = root.querySelector(".em360-profile")
      if (profile && !profile.contains(event.target)) profile.open = false
    })
    window.addEventListener("hashchange", () => {
      if (signedIn) dashboard().catch((error) => message(error.message, true))
    })
    window.addEventListener("message", (event) => {
      if (
        !activeFrame ||
        event.source !== activeFrame.contentWindow ||
        event.origin !== location.origin
      )
        return
      if (event.data?.type === "em360:session-ended") {
        ++requestGeneration
        login("Your session ended. Sign in again to continue.")
        return
      }
      if (event.data?.type !== "em360:module-route") return
      const module = activeNavigation?.modules.find(
          (m) => m.id === event.data.moduleId,
        ),
        menu = module?.menus.find((m) => m.id === event.data.menuId)
      if (!module || !menu) return
      history.replaceState(
        history.state,
        "",
        navigationRules.hash(module.id, menu.id),
      )
      root.querySelectorAll(".em360-sidebar [data-menu-id]").forEach((el) => {
        if (el.dataset.menuId === menu.id)
          el.setAttribute("aria-current", "page")
        else el.removeAttribute("aria-current")
      })
      const crumb = root.querySelector(".em360-breadcrumb strong")
      if (crumb) crumb.textContent = menu.name
      activeFrame.title = module.name + " — " + menu.name
    })
    const init = async () => {
      const data = await api("bootstrap")
      csrf = data.csrf
      schoolName = data.schoolName || "Your school"
      if (!data.connected) {
        heading()
        const card = node("main", undefined, "em360-welcome")
        card.id = contentId
        card.append(
          node("h1", "Your portal is almost ready"),
          node(
            "p",
            "Ask the website administrator to connect a school in WordPress → EM360.",
          ),
        )
        root.append(card)
        return
      }
      if (data.signedIn) await dashboard()
      else login()
    }
    init().catch((error) => {
      heading()
      const card = node("main", undefined, "em360-welcome")
      card.id = contentId
      card.append(
        node("h1", "We could not load the portal"),
        node("p", error.message),
        button("Try again", init),
      )
      root.append(card)
    })
  })
})()
