> This is a project that I started developing in March 2019 as a novice software developer who put all the code into one file and didn't know what was happening. The project has been evolving ever since. Here is the final version rewritten to support the new game - ARK: Survival Ascended.

# Major Features

## Website (TypeScript, Next.js)

- Website store with payments using [tebex](https://docs.tebex.io/developers)
- API routes built using [tRPC](https://trpc.io/)
- User Interface created using [shadcn](https://ui.shadcn.com/)
- State management (sidebar, shopping cart) using [zustand](https://github.com/pmndrs/zustand)
- Currency preferences using [exchangeratesapi](https://exchangeratesapi.io/)
- Real-time messages using [socket.io](https://socket.io/)
- Feature-rich admin panel
- Display products depending on the user's game
- Logs created at every action, displayed in a table with pagination
- 'For You' page that shows top products and a few randomly picked
- In-game logs with filters, sorting and pagination
- Mention of top customer and recent payments
- Monthly earnings goal
- Buying a product as a gift

## Server Manager (Python)

This feature is used to control game servers and send real-time status to the Next.js app as well as to the Discord server widget. It keeps players aware of the current server status. Additionally, the application automatically initiates server restarts in the event of a crash.

- User interface built using [ttkbootstrap](https://ttkbootstrap.readthedocs.io/en/latest/)
- Lookup and manage processes using [psutil](https://pypi.org/project/psutil/)
- Send real-time notifications using [Flask](https://pypi.org/project/Flask/)
- Data storage using [MySQL](https://pypi.org/project/mysql-connector-python/)
- Tracking player in-game playtime
- Supporting only Windows

## Discord (TypeScript)

The bot was built using module [discord.js](https://discord.js.org/)

- Image generation of in-game leader board using [node-html-to-image](https://www.npmjs.com/package/node-html-to-image/v/4.0.0) and [handlebars](https://handlebarsjs.com/)
- A custom widget that shows each server's status with player count and an option to join it
- Realtime Discord notifications when server status changes
- A custom widget that allows you to start, stop, or restart any server if you have permission
- A slash command that lets you see online players on each server
- Multi-bot presences that show each game server's players and status
- Countdown widget to a specified event

## Advanced Discord & Website Ticket System (TypeScript)

- Create and close the ticket both on the website and on Discord
- Send messages through both Discord and the website
- Multiple ticket categories with custom settings
- Custom user input verified by RegEX to prevent spam and unwanted tickets
- A custom select menu allows the user to select related server
- Website ticket logs (+ transcript download)
- Require authentication with the provider (Steam)
- Command that allows to add more people to the ticket
- Auto-delete attachments after X days to save disk space
- Limit ticket creation per user
- Creation confirmation
- Auto close empty tickets
- Support roles
- Banned role
- and various other features for an improved user experience
