'use client';
import { useState } from 'react';
import { trpc } from '@/trpc';

export default function Home() {
    const [messageLabel, setMessageLabel] = useState<null | string>(null);
    const [databaseAddLabel, setDatabaseAddLabel] = useState<null | string>(
        null,
    );
    const [databaseFetchLabel, setDatabaseFetchLabel] = useState<null | string>(
        null,
    );

    // Handle send message form
    const messageFormSubmit = async (form: FormData) => {
        const content = form.get('messageContent') as string;
        const channelId = form.get('channelId') as string;

        sendMessage({ channelId, content });
    };
    // tRPC send Discord message
    const { mutate: sendMessage, isLoading: messageLoading } =
        trpc.sendMessage.useMutation({
            onSuccess: (data) => {
                setMessageLabel(data);
            },
            onError: (error) => {
                console.log(error);
                setMessageLabel('Error in the console.');
            },
        });

    // tRPC add user
    const { mutate: addUser, isLoading: addUserLoading } =
        trpc.addUser.useMutation({
            onSuccess: (data) => {
                setDatabaseAddLabel(`Added, ID: ${data.id}`);
            },
            onError: (error) => {
                console.log(error);
                setDatabaseAddLabel('Error in the console');
            },
        });

    // tRPC get users
    const { mutate: getUsers, isLoading: getUsersLoading } =
        trpc.getUsers.useMutation({
            onSuccess: (data) => {
                console.table(data);
                setDatabaseFetchLabel('Result in the console');
            },
            onError: (error) => {
                console.log(error);
                setDatabaseFetchLabel('Error in the console');
            },
        });

    // Handle database add form submit
    const addUserFormSubmit = (form: FormData) => {
        const name = form.get('userName') as string;
        addUser({ name });
    };

    // Handle database fetch form submit
    const fetchFormSubmit = () => {
        getUsers();
    };

    return (
        <div className="bg-black w-full min-h-screen flex justify-center items-center flex-col gap-x-0 gap-y-20 lg:gap-x-20 lg:flex-row p-10 lg:p-0">
            <div className="text-white relative">
                <h1 className="font-semibold text-4xl mb-5">
                    Send a test message
                </h1>
                <form action={messageFormSubmit}>
                    <div className="flex flex-col space-y-2">
                        <label htmlFor="messageContent">
                            Enter message content
                        </label>
                        <input
                            type="text"
                            className="rounded-md p-3 bg-black border border-white outline-none"
                            name="messageContent"
                            disabled={messageLoading}
                            id="messageContent"
                        />
                    </div>
                    <div className="my-6" />
                    <div className="flex flex-col space-y-2">
                        <label htmlFor="channelId">Enter channel id</label>
                        <input
                            type="text"
                            disabled={messageLoading}
                            className="rounded-md p-3 bg-black border border-white outline-none"
                            name="channelId"
                            id="channelId"
                        />
                    </div>
                    <button
                        disabled={messageLoading}
                        type="submit"
                        className="mt-10 rounded-md bg-sky-400 w-full h-12 text-4xl text-black font-semibold transition hover:bg-sky-600"
                    >
                        Send
                    </button>
                </form>
                <div className="absolute -bottom-12 text-xl w-full text-center">
                    {messageLabel}
                </div>
            </div>
            <div className="flex flex-col gap-16">
                <div className="text-white relative">
                    <h1 className="font-semibold text-4xl mb-5">
                        Database Add
                    </h1>
                    <form action={addUserFormSubmit}>
                        <div className="flex flex-col space-y-2">
                            <label htmlFor="userName">Enter user name</label>
                            <input
                                type="text"
                                className="rounded-md p-3 bg-black border border-white outline-none"
                                name="userName"
                                disabled={addUserLoading}
                                id="userName"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={addUserLoading}
                            className="mt-5 rounded-md bg-sky-400 w-full h-12 text-4xl text-black font-semibold transition hover:bg-sky-600"
                        >
                            Add
                        </button>
                    </form>
                    <div className="absolute -bottom-14 text-xl w-full text-center">
                        {databaseAddLabel}
                    </div>
                </div>
                <div className="text-white relative">
                    <h1 className="font-semibold text-4xl mb-5">
                        Database Fetch
                    </h1>
                    <form action={fetchFormSubmit}>
                        <button
                            type="submit"
                            disabled={getUsersLoading}
                            className="mt-5 rounded-md bg-sky-400 w-full h-12 text-4xl text-black font-semibold transition hover:bg-sky-600"
                        >
                            Fetch
                        </button>
                    </form>
                    <div className="absolute -bottom-14 text-xl w-full text-center">
                        {databaseFetchLabel}
                    </div>
                </div>
            </div>
        </div>
    );
}
