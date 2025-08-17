// =======================
// 🔹 Función: obtener remitente
// =======================
function obtenerRemitente() {
    try {
        // 1️⃣ Campo "De" en COMPOSE (cuando escribes un correo)
        const fromDropdown = document.querySelector('div[aria-label="De"]')
        if (fromDropdown) {
            const emailSpan = fromDropdown.querySelector("span[email]")
            if (emailSpan) {
                const email = emailSpan.getAttribute("email")
                if (email) {
                    console.log("✅ Remitente (compose):", email)
                    return email.toLowerCase()
                }
            }
            const visibleText = fromDropdown.innerText.trim()
            const match = visibleText.match(
                /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/
            )
            if (match) {
                console.log("✅ Remitente (compose texto):", match[0])
                return match[0].toLowerCase()
            }
        }

        // 2️⃣ Header del correo en LECTURA
        const headerFrom = document.querySelector("span[email][name]")
        if (headerFrom) {
            const email = headerFrom.getAttribute("email")
            if (email) {
                console.log("✅ Remitente (lectura):", email)
                return email.toLowerCase()
            }
        }

        const headerBlock = document.querySelector(
            'div[role="listitem"] span[email]'
        )
        if (headerBlock) {
            const email = headerBlock.getAttribute("email")
            if (email) {
                console.log("✅ Remitente (lectura bloque):", email)
                return email.toLowerCase()
            }
        }

        // 3️⃣ Correo del usuario logueado
        const userEmailElem = document.querySelector(
            'a[href^="https://accounts.google.com/SignOutOptions"]'
        )
        if (userEmailElem) {
            const ariaLabel = userEmailElem.getAttribute("aria-label") || ""
            const match = ariaLabel.match(
                /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/
            )
            if (match) {
                console.log("✅ Remitente (sesión):", match[0])
                return match[0].toLowerCase()
            }
        }

        // 4️⃣ Meta tag (fallback)
        const metaEmail = document.querySelector('meta[itemprop="email"]')
        if (metaEmail) {
            const email = metaEmail.getAttribute("content")
            if (email) {
                console.log("✅ Remitente (meta):", email)
                return email.toLowerCase()
            }
        }

        console.warn(
            "⚠️ No se pudo obtener el remitente. Usando valor por defecto."
        )
        return "desconocido@segurobank.com"
    } catch (e) {
        console.error("❌ Error obteniendo remitente:", e)
        return "desconocido@segurobank.com"
    }
}

// =======================
// 🔹 Función: revisar contenido
// =======================
async function checkEmailContent() {
    try {
        const emailBodyElem = document.querySelector(
            'div[aria-label="Cuerpo del mensaje"]'
        ) // compose
        const subjectInput = document.querySelector('input[name="subjectbox"]') // compose
        const readingBodyElem = document.querySelector("div.a3s.aiL") // lectura

        let emailBody = ""
        let emailSubject = ""
        let remitente = obtenerRemitente()

        if (emailBodyElem && subjectInput) {
            // ✉️ Compose
            emailBody = emailBodyElem.innerText || ""
            emailSubject = subjectInput.value || ""
            console.log("📨 Detectado modo COMPOSE. Remitente:", remitente)
        } else if (readingBodyElem) {
            // 📩 Lectura
            emailBody = readingBodyElem.innerText || ""
            const subjectElem = document.querySelector("h2.hP")
            emailSubject = subjectElem
                ? subjectElem.innerText.trim()
                : "(sin asunto)"
            console.log("📨 Detectado modo LECTURA. Remitente:", remitente)
        } else {
            console.warn("⚠️ No se encontró cuerpo/asunto.")
            return true
        }

        const payload = {
            id: null,
            asunto: emailSubject,
            remitente: remitente,
            texto: `${emailSubject}\n${emailBody}`,
        }

        console.log("📡 Enviando contenido a API:", payload)

        const response = await fetch("http://localhost:5000/analizar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        })

        if (!response.ok) {
            console.error("❌ Error API:", response.status)
            return true
        }

        const data = await response.json()
        console.log("✅ Respuesta API:", data)

        if (data.etiqueta === "filtracion" || data.etiqueta === "sospechoso") {
            return false
        }
        return true
    } catch (error) {
        console.error("❌ Error llamando API:", error)
        return true
    }
}

// =======================
// 🔹 Función: mostrar banner en correos recibidos
// =======================
function mostrarBanner(mensaje, tipo = "warning") {
    // Eliminar banners previos
    document.querySelectorAll(".custom-alert-banner").forEach(el => el.remove())

    const banner = document.createElement("div")
    banner.className = "custom-alert-banner"
    banner.style.cssText = `
        background: ${tipo === "danger" ? "#ffcccc" : "#fff3cd"};
        color: ${tipo === "danger" ? "#900" : "#856404"};
        border: 1px solid ${tipo === "danger" ? "#f5c2c7" : "#ffeeba"};
        padding: 10px;
        margin: 10px 0;
        border-radius: 8px;
        font-weight: bold;
    `
    banner.textContent = mensaje

    const header = document.querySelector("h2.hP") // Asunto
    if (header && header.parentElement) {
        header.parentElement.prepend(banner)
    }
}

// =======================
// 🔹 Función: interceptar acciones
// =======================
function interceptSubmit() {
    const handleSubmit = async event => {
        const permitido = await checkEmailContent()
        if (!permitido) {
            event.preventDefault()
            event.stopPropagation()
            console.log("❌ Envío bloqueado por contenido sensible.")
            alert(
                "🚨 Este correo contiene información sensible y fue bloqueado."
            )
        }
    }

    // 📤 Envío con Ctrl+Enter
    document.body.addEventListener(
        "keydown",
        event => {
            if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
                handleSubmit(event)
            }
        },
        true
    )

    // 📤 Envío con click en "Enviar"
    document.body.addEventListener(
        "click",
        event => {
            const target = event.target
            if (target.closest('div[role="button"][data-tooltip^="Enviar"]')) {
                handleSubmit(event)
            }
        },
        true
    )

    // 📩 Auto-revisión de correos recibidos
    const observer = new MutationObserver(() => {
        const readingBodyElem = document.querySelector("div.a3s.aiL")
        if (readingBodyElem) {
            checkEmailContent().then(permitido => {
                if (!permitido) {
                    console.warn("🚨 Correo recibido sospechoso/filtración.")
                    mostrarBanner(
                        "⚠️ Cuidado: Este correo contiene información sensible o sospechosa.",
                        "danger"
                    )
                }
            })
        }
    })

    observer.observe(document.body, { childList: true, subtree: true })
}

// =======================
// 🚀 Iniciar
// =======================
interceptSubmit()
