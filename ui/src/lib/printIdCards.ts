import { idCardStyles } from "@/components/id-cards/cardStyles"

export async function printIdCards(container: HTMLElement): Promise<void> {
  const cards = [...container.querySelectorAll<HTMLElement>(".school-id-card")]
  if (!cards.length || cards.some((card) => card.dataset.cardReady !== "true"))
    throw new Error(
      "Complete the card details and wait for all QR codes before printing."
    )
  const frame = document.createElement("iframe")
  frame.title = "Print ID cards"
  frame.style.cssText =
    "position:fixed;width:1px;height:1px;left:-10000px;top:0;border:0"
  document.body.appendChild(frame)
  try {
    const doc = frame.contentDocument
    const win = frame.contentWindow
    if (!doc || !win) throw new Error("The print window could not be opened.")
    const style = doc.createElement("style")
    style.textContent = `${idCardStyles}\n@page{size:A4;margin:10mm} body{margin:0;display:flex;flex-wrap:wrap;align-content:flex-start;gap:6mm;font-family:Arial,sans-serif} .school-id-card{margin:0} `
    if (cards.some((card) => card.classList.contains("student-id-card")))
      style.textContent +=
        " body{display:block} .school-id-card{margin:0 auto;break-after:page;page-break-after:always} .school-id-card:last-child{break-after:auto;page-break-after:auto}"
    doc.head.appendChild(style)
    doc.title = "School ID cards"
    cards.forEach((card) => doc.body.appendChild(doc.importNode(card, true)))
    await Promise.all(
      [...doc.images].map(
        (img) =>
          new Promise<void>((resolve, reject) => {
            if (img.complete) {
              if (img.naturalWidth) resolve()
              else
                reject(
                  new Error(
                    "A card image could not load. Reopen the preview and try again."
                  )
                )
              return
            }
            const timer = setTimeout(
              () =>
                reject(
                  new Error(
                    "A card image took too long to load. Please try again."
                  )
                ),
              15000
            )
            img.onload = () => {
              clearTimeout(timer)
              resolve()
            }
            img.onerror = () => {
              clearTimeout(timer)
              reject(
                new Error("A card image could not load. Please try again.")
              )
            }
          })
      )
    )
    await doc.fonts.ready
    win.addEventListener("afterprint", () => frame.remove(), { once: true })
    win.focus()
    win.print()
    // Some browsers omit afterprint when the print dialog is cancelled.
    setTimeout(() => frame.remove(), 300000)
  } catch (error) {
    frame.remove()
    throw error
  }
}
