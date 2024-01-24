> This is a project that I started developing in March 2019 as a novice software developer who put all the code into one file and didn't know what was happening. The project has been evolving ever since. Here is the final version rewritten to support the new game - ARK: Survival Ascended.

# Features

## Website (TypeScript, Next.js)

The application is being rewritten. Update soon.

- Website store with payments using [tebex](https://docs.tebex.io/developers)
- API routes built using [tRPC](https://trpc.io/)
- User Interface created using [shadcn](https://ui.shadcn.com/)
- State management (sidebar, shopping cart) using [zustand](https://github.com/pmndrs/zustand)
- Currency preferences using [exchangeratesapi](https://exchangeratesapi.io/)
- Logs created at every action, displayed in a table with pagination

## Server Manager (Python)

This feature is used to control game servers and send real-time status to the Next.js app as well as to the Discord server widget. It keeps players aware of the current server status. Additionally, the application automatically initiates server restarts in the event of a crash.

- User interface built using [ttkbootstrap](https://ttkbootstrap.readthedocs.io/en/latest/)
- Lookup and manage processes using [psutil](https://pypi.org/project/psutil/)
- Send real-time notifications using [Flask](https://pypi.org/project/Flask/)
- Data storage using [MySQL](https://pypi.org/project/mysql-connector-python/)
- Supporting only Windows

## Discord (TypeScript)

The application is being rewritten. Update soon.

The bot was built using module [discord.js](https://discord.js.org/)

- A custom widget that shows each server's status with player count and an option to join it
- Realtime Discord notifications when server status changes
- A custom widget that allows you to start, stop, or restart any server if you have permission
- A slash command that lets you see online players on each server
- Multi-bot presences that show each game server's players and status

## Advanced Discord & Website Ticket System (TypeScript)

- [x] Create and close the ticket both on the website and on Discord
- [ ] Send messages through both Discord and the website
- [x] Multiple ticket categories with custom settings
- [x] Custom user input verified by RegEX to prevent spam and unwanted tickets
- [x] A custom select menu allows the user to select related server
- [x] Website ticket logs (+ transcript download)
- [x] Require authentication with the provider (Steam)
- [x] Command that allows to add more people to the ticket
- [x] Auto-delete attachments after X days to save disk space
- [x] Limit ticket creation per user
- [x] Creation confirmation
- [x] Auto close empty tickets
- [x] Support roles
- [x] Banned role
- and various other features for an improved user experience
