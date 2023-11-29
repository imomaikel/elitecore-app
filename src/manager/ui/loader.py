from ttkbootstrap.constants import *
import ttkbootstrap as ttk


# Loader UI
class Loader(ttk.Frame):
    def __init__(self, container):
        super().__init__(container)

        ttk.Label(self, text='Please Wait...',
                  style='bold.TLabel').pack(expand=True, pady=10)

    def hide(self):
        self.pack_forget()

    def show(self):
        self.pack(expand=True)
