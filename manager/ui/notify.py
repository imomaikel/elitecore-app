from ttkbootstrap.toast import *
from typing import Literal

# Store the last toast
lastToast = None


# Display the notification
def notify(message: str, type: Literal['error', 'info', 'warning']):

    # Destroy the last toast
    global lastToast
    if not lastToast == None:
        try:
            lastToast.hide_toast()
        except:
            pass

    style = DANGER if type == 'error' else WARNING if type == 'warning' else INFO
    toast = ToastNotification(
        title='ARK: Server Manager',
        message=message,
        duration=1500,
        alert=True,
        position=(15, 65, 'se'),
        bootstyle=style
    )

    lastToast = toast

    toast.show_toast()

    return
