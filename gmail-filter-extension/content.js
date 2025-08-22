const revisados = new Map()
let debounceTimeout = null
const tiempoExpiracion = 3 * 60 * 1000

function obtenerEmails() {
    try {
        const emails = new Set()
        const fromDropdown = document.querySelector('div[aria-label="De"]')
        if (fromDropdown) {
            const emailSpan = fromDropdown.querySelector("span[email]")
            if (emailSpan)
                emails.add(emailSpan.getAttribute("email").toLowerCase())
            const match = fromDropdown.innerText
                .trim()
                .match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/)
            if (match) emails.add(match[0].toLowerCase())
        }
        document
            .querySelectorAll(
                "span[email][name], div[role='listitem'] span[email]"
            )
            .forEach(el => emails.add(el.getAttribute("email").toLowerCase()))
        document
            .querySelectorAll(
                'textarea[name="to"], textarea[name="cc"], textarea[name="bcc"]'
            )
            .forEach(el =>
                el.value
                    .match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/g)
                    ?.forEach(email => emails.add(email.toLowerCase()))
            )
        document
            .querySelectorAll("span[email]")
            .forEach(el => emails.add(el.getAttribute("email").toLowerCase()))
        const userEmailElem = document.querySelector(
            'a[href^="https://accounts.google.com/SignOutOptions"]'
        )
        if (userEmailElem) {
            const match = (
                userEmailElem.getAttribute("aria-label") || ""
            ).match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/)
            if (match) emails.add(match[0].toLowerCase())
        }
        const metaEmail = document.querySelector('meta[itemprop="email"]')
        if (metaEmail)
            emails.add(metaEmail.getAttribute("content").toLowerCase())
        return Array.from(emails)
    } catch (error) {
        console.error("Error al obtener los correos:", error)
        return ["desconocido@segurobank.com"]
    }
}

function hashString(str) {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i)
        hash |= 0 // Convierte a 32 bits
    }
    return hash
}

async function checkEmailContent() {
    try {
        const emailBodyElem = document.querySelector(
            'div[aria-label="Cuerpo del mensaje"]'
        )
        const subjectInput = document.querySelector('input[name="subjectbox"]')
        const readingBodyElem = document.querySelector("div.a3s.aiL")

        if (!emailBodyElem && !readingBodyElem) return true

        const emailBody = (emailBodyElem || readingBodyElem).innerText || ""
        const subjectElem = subjectInput || document.querySelector("h2.hP")
        const emailSubject = subjectElem
            ? subjectElem.value || subjectElem.innerText.trim()
            : "(sin asunto)"

        const emailId = hashString(emailSubject + emailBody)

        // Verificar si el email ya ha sido revisado
        if (
            revisados.has(emailId) &&
            Date.now() - revisados.get(emailId) < tiempoExpiracion
        ) {
            console.log(`Email ya revisado: ${emailId}`)
            return true
        }

        // Marcar email como revisado y establecer el tiempo de expiración
        revisados.set(emailId, Date.now())
        console.log(`Revisando nuevo email: ${emailId}`)

        // Eliminar los emails revisados que han expirado
        revisados.forEach((timestamp, key) => {
            if (Date.now() - timestamp > tiempoExpiracion) {
                revisados.delete(key)
                console.log(`Email expirado eliminado: ${key}`)
            }
        })

        const payload = {
            id: emailId,
            asunto: emailSubject,
            remitente: obtenerEmails(),
            texto: `${emailSubject}\n${emailBody}`,
        }

        const response = await fetch(
            "https://model-detection.giize.com/analizar",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            }
        )

        if (!response.ok) return true
        const data = await response.json()
        console.log(`Resultado de la detección: ${data.etiqueta}`)

        return !(
            data.etiqueta === "filtracion" || data.etiqueta === "sospechoso"
        )
    } catch (error) {
        console.error("Error en la revisión del contenido del email:", error)
        return true
    }
}

function interceptSubmit() {
    const handleSubmit = async event => {
        console.log("Intentando enviar...")
        if (!(await checkEmailContent())) {
            console.log("El contenido no es seguro, no se enviará.")
            event.preventDefault()
            event.stopPropagation()
        }
    }

    document.body.addEventListener(
        "keydown",
        e => {
            if ((e.ctrlKey || e.metaKey) && e.key === "Enter") handleSubmit(e)
        },
        true
    )

    document.body.addEventListener(
        "click",
        e => {
            if (e.target.closest('div[role="button"][data-tooltip^="Enviar"]'))
                handleSubmit(e)
        },
        true
    )

    const observer = new MutationObserver(() => {
        if (debounceTimeout) clearTimeout(debounceTimeout)
        debounceTimeout = setTimeout(() => {
            if (document.querySelector("div.a3s.aiL")) checkEmailContent()
        }, 300)
    })

    observer.observe(document.body, { childList: true, subtree: true })
}

interceptSubmit()
