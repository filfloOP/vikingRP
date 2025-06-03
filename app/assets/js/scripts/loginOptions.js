// Fonction globale pour être accessible à uibinder.js
function loginOptionsCancelEnabled(val){
    const loginOptionsCancelContainer = document.getElementById('loginOptionCancelContainer')
    if(val){
        $(loginOptionsCancelContainer).show()
    } else {
        $(loginOptionsCancelContainer).hide()
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const loginOptionMicrosoft = document.getElementById('loginOptionMicrosoft')
    const loginOptionMojang = document.getElementById('loginOptionMojang')
    const loginOptionsCancelButton = document.getElementById('loginOptionCancelButton')
    const loginOptionCrack = document.getElementById('loginOptionCrack')
    // Modale crack
    const crackModalOverlay = document.getElementById('crackModalOverlay')
    const crackModalInput = document.getElementById('crackModalInput')
    const crackModalError = document.getElementById('crackModalError')
    const crackModalValidate = document.getElementById('crackModalValidate')
    const crackModalCancel = document.getElementById('crackModalCancel')

    let loginOptionsViewOnLoginSuccess
    let loginOptionsViewOnLoginCancel
    let loginOptionsViewOnCancel = VIEWS.settings
    let loginOptionsViewCancelHandler

    if(loginOptionMicrosoft) {
        loginOptionMicrosoft.onclick = (e) => {
            switchView(getCurrentView(), VIEWS.waiting, 500, 500, () => {
                ipcRenderer.send(
                    MSFT_OPCODE.OPEN_LOGIN,
                    loginOptionsViewOnLoginSuccess,
                    loginOptionsViewOnLoginCancel
                )
            })
        }
    }
    if(loginOptionMojang) {
        loginOptionMojang.onclick = (e) => {
            switchView(getCurrentView(), VIEWS.login, 500, 500, () => {
                loginViewOnSuccess = loginOptionsViewOnLoginSuccess
                loginViewOnCancel = loginOptionsViewOnLoginCancel
                loginCancelEnabled(true)
            })
        }
    }
    if(loginOptionsCancelButton) {
        loginOptionsCancelButton.onclick = (e) => {
            switchView(getCurrentView(), loginOptionsViewOnCancel, 500, 500, () => {
                // Clear login values (Mojang login)
                // No cleanup needed for Microsoft.
                loginUsername.value = ''
                loginPassword.value = ''
                if(loginOptionsViewCancelHandler != null){
                    loginOptionsViewCancelHandler()
                    loginOptionsViewCancelHandler = null
                }
            })
        }
    }
    if (loginOptionCrack && crackModalOverlay && crackModalInput && crackModalError && crackModalValidate && crackModalCancel) {
        function openCrackModal() {
            crackModalInput.value = ''
            crackModalError.textContent = ''
            crackModalOverlay.style.display = 'flex'
            setTimeout(() => crackModalInput.focus(), 100)
        }
        function closeCrackModal() {
            crackModalOverlay.style.display = 'none'
        }
        window.openCrackModal = openCrackModal
        loginOptionCrack.onclick = (e) => {
            openCrackModal()
        }
        function validateCrackName(name) {
            if(!name) return 'Le pseudo est requis.'
            if(name.length < 3 || name.length > 16) return '3 à 16 caractères.'
            if(/[^a-zA-Z0-9_]/.test(name)) return 'Lettres, chiffres, underscore seulement.'
            return null
        }
        crackModalValidate.onclick = () => {
            const name = crackModalInput.value.trim()
            const err = validateCrackName(name)
            if(err) {
                crackModalError.textContent = err
                crackModalInput.focus()
                return
            }
            function uuidv4() {
                return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8)
                    return v.toString(16)
                })
            }
            const uuid = uuidv4()
            ConfigManager.addCrackAccount(uuid, name)
            ConfigManager.save()
            if(typeof ConfigManager.setSelectedAccount === 'function') {
                ConfigManager.setSelectedAccount(uuid)
            } else {
                ConfigManager.selectedAccount = uuid
            }
            if(typeof updateSelectedAccount === 'function') updateSelectedAccount(ConfigManager.getSelectedAccount())
            closeCrackModal()
            switchView(getCurrentView(), VIEWS.landing)
        }
        crackModalCancel.onclick = () => {
            closeCrackModal()
            switchView(getCurrentView(), loginOptionsViewOnCancel || VIEWS.loginOptions)
        }
        crackModalInput.addEventListener('keydown', (e) => {
            if(e.key === 'Enter') {
                crackModalValidate.click()
            }
        })
        crackModalOverlay.addEventListener('click', (e) => {
            if(e.target === crackModalOverlay) closeCrackModal()
        })
    }
});