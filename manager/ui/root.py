from ttkbootstrap.constants import *
from utils.constans import getIcon
from ui.menu import MainMenu
from ui.loader import Loader
import ttkbootstrap as ttk


# Root app window
class RootWindow(ttk.Window):
    def __init__(self):
        super().__init__(themename='darkly', iconphoto=None)
        self.withdraw()

        # Default font
        ttk.Style().configure('.', font=('Verdana', 12))
        # Bold Font
        ttk.Style().configure('bold.TLabel', font=('Verdana', 14, 'bold'))
        # Small font
        ttk.Style().configure('small.TLabel', font=('Verdana', 8))

        # Window settings
        self.iconphoto(True, ttk.PhotoImage(data=getIcon()))
        self.title('ARK: Server Manager')
        self.configure(padx=10, pady=10)

        # Frames
        self.menu = MainMenu(self)
        self.loader = Loader(self)

        # Set minimum size
        self.update()
        self.minsize(self.winfo_width(), self.winfo_height())

    def showLoader(self):
        self.menu.hide()
        self.loader.show()
        self.update()

    def hideLoader(self):
        self.loader.hide()
        self.menu.show()
        self.update()
