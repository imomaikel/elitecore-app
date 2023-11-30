> This is a project that I started developing in March 2019 as a novice software developer who put all the code into one file and didn't know what was happening. It's a final version of this project rewritten to support the new game - ARK: Survival Ascended.

# Features

## Server Manager (Python)

This feature is used to control game servers and send real-time status to the Next.js app as well as to the Discord server widget. It keeps players aware of the current server status. Additionally, the application automatically initiates server restarts in the event of a crash.

-   User interface built using [ttkbootstrap](https://ttkbootstrap.readthedocs.io/en/latest/)
-   Lookup and manage processes using [psutil](https://pypi.org/project/psutil/)
-   Send real-time notifications using [socket](https://docs.python.org/3/library/socket.html)
-   Data storage using [MySQL](https://pypi.org/project/mysql-connector-python/)
-   Supporting only Windows

## Discord

The application is being rewritten. Update soon.

-   A custom widget that shows each server's status with player count and an option to join it
-   Realtime Discord notifications when server status changes

## Website

The application is being rewritten. Update soon.
