import { reportCardStyles } from "@/components/report-card/reportCardStyles"

export async function printReportCard(container: HTMLElement): Promise<void> {
  const card = container.querySelector<HTMLElement>(".report-card")
  if (!card) throw new Error("There is no report card to print.")
  const frame = document.createElement("iframe")
  frame.title = "Print report card"
  frame.style.cssText =
    "position:fixed;width:1px;height:1px;left:-10000px;top:0;border:0"
  document.body.appendChild(frame)
  try {
    const doc = frame.contentDocument
    const win = frame.contentWindow
    if (!doc || !win) throw new Error("The print window could not be opened.")
    const style = doc.createElement("style")
    style.textContent = `${reportCardStyles}\n@page{size:A4;margin:0} body{margin:0}`
    doc.head.appendChild(style)
    doc.title = "Student report card"
    doc.body.appendChild(doc.importNode(card, true))
    // A missing logo must not block printing, so wait for images but ignore failures
    await Promise.all(
      [...doc.images].map(
        (img) =>
          new Promise<void>((resolve) => {
            if (img.complete) return resolve()
            const timer = setTimeout(resolve, 8000)
            const done = () => {
              clearTimeout(timer)
              resolve()
            }
            img.onload = done
            img.onerror = done
          })
      )
    )
    await doc.fonts.ready
    win.addEventListener("afterprint", () => frame.remove(), { once: true })
    win.focus()
    win.print()
    setTimeout(() => frame.remove(), 300000)
  } catch (error) {
    frame.remove()
    throw error
  }
}
