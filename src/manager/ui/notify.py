from tkinter.messagebox import showerror, showinfo, showwarning
from typing import Literal


# Display notify
def notify(message: str, type: Literal['error', 'info', 'warning']):
    if type == 'info':
        showinfo('ARK: Server Manager', message)
    elif type == 'error':
        showerror('ARK: Server Manager', message)
    elif type == 'warning':
        showwarning('ARK: Server Manager', message)
    return
